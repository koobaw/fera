import { StoreFlyer } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';

import * as admin from 'firebase-admin';
import { FirestoreStructure } from '../types';
import { makeAuditableFields } from './common/auditable';
import { addCollectionData } from '../dummyGenerator';
import { campaignIds, planIds, storeCodes } from './common/sources';

const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);

const generateStoreFlyers = (storeCode: string): StoreFlyer => {
  const documentRefs = [...Array(10)].map((_, index) => {
    const hashedFlyerId = commonService.createMd5(
      `${campaignIds[index % campaignIds.length]}_${
        planIds[index % planIds.length]
      }_${storeCode}`,
    );
    return admin.firestore().collection('flyers').doc(hashedFlyerId);
  });

  const storeFlyer: StoreFlyer = {
    flyerRefIds: documentRefs,
    ...makeAuditableFields(),
  };
  return storeFlyer;
};

const storeFlyersStructure: FirestoreStructure = {
  collectionName: 'stores',
  documents: storeCodes.map((storeCode) => ({
    documentName: commonService.createMd5(storeCode),
    subCollection: {
      collectionName: 'flyers',
      documents: [
        {
          data: generateStoreFlyers(storeCode),
        },
      ],
    },
  })),
};

export const addStoresFlyersData = async () => {
  await addCollectionData(storeFlyersStructure);
};
