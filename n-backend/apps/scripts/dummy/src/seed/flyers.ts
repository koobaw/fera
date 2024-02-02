import * as admin from 'firebase-admin';

import { faker } from '@faker-js/faker';
import { Flyer } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { campaignIds, planIds, storeCodes } from './common/sources';

const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);

const randomDate = () => {
  const dateTime = faker.date.anytime();
  dateTime.setHours(0, 0, 0, 0);
  return dateTime;
};

const generateFlyer = (storeCode: string, index: number): Flyer => {
  const flyer: Flyer = {
    campaignId: campaignIds[index % campaignIds.length],
    planId: planIds[index % planIds.length],
    storeCode,
    title: faker.word.noun(),
    frontImageUrl: 'https://picsum.photos/1000',
    backImageUrl: 'https://picsum.photos/1000',
    startDate: admin.firestore.Timestamp.fromDate(randomDate()),
    endDate: admin.firestore.Timestamp.fromDate(randomDate()),
    ...makeAuditableFields(),
  };
  return flyer;
};

const flyerStructure: FirestoreStructure = {
  collectionName: 'flyers',
  documents: storeCodes.flatMap((storeCode) =>
    [...Array(50)].map(
      (_, index): FirestoreDocument => ({
        documentName: commonService.createMd5(
          `${campaignIds[index % campaignIds.length]}_${
            planIds[index % planIds.length]
          }_${storeCode}`,
        ),
        data: generateFlyer(storeCode, index),
      }),
    ),
  ),
};

export const addFlyersData = async () => {
  await addCollectionData(flyerStructure);
};
