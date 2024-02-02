import { Auditable } from './common/auditable';

export const PRODUCTS_PRICES_COLLECTION_NAME = 'prices';

export interface ProductPrice extends Auditable {
  productId: string;
  storeCode: string;
  membershipRank: string;
  priceIncludingTax: number;
  salePriceIncludingTax: number;
}

export type OmitTimestampPartialProductPrice =
  Partial<OmitTimestampProductPrice>;

export type OmitTimestampProductPrice = Omit<
  ProductPrice,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
