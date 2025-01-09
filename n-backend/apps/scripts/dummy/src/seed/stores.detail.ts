import * as admin from 'firebase-admin';

import { GeoPoint } from '@google-cloud/firestore';
import { StoreDetail } from '@fera-next-gen/types';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';

import { FirestoreStructure } from '../types';
import { makeAuditableFields } from './common/auditable';
import { addCollectionData } from '../dummyGenerator';
import { storeCodes } from './data/storeCodes';
import { actualStoreData } from './data/stores';

const storesDetail: Map<string, StoreDetail> = new Map();
const prefectureRegex = /(..[都道府県])/;
const randomPercent = 0.5;
// 一つめ、二つめの店舗はall true/falseに設定
const generateBool = (index: number) => {
  if (index === 0) {
    return false;
  }
  if (index === 1) {
    return true;
  }
  return Math.random() < randomPercent;
};

actualStoreData.forEach((store, index) => {
  const isRandomStore = Math.random() < randomPercent;
  const prefecture = store.jusho.match(prefectureRegex);

  storesDetail.set(store.tenpo_cd.toString(), {
    code: store.tenpo_cd.toString(),
    landscape: new GeoPoint(store.latitude, store.longitude),
    floorGuideList: [
      {
        floorGuideOrder: 1,
        floorGuideName: '本館',
        floorGuideUrl:
          'https://firebasestorage.googleapis.com/v0/b/prd-fera-app-cust1/o/fera%2FfloorGuide%2FJPG%2F813_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
      },
    ],
    prefectureName: prefecture ? prefecture[1] : null,
    prefectureCode: store.todofuken_cd,
    openingDate: admin.firestore.Timestamp.fromDate(
      new Date(`${store.release_start_date}T09:00:00+09:00`),
    ),
    closingDate: admin.firestore.Timestamp.fromDate(
      store.release_end_date
        ? new Date(`${store.release_end_date}T09:00:00+09:00`)
        : new Date('2999-06-01T09:00:00+09:00'),
    ),
    renovationDateFrom: isRandomStore
      ? admin.firestore.Timestamp.fromDate(
          new Date('2013-06-01T09:00:00+09:00'),
        )
      : null,
    renovationDateTo: isRandomStore
      ? admin.firestore.Timestamp.fromDate(
          new Date('2040-06-01T09:00:00+09:00'),
        )
      : null,
    temporarilyClosedFrom: isRandomStore
      ? admin.firestore.Timestamp.fromDate(
          new Date('2013-06-01T09:00:00+09:00'),
        )
      : null,
    temporarilyClosedTo: isRandomStore
      ? admin.firestore.Timestamp.fromDate(
          new Date('2040-06-01T09:00:00+09:00'),
        )
      : null,
    mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
      new Date('2013-06-01T09:00:00+09:00'),
    ),
    mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
      new Date('2013-06-01T20:00:00+09:00'),
    ),
    resourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
      new Date('2013-06-01T09:00:00+09:00'),
    ),
    resourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
      new Date('2013-06-01T20:00:00+09:00'),
    ),
    storeMapUrl: [],
    visible: generateBool(index),
    publiclyAccessible: generateBool(index),
    publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
      new Date('2013-06-01T09:00:00+09:00'),
    ),
    publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
      new Date('2999-06-01T09:00:00+09:00'),
    ),
    supportPickup: store.support_pickup === '1',
    supportPickupInnerLocker: generateBool(index),
    supportPickupPlace: store.support_pickup_place === '1',
    supportPickupPlaceParking: generateBool(index),
    supportGeomagnetism: generateBool(index),
    geomagnetismMapId: '',
    supportPocketRegi: generateBool(index),
    supportCuttingService: generateBool(index),
    supportDogRun: generateBool(index),
    supportDIYReserve: generateBool(index),
    supportToolRental: generateBool(index),
    supportFacilityReservation: generateBool(index),
    showVisitingNumber: generateBool(index),
    supportFlyer: generateBool(index),
    supportProductMap: generateBool(index),
    messageSettings: generateBool(index)
      ? [
          {
            title: '営業時間について',
            from: admin.firestore.Timestamp.fromDate(
              new Date('2013-06-01T09:00:00+09:00'),
            ),
            to: admin.firestore.Timestamp.fromDate(
              new Date('2999-06-01T09:00:00+09:00'),
            ),
            message:
              '年末年始の営業時間は下記の店舗詳細WEBページからご確認ください。',
          },
        ]
      : [],
    digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
    materialHallExistence: generateBool(index),
    cultureClassExistence: generateBool(index),
    cycleParkExistence: generateBool(index),
    DIYSTYLEFloorExistence: generateBool(index),
    dogParkExistence: generateBool(index),
    exteriorPlazaExistence: generateBool(index),
    foodAreaExistence: generateBool(index),
    gardeningHallExistence: generateBool(index),
    greenAdvisorExistence: generateBool(index),
    petsOneExistence: generateBool(index),
    reformCenterExistence: generateBool(index),
    workshopExistence: generateBool(index),
    storePickupExistence: generateBool(index),
    supermarketExistence: generateBool(index),
    ...makeAuditableFields(),
  });
});

const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);

const generateStoreDetail = (storeCode: string): StoreDetail =>
  storesDetail.get(storeCode);

const storesDetailStructure: FirestoreStructure = {
  collectionName: 'stores',
  documents: storeCodes.map((storeCode) => ({
    documentName: commonService.createMd5(storeCode),
    subCollection: {
      collectionName: 'detail',
      documents: [
        {
          documentName: storeCode,
          data: generateStoreDetail(storeCode),
        },
      ],
    },
  })),
};

export const addStoresDetailData = async () => {
  await addCollectionData(storesDetailStructure);
};
