import { Auditable } from './common/auditable';

export const USERS_OPENEDNOTIFICATIONS_COLLECTION_NAME = 'openedNotifications';

export interface UserOpenedNotification extends Auditable {
  notificationId: string;
}
