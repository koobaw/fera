import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_OPENEDNOTIFICATIONS_COLLECTION_NAME =
  'openedNotifications';

export interface AnonymousUserOpenedNotification extends Auditable {
  notificationId: string;
}
