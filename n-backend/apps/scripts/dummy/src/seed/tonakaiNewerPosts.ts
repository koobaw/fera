import * as admin from 'firebase-admin';

import { TonakaiArticle } from '@cainz-next-gen/types';
import { faker } from '@faker-js/faker';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { articleTitles, thumbnails } from './common/sources';

const generateTonakaiNewerPost = (index: number): TonakaiArticle => {
  const tonakaiNewerPost: TonakaiArticle = {
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
  return tonakaiNewerPost;
};

const tonakaiNewerPostsStructure: FirestoreStructure = {
  collectionName: 'tonakaiNewerPosts',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateTonakaiNewerPost(index),
    }),
  ),
};

export const addTonakaiNewerPostsData = async () => {
  await addCollectionData(tonakaiNewerPostsStructure);
};
