import mysql from 'mysql2/promise';
import dayjs from 'dayjs';

import firestore, { CollectionReference } from '@google-cloud/firestore';

import { LoggingService } from '@fera-next-gen/logging';
import {
  Flyer,
  OmitTimestampFlyer,
  StoreFlyer,
  Timestamp,
  FLYERS_COLLECTION_NAME,
  STORES_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@fera-next-gen/common';

import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LegacyFlyerList, StoreFlyerList } from './interface/flyer.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { StorageClientService } from './storage-client/storage-client.service';

@Injectable()
export class FlyerImportService {
  private readonly APP_NAME = 'flyer_import_batch';

  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly storage: StorageClientService,
  ) {}

  async import() {
    this.logger.debug('start flyer import');
    const rowData = await this.getFlyerDataFromDB();

    const data = await this.generateFlyer(rowData);

    await this.saveToFirestore(data);
    this.logger.debug('end flyer import');
  }

  private async getFlyerDataFromDB() {
    this.logger.debug('start get data from legacy DB');
    const dbConfig = this.getLegacyDbConfig();
    let data = [];
    let connection;
    try {
      // 旧プロジェクトからデータを取得
      connection = await mysql.createConnection(dbConfig);
      const sql = this.getQuery();
      const nowDate = dayjs().tz('Asia/Tokyo').format('YYYYMMDD');
      const queryParams = [nowDate, nowDate];
      const [rows] = await connection.execute(sql, queryParams);
      data = Object.values(JSON.parse(JSON.stringify(rows)));
      // this.logger.debug(`get ${data.length} of records`);
    } catch (e) {
      this.commonService.logException(
        `import  error. failed to connect legacy DB`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_CONNECT_LEGACY_DB]);
    } finally {
      connection.end();
    }
    this.logger.debug('end get data from legacy DB');
    return data;
  }

  private getQuery(): string {
    return `SELECT DISTINCT
    cso.campaign_id AS campaign_id,
    cso.plan_id AS plan_id,
    cso.store_code AS store_code,
    "新着チラシ" AS campaign_title,
    cpo.start_date AS campaign_start,
    cpo.stop_date AS campaign_stop,
    ci.head_image_url as head_image_url,
    ci.tail_image_url as tail_image_url
  FROM campaign_store_output as cso
  INNER JOIN campaign_plan_output AS cpo
    ON cso.campaign_id = cpo.campaign_id
    AND cso.plan_id = cpo.plan_id
    AND cpo.plan_status_code in ('020','030')
    AND cpo.delete_flag <> '1'
    AND CAST(cpo.start_date AS UNSIGNED) <= ?
    AND CAST(cpo.stop_date AS UNSIGNED) >= ?
  INNER JOIN campaign_item_output AS cio
    ON cio.campaign_id = cso.campaign_id
    AND cio.plan_id = cso.plan_id
    AND cio.delete_flag <> '1'
    AND COALESCE(cio.selling_price, 0) != 0
  LEFT JOIN campaign_item_output AS cio2
    ON cio2.campaign_id = cio.campaign_id
    AND cio2.plan_id = cio.plan_id
    AND cio2.fix_dpt_code = cio.fix_dpt_code
    AND cio.fix_doc_id < cio2.fix_doc_id
  INNER JOIN campaign_output AS co
    ON co.campaign_id = cso.campaign_id
    AND co.delete_flag <> '1'
    AND co.campaign_type in ('10','11','12','40')
  INNER JOIN item_master AS im
    ON im.hojin_cd = '24'
    AND cio.item_code = im.prd_cd
  LEFT JOIN item_master AS im2
    ON im2.hojin_cd = im.hojin_cd
    AND im2.prd_no = im.prd_no
    AND im.prd_no_br_no < im2.prd_no_br_no
  INNER JOIN store_item AS si
    ON si.hojin_cd = im.hojin_cd
   AND si.prd_no = im.prd_no
   AND si.prd_no_br_no = im.prd_no_br_no
   AND si.tenpo_cd = cso.store_code
  INNER JOIN price_master AS pm
    ON pm.hojin_cd = si.hojin_cd
    AND pm.prd_no = si.prd_no
    AND pm.prd_no_br_no = si.prd_no_br_no
    AND pm.genka_baika_seq_no = si.genka_baika_seq_no
    AND COALESCE(pm.baika, 0) != 0
  LEFT JOIN campaign_image AS ci
    ON ci.campaign_id = cso.campaign_id
    AND ci.plan_id = cso.plan_id
    AND ci.store_code = cso.store_code
  WHERE cso.delete_flag <> '1'
    AND cio2.fix_doc_id IS NULL
    AND im2.prd_no_br_no IS NULL
    AND ci.head_image_url IS NOT NULL
    AND STR_TO_DATE(concat( cpo.start_date,'21'),'%Y%m%d%H') <= now()
  ORDER BY cpo.start_date DESC, CONCAT(cso.campaign_id, cso.plan_id) DESC`;
  }

  private getLegacyDbConfig() {
    const currentEnv = this.env.get<string>('APP_ENV');
    const baseDbConfig = {
      user: this.env.get<string>('LEGACY_MYSQL_USER_NAME'),
      database: this.env.get<string>('LEGACY_MYSQL_DB_NAME'),
      password: this.env.get<string>('LEGACY_MYSQL_PASSWORD'),
    };

    let connection: object;

    if (currentEnv === 'local') {
      // ローカル環境の場合
      connection = {
        host: this.env.get<string>('LEGACY_MYSQL_ADDRESS'),
      };
    } else {
      // cloud run環境の場合
      connection = {
        socketPath: this.env.get<string>('LEGACY_MYSQL_UNIX_SOCKET'),
      };
    }
    const dbConfig = {
      ...baseDbConfig,
      ...connection,
    };
    return dbConfig;
  }

  private async saveToFirestore(flyers: OmitTimestampFlyer[]) {
    this.logger.debug('start save to firestore');
    // firestoreへ保存を行う
    try {
      const flyerCollection = this.firestoreBatchService.findCollection(
        FLYERS_COLLECTION_NAME,
      );

      const storeFlyers: StoreFlyerList = {};

      // flyer登録
      await Promise.all(
        flyers.map(async (flyer) => {
          const { storeCode } = flyer;
          const docRef = await this.batchSetFlyer(flyerCollection, flyer);

          // store.flyersにデータを入れるため、storeCodeをキーとするdocumentReferenceの配列を作る
          if (typeof storeFlyers[storeCode] === 'undefined') {
            storeFlyers[storeCode] = [];
          }
          storeFlyers[storeCode].push(docRef);
        }),
      );

      await this.batchSetStoreFlyer(storeFlyers);

      await this.batchDeleteOutdatedFlyer(flyerCollection);

      await this.firestoreBatchService.batchCommit();
      this.logger.debug('end save to firestore');
    } catch (e) {
      this.commonService.logException(`import  error. invalid time string`, e);
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_UNEXPECTED]);
    }
  }

  private async batchDeleteOutdatedFlyer(flyerCollection: CollectionReference) {
    this.logger.debug('start batchDeleteOutdatedFlyer');
    try {
      // endDateが過去の日付であるチラシの削除を行う
      const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
      const outdatedFlyers = await flyerCollection
        .where('endDate', '<', firestore.Timestamp.fromDate(new Date(today)))
        .select()
        .get();
      await Promise.all(
        outdatedFlyers.docs.map(async (doc) => {
          const oldFlyerDocRef = doc.ref;
          await this.firestoreBatchService.batchDelete(oldFlyerDocRef);
        }),
      );
    } catch (e) {
      this.commonService.logException(`delete old data is failed`, e);
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_STORE_TO_DB]);
    }
    this.logger.debug('end batchDeleteOutdatedFlyer');
  }

  private async batchSetFlyer(
    flyerCollection: CollectionReference,
    flyer: OmitTimestampFlyer,
  ) {
    this.logger.debug('start batchSetFlyer');
    try {
      const docId = this.commonService.createMd5(
        `${flyer.campaignId}_${flyer.planId}_${flyer.storeCode}`,
      );
      // flyer登録
      const flyerDocRef = flyerCollection.doc(docId);
      const oldFlyer = await flyerDocRef.get();
      let saveFlyerData: Flyer;

      if (oldFlyer.exists) {
        saveFlyerData = {
          ...flyer,
          createdBy: oldFlyer.data()?.createdBy,
          createdAt: oldFlyer.data()?.createdAt,
          updatedBy: this.APP_NAME,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      } else {
        // 新規の場合
        saveFlyerData = {
          ...flyer,
          createdBy: this.APP_NAME,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: this.APP_NAME,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }
      await this.firestoreBatchService.batchSet(flyerDocRef, saveFlyerData, {
        merge: true,
      });
      this.logger.debug('end batchSetFlyer');
      return flyerDocRef;
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${FLYERS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_STORE_TO_DB]);
    }
  }

  private async batchSetStoreFlyer(storeFlyers: StoreFlyerList) {
    this.logger.debug('start batchSetStoreFlyer');

    try {
      const storeCollection = this.firestoreBatchService.findCollection(
        STORES_COLLECTION_NAME,
      );

      const stores = await storeCollection.get();

      await Promise.all(
        stores.docs.map(async (doc) => {
          const storeDocId = doc.id;
          const storeCode = doc.data()?.code;
          const storeFlyerDocRef = storeCollection
            .doc(storeDocId)
            .collection(FLYERS_COLLECTION_NAME)
            .doc(storeCode);

          if (typeof storeFlyers[storeCode] === 'undefined') {
            // 店舗に新たなチラシがない場合は削除
            this.firestoreBatchService.batchDelete(storeFlyerDocRef);
          } else {
            // 店舗のチラシ参照先を登録・更新
            const flyerList = storeFlyers[storeCode];
            const oldStoreFlyer = await storeFlyerDocRef.get();
            let flyerData: StoreFlyer;
            if (oldStoreFlyer.exists) {
              // レコード更新
              flyerData = {
                flyerRefIds: flyerList,
                createdBy: oldStoreFlyer.data()?.createdBy,
                createdAt: oldStoreFlyer.data()?.createdAt,
                updatedBy: this.APP_NAME,
                updatedAt: firestore.FieldValue.serverTimestamp(),
              };
            } else {
              // 新レコード登録
              flyerData = {
                flyerRefIds: flyerList,
                createdBy: this.APP_NAME,
                createdAt: firestore.FieldValue.serverTimestamp(),
                updatedBy: this.APP_NAME,
                updatedAt: firestore.FieldValue.serverTimestamp(),
              };
            }
            await this.firestoreBatchService.batchSet(
              storeFlyerDocRef,
              flyerData,
              {
                merge: true,
              },
            );
          }
        }),
      );
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${STORES_COLLECTION_NAME}.${FLYERS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_STORE_TO_DB]);
    }

    this.logger.debug('end batchSetStoreFlyer');
  }

  private async generateFlyer(flyers: object[]) {
    const transData: OmitTimestampFlyer[] = [];
    await Promise.all(
      flyers.map(async (row) => {
        const sourceFlyer = row as LegacyFlyerList;
        const frontImageUrl =
          (await this.storage.generateSignedUrl(sourceFlyer.head_image_url)) ??
          '';
        const backImageUrl = await this.storage.generateSignedUrl(
          sourceFlyer.tail_image_url,
        );
        const res: OmitTimestampFlyer = {
          campaignId: sourceFlyer.campaign_id,
          planId: sourceFlyer.plan_id,
          storeCode: sourceFlyer.store_code,
          startDate: this.convertToTimestamp(sourceFlyer.campaign_start),
          endDate: this.convertToTimestamp(sourceFlyer.campaign_stop),
          frontImageUrl,
          backImageUrl,
          title: sourceFlyer.campaign_title,
        };
        transData.push(res);
      }),
    );
    return transData;
  }

  private convertDateToJstTimestampString(sourceDate: string): string {
    // No hyphen(19900101) pattern
    const noHyphenRegex = /^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/;
    if (noHyphenRegex.test(sourceDate)) {
      const year = sourceDate.substring(0, 4);
      const month = sourceDate.substring(4, 6);
      const day = sourceDate.substring(6, 8);
      const expectedDate = `${year}-${month}-${day}T00:00:00+09:00`;
      return expectedDate;
    }
    // No matched
    return sourceDate;
  }

  private convertToTimestamp(timestampString: string): Timestamp {
    try {
      return firestore.Timestamp.fromDate(
        new Date(this.convertDateToJstTimestampString(timestampString)),
      );
    } catch (e) {
      this.commonService.logException('import  error. invalid time string.', e);
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_UNEXPECTED]);
    }
  }
}
