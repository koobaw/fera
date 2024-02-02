export interface GetDiscountedPriceApiRequest {
  products: string;
  rank: string;
}

export interface GetDiscountedPriceResponseMule {
  storeCode: string;
  membershipRank: string;
  totalAmount: number;
  items: DiscountPriceItems[];
}

export interface DiscountPriceItems {
  salesType: number;
  subtotalAmount: number;
  productCode?: string;
  unitPrice?: number;
  quantity?: number;
  mixMatchCode?: string;
  setItemCode?: string;
  subItems?: SubItemMule[];
}

export interface SubItemMule {
  productCode: string;
  unitPrice: number;
  quantity: number;
  salesAmount: number;
}

export interface ProductIdsAndQuantity {
  productId: string;
  quantity: number;
}
