import { Auditable } from './common/auditable';

export const STORES_ANNOUNCEMENTS_COLLECTION_NAME = 'announcements';

export interface StoreAnnouncement extends Auditable {
  storeCode: string;
  title: string;
  body: string;
}
