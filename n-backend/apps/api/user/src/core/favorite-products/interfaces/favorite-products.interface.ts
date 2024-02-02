import { HttpStatus } from '@nestjs/common';

export interface FavoriteProductsResponseObject {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
}

export interface FavoriteProductsAvailabilityResponseObject {
  productId: string;
  isRegistered: boolean;
}

export interface ProductServiceApiRequest {
  select?: 'detail' | 'price' | 'inventory';
  storeCodes?: string;
  coefficient?: string;
  membershipRank?: '0' | '1' | '2' | '3' | '4';
  save?: boolean;
}

export interface ProductServiceApiResponseObject {
  productId: string;
  name: string;
  imageUrls: string[];
  prices: Array<{
    productId: string;
    storeCode: string;
    membershipRank: string;
    priceIncludingTax: number;
    salePriceIncludingTax: number;
  }>;
}

export interface ProductServiceApiResponse {
  code: HttpStatus;
  message: string;
  data: ProductServiceApiResponseObject[];
}
