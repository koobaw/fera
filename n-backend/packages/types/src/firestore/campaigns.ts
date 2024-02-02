import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const CAMPAIGNS_COLLECTION_NAME = 'campaigns';

export interface Campaign extends Auditable {
  title: string;
  thumbnailUrl: string;
  campaignUrl: string;
  startAt: Timestamp;
  endAt: Timestamp;
}
