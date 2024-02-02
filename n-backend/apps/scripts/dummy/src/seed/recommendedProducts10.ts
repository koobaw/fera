import { HighlightedProduct } from '@cainz-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { productIds } from './common/sources';

const generateRecommendedProducts10 = (index: number): HighlightedProduct => {
  const recommendedProducts10: HighlightedProduct = {
    productId: productIds[index % productIds.length],
    ...makeAuditableFields(),
  };
  return recommendedProducts10;
};

const recommendedProducts10Structure: FirestoreStructure = {
  collectionName: 'recommendedProducts10',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateRecommendedProducts10(index),
    }),
  ),
};

export const addRecommendedProducts10Data = async () => {
  await addCollectionData(recommendedProducts10Structure);
};
