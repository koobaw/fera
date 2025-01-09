import { StoreAnnouncement } from '@fera-next-gen/types';
import { faker } from '@faker-js/faker';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';

import { FirestoreStructure } from '../types';
import { makeAuditableFields } from './common/auditable';
import { addCollectionData } from '../dummyGenerator';
import { storeCodes } from './data/storeCodes';

const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);

const generateStoresAnnouncement = (storeCode: string): StoreAnnouncement => {
  const storesAnnouncement: StoreAnnouncement = {
    storeCode,
    title: faker.word.noun(),
    body: faker.word.words(),
    ...makeAuditableFields(),
  };
  return storesAnnouncement;
};

const storesAnnouncementsStructure: FirestoreStructure = {
  collectionName: 'stores',
  documents: storeCodes.map((storeCode) => ({
    documentName: commonService.createMd5(storeCode),
    subCollection: {
      collectionName: 'announcements',
      documents: [
        {
          data: generateStoresAnnouncement(storeCode),
        },
      ],
    },
  })),
};

export const addStoresAnnouncementsData = async () => {
  await addCollectionData(storesAnnouncementsStructure);
};
