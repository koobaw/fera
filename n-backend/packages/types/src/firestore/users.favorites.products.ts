import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const USERS_FAVORITES_PRODUCTS_COLLECTION_NAME = 'products';

export interface UserFavoriteProduct extends Auditable {
  id: string | null; // お気に入りID
  productId: string; // 商品コード(JAN)
  userCreatedAt: Timestamp; // お気に入り登録日時(ユーザー側で実際に登録した日時)
}

export type OmitTimestampUserFavoriteProduct = Omit<
  UserFavoriteProduct,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;

export type PartialUserFavoriteProduct = Partial<UserFavoriteProduct>;
