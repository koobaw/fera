import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const USERS_POINTS_COLLECTION_NAME = 'points';

export interface Point extends Auditable {
  totalAmountExcludingTax?: number;
  stageName?: string;
  stageGrantRate?: number;
  nextStageName?: string;
  nextStageGrantRate?: number;
  targetAmountExcludingTax?: number;
  term?: string;
  points: number;
  lostDate?: Timestamp;
  lostPoints?: number;
}

export type OmitTimestampPoint = Omit<
  Point,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
