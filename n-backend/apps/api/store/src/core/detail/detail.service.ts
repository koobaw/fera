import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import firestore, { DocumentReference } from '@google-cloud/firestore';
import {
  Store,
  StoreAnnouncement,
  StoreDetail,
  STORES_COLLECTION_NAME,
  STORES_DETAIL_COLLECTION_NAME,
  STORES_ANNOUNCEMENTS_COLLECTION_NAME,
} from '@cainz-next-gen/types';

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
      const saveData: Store = {
        code: detail.code,
        name: detail.name,
        address: detail.address,
        postCode: detail.postCode,
        telNumberList: detail.telNumberList,
        businessTime: detail.businessTime,
        businessTimeNote: detail.businessTimeNote,
        regularHoliday: detail.regularHoliday,
        regularHolidayNote: detail.regularHolidayNote,

        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: operatorName,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        updatedBy: operatorName,
      };

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
    { detail }: DetailApiResponse,
    operatorName: string,
  ): Promise<void> {
    this.logger.debug('start batchSetDetail');
    try {
      const detailDocRef = docRef
        .collection(STORES_DETAIL_COLLECTION_NAME)
        .doc(detail.code);

      const saveData: StoreDetail = {
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
        supportCredit: detail.supportCredit,
        supportPickupInnerLocker: detail.supportPickupInnerLocker,
        supportPickupPlace: detail.supportPickupPlace,
        supportPickupPlaceParking: detail.supportPickupPlaceParking,
        supportBackOrder: detail.supportBackOrder,
        supportGeomagnetism: detail.supportGeomagnetism,
        geomagnetismMapId: detail.geomagnetismMapId,
        supportPocketRegi: detail.supportPocketRegi,
        supportCuttingService: detail.supportCuttingService,
        supportDIYReserve: detail.supportDIYReserve,
        supportDogRun: detail.supportDogRun,
        supportToolRental: detail.supportToolRental,
        showVisitingNumber: detail.showVisitingNumber,
        messageSettings: detail.messageSettings.map((setting) => ({
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

        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: operatorName,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        updatedBy: operatorName,
        mainBuildingOpeningTime: firestore.Timestamp.fromDate(
          new Date(detail.mainBuildingOpeningTime),
        ),
        mainBuildingClosingTime: firestore.Timestamp.fromDate(
          new Date(detail.mainBuildingClosingTime),
        ),
        ResourceBuildingOpeningTime: firestore.Timestamp.fromDate(
          new Date(detail.ResourceBuildingOpeningTime),
        ),
        ResourceBuildingClosingTime: firestore.Timestamp.fromDate(
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
        supportFacilityReservation: false,
      };

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
}
