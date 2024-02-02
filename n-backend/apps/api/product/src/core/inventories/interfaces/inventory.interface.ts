export interface InventoryResponse {
  productId: string;
  storeCode: string;
  quantityOpening: number;
  quantitySold: number;
  quantityAvailable: number;
  quantityAllocated: number;
  quantityExpected: number;
  expectedArrivalDate?: string;
}
