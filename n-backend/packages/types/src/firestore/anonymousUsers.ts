import { DocumentReference } from '@google-cloud/firestore';
import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const ANONYMOUSUSERS_COLLECTION_NAME = 'anonymousUsers';

export interface AnonymousUser extends Auditable {
  id: string;
  userType: UserType;
  storeCodeInUse: string;
  legacyMemberId: string | null;
  lastApplicationStartDate: Timestamp | null;
  lastCheckCampaignTime: Timestamp | null;
  lastCheckAnnouncementTime: Timestamp | null;
  lastCheckTonakaiTime: Timestamp | null;
  lastCheckTvTime: Timestamp | null;
  reviewDisable: boolean;
  reviewSkipAt: Timestamp | null;
  cartInUse: DocumentReference | null;
}

export type UserType = 'anonymous' | 'pasha' | 'member';

export type MigrateAnonymousUser = Pick<
  AnonymousUser,
  'userType' | 'legacyMemberId' | 'storeCodeInUse' | 'updatedBy' | 'updatedAt'
>;

export type UpdateMystoreAnonymousUser = Pick<
  AnonymousUser,
  'storeCodeInUse' | 'updatedBy' | 'updatedAt'
>;

export type MystoreCodeAnonymousUser = Pick<AnonymousUser, 'storeCodeInUse'>;
