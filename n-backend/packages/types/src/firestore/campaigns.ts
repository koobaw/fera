import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const CAMPAIGNS_COLLECTION_NAME = 'campaigns';

export interface Campaign extends Auditable {
  title: string;
  campaignUrl: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  publiclyAccessibleStartDate: Timestamp;
  publiclyAccessibleEndDate: Timestamp;
  thumbnailUrl: string;
}
