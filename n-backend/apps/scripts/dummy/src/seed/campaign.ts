import * as admin from 'firebase-admin';

import { Campaign } from '@cainz-next-gen/types';
import { faker } from '@faker-js/faker';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { campaignTitles, thumbnails } from './common/sources';

const generateCampaign = (index: number): Campaign => {
  const campaign: Campaign = {
    title: campaignTitles[index % campaignTitles.length],
    thumbnailUrl: thumbnails[index % thumbnails.length],
    campaignUrl: '/contents/household-supplies',
    startAt: admin.firestore.Timestamp.fromDate(faker.date.anytime()),
    endAt: admin.firestore.Timestamp.fromDate(faker.date.anytime()),
    ...makeAuditableFields(),
  };
  return campaign;
};

const campaignsStructure: FirestoreStructure = {
  collectionName: 'campaigns',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateCampaign(index),
    }),
  ),
};

export const addCampaignsData = async () => {
  await addCollectionData(campaignsStructure);
};
