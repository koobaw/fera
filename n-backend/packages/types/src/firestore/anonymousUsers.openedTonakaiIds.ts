import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_OPENEDTONAKAIIDS_COLLECTION_NAME =
  'openedTonakaiIds';

export interface AnonymousUsersTonakaiId extends Auditable {
  articelId: string;
}
