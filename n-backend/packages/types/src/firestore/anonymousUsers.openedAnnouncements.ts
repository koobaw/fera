import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_OPENEDANNOUNCEMENTS_COLLECTION_NAME =
  'openedAnnouncements';

export interface AnonymousUserOpenedAnnouncement extends Auditable {
  announcementId: string;
}
