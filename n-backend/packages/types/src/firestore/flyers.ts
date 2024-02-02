import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const FLYERS_COLLECTION_NAME = 'flyers';

// TODO: 正式に決まったものに差し替える
// NOTE: Flyer型がまだ決まっていないため、仮置きしています
export interface Flyer extends Auditable {
  campaignId: string;
  planId: string;
  storeCode: string;
  title: string;
  frontImageUrl: string;
  backImageUrl: string | null;
  startDate: Timestamp;
  endDate: Timestamp;
}

export type OmitTimestampFlyer = Omit<
  Flyer,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
