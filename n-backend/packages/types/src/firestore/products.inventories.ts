import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const PRODUCTS_INVENTORIES_COLLECTION_NAME = 'inventories';

export interface ProductInventory extends Auditable {
  productId: string;
  storeCode: string;
  quantityOpening: number;
  quantitySold: number;
  quantityAvailable: number;
  quantityAllocated: number;
  quantityExpected: number;
  expectedArrivalDate: Timestamp | null;
}
