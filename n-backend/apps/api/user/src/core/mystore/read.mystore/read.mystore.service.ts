import dayjs from 'dayjs';

import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  Mystore,
  USERS_COLLECTION_NAME,
  USERS_MYSTORES_COLLECTION_NAME,
  STORES_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CommonService } from '@cainz-next-gen/common';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import {
  MystoreRecord,
  MystoreListWithStoreCodeKey,
} from '../interface/mystore-response.interface';

@Injectable()
export class ReadMystoreService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  async getMystore(encryptedMemberId: string): Promise<MystoreRecord[]> {
    this.logger.debug('start get mystore');

    const res: MystoreRecord[] = [];
    const mystoreList: MystoreListWithStoreCodeKey = {};
    const savedMystore = await this.getMystoreFromFirestore(encryptedMemberId);
    if (savedMystore.exists) {
      const storeList = savedMystore.data()?.myStores as Array<Mystore>;
      const storeCodeList = [];
      // データをマージするためstoreCodeをキーとした配列を作る
      storeList.forEach((store) => {
        const tempMystore: MystoreRecord = {
          code: store.code,
          name: '',
          address: '',
          businessTime: '',
          isFavoriteStore: store.isFavoriteStore,
          originalCreatedAt: dayjs(store.originalCreatedAt.toDate())
            .tz('Asia/Tokyo')
            .format(),
        };
        const storeCode = store.code;
        mystoreList[storeCode] = tempMystore;
        // firestoreのstoreで絞り込みを行うためstoreCodeだけのArrayを作る
        storeCodeList.push(storeCode);
      });

      // 店舗の情報を取得
      const storeQuery = await this.getStoreFromFirestore(storeCodeList);
      // 店舗の情報をマージ
      storeQuery.docs.forEach((doc) => {
        const storeCode = doc.data()?.code as string;
        if (typeof mystoreList[storeCode] !== 'undefined') {
          mystoreList[storeCode].name = doc.data()?.name;
          mystoreList[storeCode].address = doc.data()?.address;
          mystoreList[storeCode].businessTime = doc.data()?.businessTime;
        }
        res.push(mystoreList[storeCode]);
      });
    }

    this.logger.debug('end get mystore');

    return res;
  }

  private async getMystoreFromFirestore(encryptedMemberId: string) {
    try {
      // ユーザが保持するmystoreを取得
      const mystoreDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(USERS_MYSTORES_COLLECTION_NAME)
        .doc(encryptedMemberId);

      return await mystoreDocRef.get();
    } catch (e: unknown) {
      this.commonService.logException(
        `Get mystore data from firestore is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_GET_FROM_DB,
          message: ErrorMessage[ErrorCode.MYSTORE_GET_FROM_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getStoreFromFirestore(storeCodeList: Array<string>) {
    try {
      // 店舗の情報を取得
      const storeCollection = this.firestoreBatchService.findCollection(
        STORES_COLLECTION_NAME,
      );

      return await storeCollection.where('code', 'in', storeCodeList).get();
    } catch (e: unknown) {
      this.commonService.logException(
        `Get store data from firestore is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_GET_FROM_DB,
          message: ErrorMessage[ErrorCode.MYSTORE_GET_FROM_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
