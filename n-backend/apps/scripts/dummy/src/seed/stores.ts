import { Store } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { storeCodes } from './common/sources';

const stores: Map<string, Store> = new Map();
stores.set('813', {
  code: '813',
  name: 'カインズ本庄早稲田店',
  address: '埼玉県本庄市早稲田の杜二丁目１番１号',
  postCode: '367-0030',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '0495-23-5000',
    },
    {
      contactName: 'ペッツワン',
      telNumber: ' 0495-27-8888',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: '資材館 7:00～20:00',
  regularHoliday: '1月1日',
  regularHolidayNote: 'お正月は時短営業です',
  ...makeAuditableFields(),
});
stores.set('816', {
  code: '816',
  name: 'カインズ浦和美園店',
  address: '埼玉県さいたま市緑区美園1丁目11番地1',
  postCode: '351-0005',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-878-2111',
    },
    {
      contactName: 'ペッツワン・犬猫生体販売',
      telNumber: '048-812-6066',
    },
    {
      contactName: 'トリミング・犬猫ホテル',
      telNumber: '048-878-2111',
    },
    {
      contactName: '観賞魚・小動物生体・小動物ホテル',
      telNumber: '048-878-2111',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: '資材館 7:00～20:00',
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('859', {
  code: '859',
  name: 'カインズ朝霞店',
  address: '埼玉県朝霞市根岸台3丁目20番1号',
  postCode: '351-0005',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-468-0111',
    },
    {
      contactName: '犬猫生体販売',
      telNumber: '048-460-1122',
    },
    {
      contactName: 'トリミング予約・犬猫ホテル・セルフウォッシュ',
      telNumber: '048-483-5772',
    },
    {
      contactName: '観賞魚・小動物生体・小動物ホテル',
      telNumber: '048-424-3433',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: null,
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('906', {
  code: '906',
  name: 'カインズハンズ新宿店',
  address: '東京都渋谷区千駄ケ谷５丁目２４−２',
  postCode: '151-0051',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-468-0111',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: null,
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('296', {
  code: '296',
  name: 'カインズ青梅インター店',
  address: '東京都青梅市新町6-9-4',
  postCode: '198-0024',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-468-0111',
    },
    {
      contactName: '犬猫生体販売',
      telNumber: '048-460-1122',
    },
    {
      contactName: 'トリミング予約・犬猫ホテル・セルフウォッシュ',
      telNumber: '048-483-5772',
    },
    {
      contactName: '観賞魚・小動物生体・小動物ホテル',
      telNumber: '048-424-3433',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: '資材館 月～土曜8:00～20:00　日9:00～20:00',
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('767', {
  code: '767',
  name: 'カインズＦＣ大曲店',
  address: '北海道北広島市大曲幸町6丁目1番地',
  postCode: '061-1278',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-468-0111',
    },
    {
      contactName: '犬猫生体販売',
      telNumber: '048-460-1122',
    },
    {
      contactName: 'トリミング予約・犬猫ホテル・セルフウォッシュ',
      telNumber: '048-483-5772',
    },
    {
      contactName: '観賞魚・小動物生体・小動物ホテル',
      telNumber: '048-424-3433',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: null,
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('794', {
  code: '794',
  name: 'カインズＦＣサンプラザ糸満店',
  address: '沖縄県糸満市字兼城４００',
  postCode: '351-0005',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '048-468-0111',
    },
    {
      contactName: '犬猫生体販売',
      telNumber: '048-460-1122',
    },
    {
      contactName: 'トリミング予約・犬猫ホテル・セルフウォッシュ',
      telNumber: '048-483-5772',
    },
    {
      contactName: '観賞魚・小動物生体・小動物ホテル',
      telNumber: '048-424-3433',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: null,
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});
stores.set('741', {
  code: '741',
  name: 'カインズＦＣ津山店',
  address: '岡山県津山市高野本郷1406',
  postCode: '708-1125',
  telNumberList: [
    {
      contactName: '本館',
      telNumber: '0868-21-8100',
    },
    {
      contactName: 'ペッツワン',
      telNumber: '0868-20-1660',
    },
  ],
  businessTime: '9:00〜20:00',
  businessTimeNote: '資材館 7:00～20:00（日曜のみ9:30～20:00）',
  regularHoliday: '1月1日',
  regularHolidayNote: null,
  ...makeAuditableFields(),
});

const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);

const generateStore = (storeCode: string): Store => stores.get(storeCode);

const storesStructure: FirestoreStructure = {
  collectionName: 'stores',
  documents: storeCodes.map(
    (storeCode): FirestoreDocument => ({
      documentName: commonService.createMd5(storeCode),
      data: generateStore(storeCode),
    }),
  ),
};

export const addStoresData = async () => {
  await addCollectionData(storesStructure);
};
