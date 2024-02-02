import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const USERS_MYSTORES_COLLECTION_NAME = 'myStores';

export interface MyStores extends Auditable {
  myStores: Mystore[];
}

export interface Mystore {
  code: string; // 店舗コード
  isFavoriteStore: boolean; // 「いつも使うマイストア」かどうか
  originalCreatedAt: Timestamp; // 作成日
}
