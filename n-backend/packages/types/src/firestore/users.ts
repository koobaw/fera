import { DocumentReference } from '@google-cloud/firestore';
import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const USERS_COLLECTION_NAME = 'users';

export interface User extends Auditable {
  storeCodeInUse: string;
  lastApplicationStartDate: Timestamp | null;
  lastCheckCampaignTime: Timestamp | null;
  lastCheckAnnouncementTime: Timestamp | null;
  lastCheckTonakaiTime: Timestamp | null;
  lastCheckTvTime: Timestamp | null;
  reviewDisable: boolean;
  reviewSkipAt: Timestamp | null;
  rank: string;
  cartInUse: DocumentReference | null;
}

export type UpdateStoreCodeInUse = Pick<
  User,
  'storeCodeInUse' | 'updatedBy' | 'updatedAt'
>;

export type StoreCodeInUseUser = Pick<User, 'storeCodeInUse'>;
