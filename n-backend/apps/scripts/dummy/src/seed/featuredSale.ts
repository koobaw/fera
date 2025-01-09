import { HighlightedProduct } from '@fera-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { productIds } from './common/sources';

const generateFeaturedSale = (index: number): HighlightedProduct => {
  const featuredSale: HighlightedProduct = {
    productId: productIds[index % productIds.length],
    ...makeAuditableFields(),
  };
  return featuredSale;
};

const featuredSaleStructure: FirestoreStructure = {
  collectionName: 'featuredSale',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateFeaturedSale(index),
    }),
  ),
};

export const addFeaturedSaleData = async () => {
  await addCollectionData(featuredSaleStructure);
};
