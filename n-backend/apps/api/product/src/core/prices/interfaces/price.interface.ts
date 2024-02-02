export interface MuleProductPriceSuccessResponse {
  productCode: string;
  storeCode: string;
  membershipRank: string;
  price: number;
  salePrice?: number;
}

export interface MuleProductPriceServerErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
