import { HighlightedProduct } from '@cainz-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { productIds } from './common/sources';

const generatePopularProduct = (index: number): HighlightedProduct => {
  const popularProduct: HighlightedProduct = {
    productId: productIds[index % productIds.length],
    ...makeAuditableFields(),
  };
  return popularProduct;
};

const popularProductsStructure: FirestoreStructure = {
  collectionName: 'popularProducts',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generatePopularProduct(index),
    }),
  ),
};

export const addPopularProductsData = async () => {
  await addCollectionData(popularProductsStructure);
};
