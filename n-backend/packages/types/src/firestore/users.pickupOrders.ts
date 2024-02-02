import { Auditable } from './common/auditable';

export const USERS_PICKUPORDERS_COLLECTION_NAME = 'pickupOrders';

export interface UserPickupOrder extends Auditable {
  orderId: string;
}
