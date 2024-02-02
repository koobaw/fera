import { ServerTimestamp } from './time';

export interface Auditable {
  createdBy: string;
  createdAt: ServerTimestamp;
  updatedBy: string;
  updatedAt: ServerTimestamp;
}
