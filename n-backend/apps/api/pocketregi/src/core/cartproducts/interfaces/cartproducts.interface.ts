import { HttpStatus } from '@nestjs/common';

export interface ProductIdsAndQuantity {
  productId: string;
  quantity: number;
}

export interface ProductDetailRequest {
  productId: string;
  storeCode: string;
}

export interface ProductDetail {
  productId: string;
  productName: string;
  stickerDiscountCode?: string;
  departmentCode?: number;
  imageUrls: string[];
  quantity: number;
  taxRate: number;
}

export interface ProductDetailResponse extends ProductDetail {
  priceIncludingTax: number;
  isAlcoholic?: boolean;
  code128DiscountDetails: [
    { discountMethod: 'string'; discount: 'number'; appliedCount: 'number' },
  ];
  subItems?: Array<any>;
  mixMatchCode?: string;
  setItemCode?: string;
  subtotalAmount?: number;
  unitPrice?: number;
}

export interface ProductDeleteRequest {
  productId: string;
}

export interface ProductAndPriceDetailRes {
  code: HttpStatus;
  message: string;
  data: ProductDetailResponse;
}

export interface MuleErrorResponse {
  status?: number;
  cid?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}

interface ErrorObject {
  code: string;
  message: string;
}

export enum Code128 {
  PERCENT = 'percent',
  YEN = 'yen',
}
