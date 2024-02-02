import { ErrorCode } from 'apps/api/user/src/types/constants/error-code';

import { OmitTimestampPoint } from '@cainz-next-gen/types';

export interface PointResponse {
  code: number;
  message: string;
  errorCode?: ErrorCode;
  requestId?: string;
  timestamp?: string;
  data: ResponsePointData;
}

export interface ResponsePointData {
  totalAmountExcludingTax?: number;
  stageName?: string;
  stageGrantRate?: number;
  nextStageName?: string;
  nextStageGrantRate?: number;
  targetAmountExcludingTax?: number;
  term?: string;
  points: number;
  lostDate?: string;
  lostPoints?: number;
}
