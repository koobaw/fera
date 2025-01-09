import * as admin from 'firebase-admin';

import { TonakaiArticle } from '@fera-next-gen/types';
import { faker } from '@faker-js/faker';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { articleTitles, thumbnails } from './common/sources';

const generateTonakaiRanking = (index: number): TonakaiArticle => {
  const tonakaiRanking: TonakaiArticle = {
    title: articleTitles[index % articleTitles.length],
    publishedAt: admin.firestore.Timestamp.fromDate(faker.date.anytime()),
    author: {
      avatarUrl: thumbnails[index % thumbnails.length],
      name: faker.person.fullName(),
    },
    thumbnailUrl: thumbnails[index % thumbnails.length],
    articleUrl: '/contents/diy',
    ...makeAuditableFields(),
  };
  return tonakaiRanking;
};

const tonakaiRankingStructure: FirestoreStructure = {
  collectionName: 'tonakaiRanking',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateTonakaiRanking(index),
    }),
  ),
};

export const addTonakaiRankingData = async () => {
  await addCollectionData(tonakaiRankingStructure);
};
