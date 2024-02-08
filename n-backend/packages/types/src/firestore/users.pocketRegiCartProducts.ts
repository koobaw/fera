import { Auditable } from './common/auditable';

export const POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME =
  'pocketRegiCartProducts';

export const POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME = 'cartProducts';

export interface PocketRegiCartProduct extends Auditable {
  products: [];
  totalAmount: number;
  totalQuantity: number;
  checkInAt: string;
  storeCode: string;
  cartLockUntil: string;
  productUpdatedAt: string;
}
export interface CartProducts {
  code128DiscountDetails?: Code128DiscountDetails[];
  subtotalAmount: number;
  mixMatchCode: string;
  setItemCode: string;
  subItems: SubItem[];
  imageUrls?: string[];
  productName?: string;
  productId?: string;
  isAlcoholic?: boolean;
  quantity?: number;
  taxRate?: number;
  unitPrice?: number;
}

export interface SubItem {
  code128DiscountDetails: Code128DiscountDetails[];
  imageUrls: string[];
  productName: string;
  productId: string;
  isAlcoholic: boolean;
  quantity: number;
  salePrice: number;
  taxRate: number;
  unitPrice: number;
}

export interface Code128DiscountDetails {
  discountMethod: string;
  discount: number;
  appliedCount: number;
}
