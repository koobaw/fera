import { Code128DiscountDetails } from '@cainz-next-gen/types';

export interface SettlementResponse {
  data?: DataDetails;
  message?: string;
  code?: number;
}

export interface SettlementMuleResponse {
  cid: string;
  timestamp?: string;
  status?: number;
  shortOrderId?: string;
}

export interface DataDetails {
  status?: number;
  muleRequestId?: string;
  shortOrderId?: string;
}

export interface SettlementMuleError {
  status?: number;
  cid?: string;
  shortOrderId?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}

interface ErrorObject {
  code: string;
  message: string;
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

export interface Product extends ProductDetail {
  priceIncludingTax: number;
  salePriceIncludingTax: number;
  isAlcoholic?: boolean;
  code128DiscountDetails: [
    { discountMethod: 'string'; discount: 'number'; appliedCount: 'number' },
  ];
}
export interface PurchaseOrder {
  paymentMethod: string;
  products: OrderedProduct[];
  storeCode: string;
  storeName: string;
  subtotalConsumptionTaxByReducedRate: number;
  subtotalConsumptionTaxByStandardRate: number;
  subtotalPriceByReducedTaxRate: number;
  subtotalPriceByStandardTaxRate: number;
  subtotalPriceByTaxExempt: number;
  totalAmount: number;
  totalGrantedPoints: number;
  totalPointUse: number;
  totalPointUsed: number;
  totalQuantity: number;
}
export interface OrderedProduct {
  code128DiscountDetails: Code128DiscountDetails[]; // Array of discount stickers
  imageUrls: string[];
  isAlcoholic: boolean;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  taxRate: number;
  departmentCode?: string;
}
export type SaveProduct = Omit<OrderedProduct, 'departmentCode'>;
export interface PurchaseEvent {
  currency: string;
  // 会員種別 / Membership Type
  customer_type: string;
  encrypted_member_no: string;
  event_date: string;
  // 受取方法 / Receiving Method
  fullfillment_method: string;
  products: OrderedProduct[];
  log_type: string;
  // 決済方法 / Payment Method
  payment_type: string;
  // ポイント利用額 / Amount of points used
  point_discount: number;
  shipping: number;
  shop_code: string;
  shop_name: string;
  // 注文ID / Order ID
  transaction_id: string;
  // 合計金額 / Total Amount
  value: number;
  // 顧客の注文ID / Order ID for Customer
  detail_number: string;
  // 税金 / Taxes
  subtotal_consumption_tax_by_reduced_rate: number;
  subtotal_consumption_tax_by_standard_rate: number;
  subtotal_price_by_reduced_tax_rate: number;
  subtotal_price_by_standard_tax_rate: number;
}
