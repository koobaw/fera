import {
  GetProductData,
  Delivery,
  Errors,
  Notifications,
  ShippingAddress,
} from '@cainz-next-gen/order/src/interfaces/orderInterfaces.interface';
import { Auditable, ProductDetail } from '@cainz-next-gen/types';

export interface OrderSpecification {
  simulationNumber: string;
  height: number;
  width: number;
  hook: string;
}
export interface ProductItem {
  itemId: string;
  receivingMethod: string;
  productId: string;
  quantity: number;
  orderSpecification?: OrderSpecification;
  product: GetProductData;
  delivery?: Delivery;
  setProductType?: string;
  isReserveFromStoreAvailable?: boolean;
  isPersonalDeliveryAvailable?: boolean;
  invalidWebBackOrderFlagForStorePickup: boolean;
  invalidWebBackOrderFlagForDesignatedDelivery: boolean;
  isWebBackOrder?: boolean;
  unitPrice?: number;
  unitPriceForStorePickup?: number;
  unitPriceForDelivery?: number;
  selectedUnitPrice?: number;
  subtotalProductAmount?: number;
  individualShippingCost?: number;
  subtotalIndividualShippingCost?: number;
  campaignPoints?: number;
  subtotalCampaignPoints?: number;
  isCheckoutTarget: boolean;
  checkoutId?: string;
  checkoutStatus?: string;
  errors?: Array<Errors>;
  notifications?: Array<Notifications>;
  createdAt: any;
  updatedAt: any;
}

export interface UserInfo {
  isMember: boolean;
  billpayment: boolean;
  zipcode: string;
  prefecture: string;
}
export interface CheckMaximumAndMinimumAndStepQuantityResponse {
  status: number;
  errors: any[];
}

export interface CalculateCartAmountResponse {
  status: number;
  amountInfo?: AmountInfo;
  storeItemCount?: number;
  shippingItemCount?: number;
}

export interface NeedsItemCreationResponse {
  status: number;
  needsItemCreation: boolean;
  productItem?: any;
  canBeAddedToCart?: boolean;
}

export interface AmountInfo {
  totalProductAmountStore: number;
  basicShippingCost: number;
  totalProductAmountEc: number;
  regionalShippingCost: number;
  totalIndividualShippingCost: number;
  totalGrossAmount: number;
  priceToFreeBasicShipping: number;
}

// canbepurchaseAtsametime
export type CanBePurchasedAtTheSameTime = JudgementSuccess | JudgementFail;
export type ErrorInformationInterface = Array<ErrorInformation>;

export interface ErrorInformation {
  category: string;
  errorCode: string;
  description: string;
}
export type ProductItemInterface = Array<ProductItem>;

export interface ProductItems extends Auditable {
  itemId: string;
  receivingMethod: string;
  productId: string;
  quantity: number;
  orderSpecification: OrderSpecification;
  product: ProductDetail;
  delivery: object;
  setProductType: string;
  isReserveFromStoreAvailable: boolean;
  isPersonalDeliveryAvailable: boolean;
  invalidWebBackOrderFlagForStorePickup: boolean;
  invalidWebBackOrderFlagForDesignatedDelivery: boolean;
  isWebBackOrder: boolean;
  unitPrice: number;
  subtotalProductAmount: number;
  individualShippingCost: number;
  subtotalIndividualShippingCost: number;
  campaignPoints: number;
  subtotalCampaignPoints: number;
  isCheckoutTarget: boolean;
  checkoutId: string;
  checkoutStatus: string;
  dropShippingCategory: string;
  customizedProductCategory: string;
  errors?: Array<object>;
  notifications?: Array<object>;
}
export interface JudgementSuccess {
  status: number;
  errors: ErrorInformationInterface;
  productItems: ProductItem[];
}
export interface JudgementFail {
  status: number;
}
export interface CreateProductItem {
  status: number;
  productItem: ProductItem;
}

export interface CartData {
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  productItems: Array<ProductItem>;
  shippingAddress: ShippingAddress;
  userId: string;
  storeCode: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface OverwriteContent {
  productItems: Array<ProductItem>;
  storeCode: string;
  shippingAddress: ShippingAddress;
}

export interface OverwriteContents {
  status: number;
  cartData: CartData;
}
