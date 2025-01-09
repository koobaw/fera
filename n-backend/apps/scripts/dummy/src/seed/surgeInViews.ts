import { HighlightedProduct } from '@fera-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { productIds } from './common/sources';

const generateSurgeInView = (index: number): HighlightedProduct => {
  const surgeInView: HighlightedProduct = {
    productId: productIds[index % productIds.length],
    ...makeAuditableFields(),
  };
  return surgeInView;
};

const surgeInViewsStructure: FirestoreStructure = {
  collectionName: 'surgeInViews',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateSurgeInView(index),
    }),
  ),
};

export const addSurgeInViewsData = async () => {
  await addCollectionData(surgeInViewsStructure);
};
