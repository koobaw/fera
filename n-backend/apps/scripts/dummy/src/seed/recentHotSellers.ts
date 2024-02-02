import { HighlightedProduct } from '@cainz-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreDocument, FirestoreStructure } from '../types';
import { productIds } from './common/sources';

const generateRecentHotSeller = (index: number): HighlightedProduct => {
  const recentHotSeller: HighlightedProduct = {
    productId: productIds[index % productIds.length],
    ...makeAuditableFields(),
  };
  return recentHotSeller;
};

const recentHotSellersStructure: FirestoreStructure = {
  collectionName: 'recentHotSellers',
  documents: [...Array(50)].map(
    (_, index): FirestoreDocument => ({
      data: generateRecentHotSeller(index),
    }),
  ),
};

export const addRecentHotSellersData = async () => {
  await addCollectionData(recentHotSellersStructure);
};
