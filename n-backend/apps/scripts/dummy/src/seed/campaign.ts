/* eslint-disable no-param-reassign */
import * as admin from 'firebase-admin';

import { Campaign } from '@cainz-next-gen/types';
import { faker } from '@faker-js/faker';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';

import { campaigns } from './common/sources';

const campaignUrl = 'https://www.cainz.com/contents/';
const dates = [
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('1970-01-01T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('1970-12-31T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('1970-01-01T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('1970-12-31T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-08-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-09-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-08-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-09-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-09-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-10-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-09-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-10-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-10-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-11-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-10-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-11-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-11-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-12-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-11-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-12-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-12-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-01-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2023-12-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-01-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-01-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-02-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-01-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-02-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-02-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-03-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-02-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-03-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-03-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-04-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-03-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-04-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-04-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-05-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-04-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-05-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-05-15T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-06-15T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-05-10T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2024-06-10T00:00:00+09:00'),
    ),
  },
  {
    startDate: admin.firestore.Timestamp.fromDate(
      new Date('2999-01-01T00:00:00+09:00'),
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date('2999-12-31T00:00:00+09:00'),
    ),
    publiclyAccessibleStartDate: admin.firestore.Timestamp.fromDate(
      new Date('2999-01-01T00:00:00+09:00'),
    ),
    publiclyAccessibleEndDate: admin.firestore.Timestamp.fromDate(
      new Date('2999-12-31T00:00:00+09:00'),
    ),
  },
];

const campaignsOverridden = campaigns.map((campaign, index) => {
  campaign.startDate = dates[index % dates.length].startDate;
  campaign.endDate = dates[index % dates.length].endDate;
  campaign.publiclyAccessibleStartDate =
    dates[index % dates.length].publiclyAccessibleStartDate;
  campaign.publiclyAccessibleEndDate =
    dates[index % dates.length].publiclyAccessibleEndDate;
  campaign.campaignUrl = campaignUrl;
  return campaign;
});

const generateCampaign = (index: number): Campaign => {
  const startDate = faker.date.soon();
  startDate.setHours(0, 0, 0, 0);
  const endDate = faker.date.future({ years: 1, refDate: startDate });
  endDate.setHours(0, 0, 0, 0);
  const publiclyAccessibleStartDate = faker.date.soon();
  publiclyAccessibleStartDate.setHours(0, 0, 0, 0);
  const publiclyAccessibleEndDate = faker.date.future({
    years: 1,
    refDate: publiclyAccessibleStartDate,
  });
  publiclyAccessibleEndDate.setHours(0, 0, 0, 0);

  const campaign: Campaign = {
    title: campaignsOverridden[index % campaignsOverridden.length].title,
    campaignUrl:
      campaignsOverridden[index % campaignsOverridden.length].campaignUrl,
    startDate:
      campaignsOverridden[index % campaignsOverridden.length].startDate,
    endDate: campaignsOverridden[index % campaignsOverridden.length].endDate,
    publiclyAccessibleStartDate:
      campaignsOverridden[index % campaignsOverridden.length]
        .publiclyAccessibleStartDate,
    publiclyAccessibleEndDate:
      campaignsOverridden[index % campaignsOverridden.length]
        .publiclyAccessibleEndDate,
    thumbnailUrl:
      campaignsOverridden[index % campaignsOverridden.length].thumbnailUrl,
    ...makeAuditableFields(),
  };
  return campaign;
};

const campaignsStructure: FirestoreStructure = {
  collectionName: 'campaigns',
  documents: [...Array(12)].map(
    (_, index): FirestoreDocument => ({
      data: generateCampaign(index),
    }),
  ),
};

export const addCampaignsData = async () => {
  await addCollectionData(campaignsStructure);
};
