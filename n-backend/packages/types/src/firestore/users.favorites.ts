import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const USERS_FAVORITES_COLLECTION_NAME = 'favorites';

export interface UserFavorite extends Auditable {
  comment: string | null; // コメント
  name: string; // マイリスト番号
  title: string; // タイトル
  isPublish: boolean; // 公開フラグ
  ownerId: string | null; // 所有者 ID
  isDefault: boolean; // デフォルトフラグ
  userCreatedAt: Timestamp; // お気に入りリスト登録日時(ユーザー側で実際に登録した日時)
}

export type OmitTimestampUserFavorite = Omit<
  UserFavorite,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
