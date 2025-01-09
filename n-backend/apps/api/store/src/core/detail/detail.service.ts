import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import firestore, { DocumentReference } from '@google-cloud/firestore';
import {
  Store,
  StoreAnnouncement,
  StoreDetail,
  OmitTimestampStore,
  OmitTimestampStoreDetail,
  STORES_COLLECTION_NAME,
  STORES_DETAIL_COLLECTION_NAME,
  STORES_ANNOUNCEMENTS_COLLECTION_NAME,
} from '@fera-next-gen/types';

import { DetailMuleApiService } from './detail-mule-api/detail-mule-api.service';
import { DetailDto } from './dto/detail.dto';
import { MuleStoreResponse } from './interfaces/mule-api-detail.interface';
import { DetailApiResponse } from './interfaces/detail.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class DetailService {
  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly detailMuleService: DetailMuleApiService,
    private readonly commonService: CommonService,
  ) {}

  public async getDetail(detailDto: DetailDto): Promise<DetailApiResponse[]> {
    const muleData = await this.detailMuleService.getDetailFromMule(detailDto);
    return this.transformApiResponse(muleData);
  }

  public async saveToFirestore(
    details: DetailApiResponse[],
    operatorName: string,
  ) {
    this.logger.debug('start saving to firestore');

    try {
      const storeCollection = this.firestoreBatchService.findCollection(
        STORES_COLLECTION_NAME,
      );

      await Promise.all(
        details.map(async (detail) => {
          const hashStoreCode = this.commonService.createMd5(detail.code);
          const storeDocRef = storeCollection.doc(hashStoreCode);

          await this.batchSetBasic(storeDocRef, detail, operatorName);

          await this.batchSetDetail(storeDocRef, detail, operatorName);

          await this.deleteAnnouncement(storeDocRef);
          await this.batchSetAnnouncement(storeDocRef, detail, operatorName);
        }),
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(`Save to firestore is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.DETAIL_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: muleAPIが完成次第要修正
  private transformApiResponse(
    muleData: MuleStoreResponse[],
  ): DetailApiResponse[] {
    return muleData.map((data) => ({
      ...data,
      detail: {
        ...data.detail,
        supportFlyer: false,
        supportProductMap: false,
        messageSettings: data.detail.messageSettings.map((setting) => ({
          ...setting,
        })),
      },
    }));
  }

  /**
   * firestoreに基本情報を保存
   */
  private async batchSetBasic(
    docRef: DocumentReference,
    detail: DetailApiResponse,
    operatorName: string,
  ): Promise<void> {
    this.logger.debug('start batchSetBasic');
    try {
      const storeItems: OmitTimestampStore = {
        code: detail.code,
        name: detail.name,
        address: detail.address,
        postCode: detail.postCode,
        telNumberList: detail.telNumberList,
        businessTime: detail.businessTime,
        businessTimeNote: detail.businessTimeNote,
        regularHoliday: detail.regularHoliday,
        regularHolidayNote: detail.regularHolidayNote,
      };
      let saveData: Store;
      const oldStore = await docRef.get();
      if (oldStore.exists) {
        // 更新の場合
        saveData = {
          ...storeItems,
          createdAt: oldStore.data().createdAt,
          createdBy: oldStore.data().createdBy,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      } else {
        // 新規の場合
        saveData = {
          ...storeItems,
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      }

      await this.firestoreBatchService.batchSet(docRef, saveData, {
        merge: true,
      });
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${STORES_COLLECTION_NAME}/${detail.code} is failed`,
        e,
      );
      throw e;
    }

    this.logger.debug('end batchSetBasic');
  }

  /**
   * firestoreに詳細情報を保存
   */
  private async batchSetDetail(
    docRef: DocumentReference,
    detail: DetailApiResponse,
    operatorName: string,
  ): Promise<void> {
    this.logger.debug('start batchSetDetail');
    try {
      const detailDocRef = docRef
        .collection(STORES_DETAIL_COLLECTION_NAME)
        .doc(detail.code);

      const oldDetailData = await detailDocRef.get();

      const detailItems = this.generateStoreDetail(detail);
      let saveData: StoreDetail;

      if (oldDetailData.exists) {
        // 更新の場合
        saveData = {
          ...detailItems,
          // firestore腹持ち項目
          supportFlyer: oldDetailData.data().supportFlyer,
          supportProductMap: oldDetailData.data().supportProductMap,
          // timestamp
          createdAt: oldDetailData.data().createdAt,
          createdBy: oldDetailData.data().createdBy,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      } else {
        // 新規の場合
        saveData = {
          ...detailItems,
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      }

      await this.firestoreBatchService.batchSet(detailDocRef, saveData, {
        merge: true,
      });
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${STORES_COLLECTION_NAME}.${STORES_DETAIL_COLLECTION_NAME}/${detail.code} is failed`,
        e,
      );
      throw e;
    }

    this.logger.debug('end batchSetDetail');
  }

  /**
   * firestoreから一度お知らせ情報を削除する
   */
  private async deleteAnnouncement(docRef: DocumentReference): Promise<void> {
    this.logger.debug('start deleteAnnouncement');
    try {
      const oldDoc = await docRef
        .collection(STORES_ANNOUNCEMENTS_COLLECTION_NAME)
        .get();

      await Promise.all(
        oldDoc.docs.map(async (doc) => {
          await this.firestoreBatchService.batchDelete(doc.ref);
        }),
      );
    } catch (e: unknown) {
      this.commonService.logException(
        `delete to firestore/${STORES_COLLECTION_NAME}.${STORES_ANNOUNCEMENTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw e;
    }

    this.logger.debug('end deleteAnnouncement');
  }

  /**
   * firestoreに店舗からのお知らせ情報を保存
   */
  private async batchSetAnnouncement(
    docRef: DocumentReference,
    { announcements }: DetailApiResponse,
    operatorName: string,
  ): Promise<void> {
    this.logger.debug('start batchSetAnnouncement');
    try {
      announcements.forEach(async (announcement) => {
        const detailDocRef = docRef
          .collection(STORES_ANNOUNCEMENTS_COLLECTION_NAME)
          .doc();

        const saveData: StoreAnnouncement = {
          storeCode: announcement.code,
          title: announcement.title,
          body: announcement.body,

          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };

        await this.firestoreBatchService.batchSet(detailDocRef, saveData, {
          merge: true,
        });
      });
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${STORES_COLLECTION_NAME}.${STORES_ANNOUNCEMENTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw e;
    }

    this.logger.debug('end batchSetAnnouncement');
  }

  private generateStoreDetail({
    detail,
  }: DetailApiResponse): OmitTimestampStoreDetail {
    return {
      code: detail.code,
      landscape: new firestore.GeoPoint(
        detail.landscape.latitude,
        detail.landscape.longitude,
      ),
      floorGuideList: detail.floorGuideList,
      prefectureName: detail.prefectureName,
      prefectureCode: detail.prefectureCode,
      openingDate: firestore.Timestamp.fromDate(new Date(detail.openingDate)),
      closingDate: firestore.Timestamp.fromDate(new Date(detail.openingDate)),
      supportPickup: detail.supportPickup,
      supportPickupInnerLocker: detail.supportPickupInnerLocker,
      supportPickupPlace: detail.supportPickupPlace,
      supportPickupPlaceParking: detail.supportPickupPlaceParking,
      supportGeomagnetism: detail.supportGeomagnetism,
      geomagnetismMapId: detail.geomagnetismMapId,
      supportPocketRegi: detail.supportPocketRegi,
      supportCuttingService: detail.supportCuttingService,
      supportDIYReserve: detail.supportDIYReserve,
      supportDogRun: detail.supportDogRun,
      supportToolRental: detail.supportToolRental,
      showVisitingNumber: detail.showVisitingNumber,
      messageSettings: detail.messageSettings.map((setting) => ({
        title: setting.title,
        from: firestore.Timestamp.fromDate(new Date(setting.from)),
        to: firestore.Timestamp.fromDate(new Date(setting.to)),
        message: setting.message,
      })),
      digitalFlyerURL: detail.digitalFlyerURL,
      materialHallExistence: detail.materialHallExistence,
      cultureClassExistence: detail.cultureClassExistence,
      cycleParkExistence: detail.cycleParkExistence,
      DIYSTYLEFloorExistence: detail.DIYSTYLEFloorExistence,
      dogParkExistence: detail.dogParkExistence,
      exteriorPlazaExistence: detail.exteriorPlazaExistence,
      foodAreaExistence: detail.foodAreaExistence,
      gardeningHallExistence: detail.gardeningHallExistence,
      greenAdvisorExistence: detail.greenAdvisorExistence,
      petsOneExistence: detail.petsOneExistence,
      reformCenterExistence: detail.reformCenterExistence,
      workshopExistence: detail.workshopExistence,
      storePickupExistence: detail.storePickupExistence,
      supermarketExistence: detail.supermarketExistence,

      mainBuildingOpeningTime: firestore.Timestamp.fromDate(
        new Date(detail.mainBuildingOpeningTime),
      ),
      mainBuildingClosingTime: firestore.Timestamp.fromDate(
        new Date(detail.mainBuildingClosingTime),
      ),
      resourceBuildingOpeningTime: firestore.Timestamp.fromDate(
        new Date(detail.ResourceBuildingOpeningTime),
      ),
      resourceBuildingClosingTime: firestore.Timestamp.fromDate(
        new Date(detail.ResourceBuildingClosingTime),
      ),
      storeMapUrl: detail.storeMapUrl,
      visible: detail.visible,
      publiclyAccessible: detail.publiclyAccessible,
      publiclyAccessibleFrom: firestore.Timestamp.fromDate(
        new Date(detail.publiclyAccessibleFrom),
      ),
      publiclyAccessibleTo: firestore.Timestamp.fromDate(
        new Date(detail.publiclyAccessibleTo),
      ),
      renovationDateFrom: detail.renovationDateFrom
        ? firestore.Timestamp.fromDate(new Date(detail.renovationDateFrom))
        : null,
      renovationDateTo: detail.renovationDateFrom
        ? firestore.Timestamp.fromDate(new Date(detail.renovationDateTo))
        : null,
      temporarilyClosedFrom: detail.renovationDateFrom
        ? firestore.Timestamp.fromDate(new Date(detail.temporarilyClosedFrom))
        : null,
      temporarilyClosedTo: detail.renovationDateFrom
        ? firestore.Timestamp.fromDate(new Date(detail.temporarilyClosedTo))
        : null,
      supportFacilityReservation: false,

      // Firestore腹持ち項目は一旦falseをセット
      supportFlyer: false,
      supportProductMap: false,
    };
  }
}
