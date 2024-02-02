import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_PICKUPORDERS_COLLECTION_NAME = 'pickupOrders';

export interface AnonymousUserPickupOrder extends Auditable {
  orderId: string;
}
