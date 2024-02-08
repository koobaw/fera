import { Store } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { storeCodes } from './data/storeCodes';
import { actualStoreData } from './data/stores';

const stores: Map<string, Store> = new Map();

actualStoreData.forEach((store) => {
  const isRandomStore = Math.random() < 0.1; // 10%の確率
  let telNumberList = [{ contactName: '本館', telNumber: store.tel }];
  if (isRandomStore) {
    telNumberList = telNumberList.concat([
      { contactName: 'ペッツワン・犬猫生体販売', telNumber: store.tel },
      { contactName: 'トリミング・犬猫ホテル', telNumber: store.tel },
    ]);
  }

  stores.set(store.tenpo_cd.toString(), {
    code: store.tenpo_cd.toString(),
    name: store.tenpo_name,
    address: store.jusho,
    postCode: store.yubin_no,
    telNumberList,
    businessTime: '9:00〜20:00',
    businessTimeNote: isRandomStore ? '資材館 7:00～20:00' : null,
    regularHoliday: '1月1日',
    regularHolidayNote: isRandomStore ? 'お正月は時短営業です' : null,
    ...makeAuditableFields(),
  });
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
