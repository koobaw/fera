import {
  GetProductData,
  Delivery,
  Errors,
  Notifications,
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

// selectable pickup
export type PickUpLocationResponse =
  | PickUpLocationSuccessResponse
  | PickUpLocationFailResponse;
interface Landscape {
  latitude: number;
  longitude: number;
}

interface FloorGuide {
  floorGuideOrder: number;
  floorGuideName: string;
  floorGuideUrl: string;
}

interface DetailItem {
  code: string;
  landscape: Landscape;
  floorGuideList: FloorGuide[];
  prefectureName: string;
  prefectureCode: string;
  openingDate: string;
  closingDate: string;
  supportPickup: boolean;
  supportCredit: boolean;
  supportPickupInnerLocker: boolean;
  supportPickupPlace: boolean;
  supportPickupPlaceParking: boolean;
  supportBackOrder: boolean;
  supportGeomagnetism: boolean;
  geomagnetismMapId?: string;
  supportPocketRegi: boolean;
  supportCuttingService: boolean;
  supportDIYReserve: boolean;
  supportDogRun: boolean;
  supportToolRental: boolean;
  showVisitingNumber: number;
  digitalFlyerURL: string;
  materialHallExistence: boolean;
  cultureClassExistence: boolean;
  cycleParkExistence: boolean;
  DIYSTYLEFloorExistence: boolean;
  dogParkExistence: boolean;
  exteriorPlazaExistence: boolean;
  foodAreaExistence: boolean;
  gardeningHallExistence: boolean;
  greenAdvisorExistence: boolean;
  petsOneExistence: boolean;
  reformCenterExistence: boolean;
  workshopExistence: boolean;
  storePickupExistence: boolean;
  supermarketExistence: boolean;
}

interface TelNumberItem {
  contactName: string;
  telNumber: string;
}

interface Announcement {
  code: string;
  title: string;
  body: string;
}

export interface StoreInfoResponse {
  code: string;
  name: string;
  webUrl: string;
  address: string;
  postCode: string;
  telNumberList: TelNumberItem[];
  businessTime: string;
  businessTimeNote?: string;
  regularHoliday: string;
  regularHolidayNote?: string;
  webOpenStoreFlag: boolean;
  detail: DetailItem;
  announcements: Announcement[];
}

export interface PickUpLocationSuccessResponse {
  status: number;
  supportPickupInnerLocker: boolean;
  supportPickupPlace: boolean;
  supportPickupPlaceParking: boolean;
}

interface PickUpLocationFailResponse {
  status: number;
}

export interface CheckOutCanBeStarted {
  status: number;
  isValid: boolean;
  checkoutItems: Array<ProductItem>;
}
