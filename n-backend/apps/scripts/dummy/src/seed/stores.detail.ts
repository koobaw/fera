import * as admin from 'firebase-admin';

import { GeoPoint } from '@google-cloud/firestore';
import { StoreDetail } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';

import { FirestoreStructure } from '../types';
import { makeAuditableFields } from './common/auditable';
import { addCollectionData } from '../dummyGenerator';
import { storeCodes } from './common/sources';

const storesDetail: Map<string, StoreDetail> = new Map();
storesDetail.set('813', {
  code: '',
  landscape: new GeoPoint(36.22087561, 139.1841167),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F813_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '埼玉県',
  prefectureCode: '11',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: false,
  supportPickupPlace: true,
  supportPickupPlaceParking: false,
  supportBackOrder: true,
  supportGeomagnetism: true,
  geomagnetismMapId: '',
  supportPocketRegi: true,
  supportCuttingService: true,
  supportDogRun: false,
  supportDIYReserve: true,
  supportToolRental: true,
  supportFacilityReservation: true,
  showVisitingNumber: true,
  messageSettings: [
    {
      from: admin.firestore.Timestamp.fromDate(
        new Date('2013-06-01T09:00:00+09:00'),
      ),
      to: admin.firestore.Timestamp.fromDate(
        new Date('2999-06-01T09:00:00+09:00'),
      ),
      message:
        'システムメンテナンスのため、ポイント参照ができません。ご不便をおかけしますことをお詫び申し上げます。',
    },
  ],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('816', {
  code: '',
  landscape: new GeoPoint(35.90642614, 139.7136702),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F816_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '埼玉県',
  prefectureCode: '11',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: true,
  supportPickupPlaceParking: true,
  supportBackOrder: true,
  supportGeomagnetism: true,
  geomagnetismMapId: '',
  supportPocketRegi: false,
  supportCuttingService: true,
  supportDogRun: true,
  supportDIYReserve: true,
  supportToolRental: true,
  supportFacilityReservation: true,
  showVisitingNumber: false,
  messageSettings: [],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('859', {
  code: '',
  landscape: new GeoPoint(35.808684, 139.610384),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F859_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '埼玉県',
  prefectureCode: '11',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: true,
  supportPickupPlaceParking: true,
  supportBackOrder: true,
  supportGeomagnetism: true,
  geomagnetismMapId: '',
  supportPocketRegi: true,
  supportCuttingService: false,
  supportDogRun: true,
  supportDIYReserve: true,
  supportToolRental: true,
  supportFacilityReservation: true,
  showVisitingNumber: false,
  messageSettings: [],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('906', {
  code: '',
  landscape: new GeoPoint(35.6874345973899, 139.70236343338),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F906_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '東京都',
  prefectureCode: '13',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: false,
  supportPickupPlaceParking: false,
  supportBackOrder: true,
  supportGeomagnetism: true,
  geomagnetismMapId: '',
  supportPocketRegi: true,
  supportCuttingService: false,
  supportDogRun: false,
  supportDIYReserve: true,
  supportToolRental: true,
  supportFacilityReservation: true,
  showVisitingNumber: false,
  messageSettings: [
    {
      from: admin.firestore.Timestamp.fromDate(
        new Date('2013-06-01T09:00:00+09:00'),
      ),
      to: admin.firestore.Timestamp.fromDate(
        new Date('2999-06-01T09:00:00+09:00'),
      ),
      message:
        '当店の在庫数・売場検索機能などは、6月29日よりご利用いただけます。ご了承くださいませ。',
    },
  ],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('296', {
  code: '',
  landscape: new GeoPoint(35.79265518, 139.3159412),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F296_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '東京都',
  prefectureCode: '13',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: true,
  supportPickupPlaceParking: true,
  supportBackOrder: true,
  supportGeomagnetism: true,
  geomagnetismMapId: '',
  supportPocketRegi: true,
  supportCuttingService: true,
  supportDogRun: false,
  supportDIYReserve: true,
  supportToolRental: true,
  supportFacilityReservation: true,
  showVisitingNumber: false,
  messageSettings: [],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('767', {
  code: '',
  landscape: new GeoPoint(42.96811575, 141.4699604),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F767_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '北海道',
  prefectureCode: '01',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: false,
  supportPickupPlaceParking: false,
  supportBackOrder: false,
  supportGeomagnetism: false,
  geomagnetismMapId: '',
  supportPocketRegi: false,
  supportCuttingService: false,
  supportDogRun: false,
  supportDIYReserve: false,
  supportToolRental: false,
  supportFacilityReservation: false,
  showVisitingNumber: false,
  messageSettings: [
    {
      from: admin.firestore.Timestamp.fromDate(
        new Date('2013-06-01T09:00:00+09:00'),
      ),
      to: admin.firestore.Timestamp.fromDate(
        new Date('2999-06-01T09:00:00+09:00'),
      ),
      message:
        '年末年始の営業時間は下記の店舗詳細WEBページからご確認ください。',
    },
  ],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('794', {
  code: '',
  landscape: new GeoPoint(26.14039163, 127.6717939),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F794_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '沖縄県',
  prefectureCode: '47',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: true,
  supportPickupPlace: false,
  supportPickupPlaceParking: false,
  supportBackOrder: false,
  supportGeomagnetism: false,
  geomagnetismMapId: '',
  supportPocketRegi: false,
  supportCuttingService: false,
  supportDogRun: false,
  supportDIYReserve: false,
  supportToolRental: false,
  supportFacilityReservation: false,
  showVisitingNumber: false,
  messageSettings: [],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
});
storesDetail.set('741', {
  code: '',
  landscape: new GeoPoint(35.07311455, 134.0536367),
  floorGuideList: [
    {
      floorGuideOrder: 1,
      floorGuideName: '本館',
      floorGuideUrl:
        'https://firebasestorage.googleapis.com/v0/b/prd-cainz-app-cust1/o/cainz%2FfloorGuide%2FJPG%2F741_1_%E6%9C%AC%E9%A4%A8.jpg?alt=media',
    },
  ],
  prefectureName: '岡山県',
  prefectureCode: '33',
  openingDate: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  closingDate: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  mainBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  mainBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  ResourceBuildingOpeningTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  ResourceBuildingClosingTime: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T20:00:00+09:00'),
  ),
  storeMapUrl: [],
  visible: true,
  publiclyAccessible: true,
  publiclyAccessibleFrom: admin.firestore.Timestamp.fromDate(
    new Date('2013-06-01T09:00:00+09:00'),
  ),
  publiclyAccessibleTo: admin.firestore.Timestamp.fromDate(
    new Date('2999-06-01T09:00:00+09:00'),
  ),
  supportPickup: true,
  supportCredit: true,
  supportPickupInnerLocker: false,
  supportPickupPlace: false,
  supportPickupPlaceParking: false,
  supportBackOrder: true,
  supportGeomagnetism: false,
  geomagnetismMapId: '',
  supportPocketRegi: false,
  supportCuttingService: false,
  supportDogRun: false,
  supportDIYReserve: false,
  supportToolRental: false,
  supportFacilityReservation: false,
  showVisitingNumber: false,
  messageSettings: [
    {
      from: admin.firestore.Timestamp.fromDate(
        new Date('2013-06-01T09:00:00+09:00'),
      ),
      to: admin.firestore.Timestamp.fromDate(
        new Date('2999-06-01T09:00:00+09:00'),
      ),
      message:
        'システムメンテナンスのため、ポイント参照ができません。ご不便をおかけしますことをお詫び申し上げます。',
    },
  ],
  digitalFlyerURL: 'https://www.shufoo.net/pntweb/shopDetail/235882/',
  materialHallExistence: true,
  cultureClassExistence: true,
  cycleParkExistence: true,
  DIYSTYLEFloorExistence: true,
  dogParkExistence: true,
  exteriorPlazaExistence: true,
  foodAreaExistence: true,
  gardeningHallExistence: true,
  greenAdvisorExistence: true,
  petsOneExistence: true,
  reformCenterExistence: true,
  workshopExistence: true,
  storePickupExistence: true,
  supermarketExistence: true,
  ...makeAuditableFields(),
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
