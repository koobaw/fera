export interface CheckinResponse {
  data?: ShopDetails;
  message?: string;
  code?: number;
}

interface ShopDetails {
  storeName?: string;
  storeCode?: string;
  storeAddress?: string;
}
