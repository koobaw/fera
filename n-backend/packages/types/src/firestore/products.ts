import { Auditable } from './common/auditable';

export const PRODUCTS_COLLECTION_NAME = 'products';

export interface Product extends Auditable {
  productId: string;
  categoryId: string;
  name: string;
  imageUrls: string[];
}

export type OmitTimestampProduct = Omit<
  Product,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
