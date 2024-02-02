import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_FAVORITEPRODUCTS_COLLECTION_NAME =
  'favoriteProducts';

export interface AnonymousUserFavoriteProduct extends Auditable {
  productId: string;
}
