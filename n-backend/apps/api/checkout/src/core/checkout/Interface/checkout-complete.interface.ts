import { ProductItem } from 'packages/order/src/interfaces/orderInterfaces.interface';
import { Auditable, ProductDetail } from '@cainz-next-gen/types';

export type CheckoutCompleteInterface =
  | OtherPaymentInterface
  | AmazonInterface
  | CompleteInfo
  | Error;
export interface AmazonInterface {
  receptionId: string;
  orderId: string;
  accessId: string;
  token: string;
  paymentStartUrl: string;
  paymentStartBy: string;
}
export type CompleteInfoInterface = CompleteInfo | Error;
export interface CompleteInfo {
  orderCompleteInfo: Array<OtherPaymentInterface>;
}
export type OtherPaymentDataInterface = Array<OtherPaymentInterface>;

export interface OtherPaymentInterface {
  orderId: string;
  receptionId: string;
  shortOrderId?: string;
  receivingMethod: string;
  paymentMethodId: string;
  convenienceCode?: string;
  purchaseAmount?: number;
  payBy?: string;
  confirmationNumber?: string;
  receiptNumber?: string;
  slipUrl?: string;
  clientField1?: string;
  clientField2?: string;
  clientField3?: string;
  isMember: boolean;
}

export interface Error {
  error: string;
  data: any;
}

interface ShippingBillingInfo {
  countryCode: string;
  zipCode: string;
  prefecture: string;
  address1: string;
  address2: string;
  address3: string;
  name: string;
  phone: string;
}

interface AmazonPayBillingDestination {
  amazonBuyerId: string;
  amazonAccountName: string;
  amazonAccountEmail: string;
  paymentDescriptor: string;
  shipping: ShippingBillingInfo;
  billing: ShippingBillingInfo;
}

export interface AmazonPayBillingDestinationResult {
  status: number;
  amazonInfo: AmazonPayBillingDestination;
}

export interface OrderSpecification {
  simulationNumber: string;
  height: number;
  width: number;
  hook: string;
}

export interface CheckOutCanBeStarted {
  status: number;
  isValid: boolean;
  checkoutItems: Array<ProductItem>;
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

export interface ConfirmProductPurchaseResponse {
  status: number;
  hasGiftProducts?: boolean;
  hasWebBackOrder?: boolean;
}

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
