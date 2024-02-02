import * as admin from 'firebase-admin';

import { Article } from '@cainz-next-gen/types';
import { faker } from '@faker-js/faker';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { articleTitles, thumbnails } from './common/sources';

const generatePickupArticle = (index: number): Article => {
  const pickupArticle: Article = {
    title: articleTitles[index % articleTitles.length],
    publishedAt: admin.firestore.Timestamp.fromDate(faker.date.anytime()),
    thumbnailUrl: thumbnails[index % thumbnails.length],
    articleUrl: '/contents/diy',
    ...makeAuditableFields(),
  };
  return pickupArticle;
};

const pickupArticlesStructure: FirestoreStructure = {
  collectionName: 'pickupArticles',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generatePickupArticle(index),
    }),
  ),
};

export const addPickupArticlesData = async () => {
  await addCollectionData(pickupArticlesStructure);
};
