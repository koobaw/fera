import { Auditable } from './common/auditable';

export const USERS_OPENEDTONAKAIIDS_COLLECTION_NAME = 'openedTonakaiIds';

export interface UserOpenedTonakaiId extends Auditable {
  articelId: string;
}
