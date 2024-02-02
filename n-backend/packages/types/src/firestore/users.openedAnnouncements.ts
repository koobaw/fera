import { Auditable } from './common/auditable';

export const USERS_OPENEDANNOUNCEMENTS_COLLECTION_NAME = 'openedAnnouncements';

export interface UserOpenedAnnouncement extends Auditable {
  announcementId: string;
}
