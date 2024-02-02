export interface InvalidWebBackOrderFlagValue {
  status: number;
  invalidWebBackOrderFlagForStorePickup: boolean;
  invalidWebBackOrderFlagForDesignatedDelivery: boolean;
}

export interface CanBePurchasedValue {
  status?: number;
  errors?: Array<Errors>;
  productItems?: Array<ProductItems>;
}

export interface CheckNonDeliveryValue {
  status?: number;
  errors?: Array<Errors>;
  productItems?: Array<ProductItems>;
}

export interface ProductItems {
  itemId: string;
  receivingMethod: string;
  productId: string;
  quantity: number;
  orderSpecification: OrderSpecification;
  product: GetProductData;
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
  createdAt: string;
  updatedAt: string;
  errors: Array<Errors>;
  notifications?: Array<object>;
}

interface SpecCategory {
  name: string;
  value: string;
}

interface Variation {
  name: string;
  value: string;
}

export interface Price {
  productId: string;
  storeCode: string;
  membershipRank: string;
  priceIncludingTax: number;
  salePriceIncludingTax: number;
}

interface Inventory {
  productId: string;
  storeCode: string;
  quantityOpening: number;
  quantitySold: number;
  quantityAvailable: number;
  quantityAllocated: number;
  quantityExpected: number;
  expectedArrivalDate?: string;
}

export interface GetProductData {
  productId: string;
  name: string;
  categoryId: string;
  imageUrls: Array<string>;
  departmentCode: string;
  lineCode: string;
  classCode: string;
  description: string;
  applicableStartDate: string;
  salesStartDate: string;
  consumptionTaxRate: number;
  consumptionTaxCategory: string;
  salesEndDate: string;
  salesEndFlag: boolean;
  designatedPharmaceuticalCategory: string;
  liquorCategory: string;
  tobaccoCategory: string;
  hazardousMaterialFlag: boolean;
  medicalEquipmentClass: string;
  poisonousDeleteriousSubstanceCategory: string;
  poisonousDrugCategory: string;
  agriculturalChemicalCategory: string;
  animalDrugCategory: string;
  warrantyIssuanceCategory: string;
  pharmaceuticalFlag: boolean;
  salesTypeCategory: string;
  warrantyCategory: string;
  warrantyPeriod: string;
  deliveryChargeCategoryEc: string;
  onlineFlagEc: boolean;
  onlineStartTimeEc: string;
  onlineEndTimeEc: string;
  consumptionTaxCategoryEc: string;
  onlineSalesCategoryEc: string;
  individualDeliveryChargeEc: number;
  setProductFlag: boolean;
  configurationFlag: boolean;
  customizedProductCategory: string;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  stepQuantity: number;
  storeMinOrderQuantity: number;
  storeMaxOrderQuantity: number;
  storeStepOrderQuantity: number;
  newPeriodFrom: string;
  reserveFromStoreDisabled: boolean;
  sendToStoreDisabled: boolean;
  personalDeliveryDisabled: boolean;
  estimatedArrivalDays: number;
  productWithServiceFlag: boolean;
  dropShippingCategory: string;
  largeSizedProductCategoryEc: string;
  originCountryCode: string;
  flavorExpirationCategory: string;
  flavorExpiration: number;
  productCharacteristics: string;
  colorPattern: string;
  size: string;
  brandName: string;
  singleItemSizeWidth: number;
  singleItemSizeHeight: number;
  singleItemSizeDepth: number;
  contentAmount: number;
  contentAmountUnit: string;
  modelNo: string;
  lawsStandards: string;
  singleItemSize2Width: number;
  singleItemSize2Height: number;
  singleItemSize2Depth: number;
  specCategory: Array<SpecCategory>;
  characterCopyrightNameEc: string;
  longDescription: string;
  cautions: string;
  productSpecGroupId: string;
  similarProduct: string;
  recommendedProduct: string;
  comparativeProduct: string;
  kukuru: string;
  variation: Array<Variation>;
  faceProductId: string;
  serviceContents: string;
  prices: Array<Price>;
  inventories: Array<Inventory>;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  campaignPoints?: number;
}

interface TelNumberList {
  contactName: string;
  telNumber: string;
}

interface FloorGuideList {
  floorGuideOrder: number;
  floorGuideName: string;
  floorGuidePdfUrl: string;
  floorGuideUrl: string;
}

interface ToCloseSettings {
  toCloseType: string;
  toCloseFrom: string;
  toCloseUntil: string;
  toCloseMessage: string;
}

interface Announcements {
  code: string;
  title: string;
  body: string;
}

interface GetStoreData {
  code: string;
  name: string;
  webUrl: string;
  address: string;
  postCode: string;
  telNumberList: Array<TelNumberList>;
  businessTime: string;
  businessTimeNote: string;
  regularHoliday: string;
  regularHolidayNote: string;
  webOpenStoreFlag: boolean;
  detail: {
    code: string;
    landscape: {
      latitude: number;
      longitude: number;
    };
    floorGuideList: Array<FloorGuideList>;
    prefectureName: string;
    prefectureCode: string;
    regionCode: string;
    regionName: string;
    openingDate: string;
    closingDate: string;
    closedMessage: string;
    supportPickup: boolean;
    supportCredit: boolean;
    supportPickupInnerLocker: boolean;
    supportPickupPlace: boolean;
    supportPickupPlaceParking: boolean;
    supportBackOrder: boolean;
    supportGeomagnetism: boolean;
    geomagnetismMapId: string;
    supportPocketRegi: boolean;
    supportCuttingService: boolean;
    webCuttingServiceUrl: string;
    supportDIYReserve: boolean;
    webDIYReserveUrl: string;
    supportDogRun: boolean;
    webDogRunUrl: string;
    supportToolRental: boolean;
    webToolRentalUrl: string;
    showVisitingNumber: number;
    toCloseSettings: Array<ToCloseSettings>;
    storeAreaCode: string;
    storeAreaName: string;
    searchWords: string;
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
  };
  announcements: Array<Announcements>;
}

export interface GetProduct {
  status: number;
  data: GetProductData;
}

export interface GetStore {
  status: number;
  data: GetStoreData;
}

interface Member {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  phoneNumber: string;
  postCode: string;
  prefectures: string;
  city: string;
  address1: string;
  address2: string;
  memberId: string;
}

interface AddressBook {
  id: string;
  name: string;
  accountId: string;
  isFavorite: boolean;
  title: string;
  firstName: string;
  lastName: string;
  firstNameKana: string;
  ownNameKana: string;
  zipCode: string;
  prefecture: string;
  address1: string;
  address2: string;
  address3: string;
  phone: string;
  phone2: string;
  email: string;
  companyName: string;
  departmentName: string;
  memo: string;
  ownerId: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

interface MyStores {
  code: string;
  name: string;
  address: string;
  businessTime: string;
  isFavoriteStore: boolean;
  originalCreatedAt: string;
}

export interface GetIndividualShippingFee {
  status: number;
  individualShippingCost?: number;
  subtotalIndividualShippingCost?: number;
}

export interface SelectProductPrice {
  status: number;
  unitPriceForStorePickup: number;
  unitPriceForDelivery: number;
  selectedUnitPrice: number;
}

export interface Errors {
  category: string;
  errorCode: string;
  description: string;
}

export interface Notifications {
  messageCode: string;
  description: string;
}

export interface GetMember {
  status: number;
  member: Member;
  addressBook: Array<AddressBook>;
  availablePoints: number;
  myStores: Array<MyStores>;
}

interface Item {
  productCode: string;
  estimatedDate: string;
  isSeparate: boolean;
}

interface OrderSpecification {
  simulationNumber: string;
  height: number;
  width: number;
  hook: string;
}

interface Pickup {
  dateTime: string;
  items: Array<Item>;
}

interface Shipping {
  estimatedDate: string;
  canSelectDate: boolean;
  items: Array<Item>;
}

export interface Delivery {
  shipping: Shipping;
  pickup: Pickup;
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

export interface RenewProductItems {
  status: number;
  productItems: Array<ProductItem>;
}

export interface GetUser {
  status: number;
  isMember: boolean;
  userData: object;
}

export interface GetShippingCost {
  status: number;
  result?: object;
}

export interface UserInfo {
  isMember: boolean;
  billPayment: boolean;
  zipCode: string;
  prefecture: string;
}
export type InventoryResponse =
  | InventorySuccessResponse
  | InventoryFailResponse;

export interface InventorySuccessResponse {
  status: number;
  errors: InventoryErrorInformationInterface;
  notifications: InventoryErrorInformationInterface;
  productItems: ProductItem[];
}
export interface InventoryFailResponse {
  status: number;
}
export interface InventoryErrorInformationInterface {
  category: string;
  errorCode: string;
  message: string;
}
export type InventoriesInterface = Array<InventoriesObject>;
interface InventoriesObject {
  productId: string;
  storeCode: string;
  quantityOpening: number;
  quantitySold: number;
  quantityAvailable: number;
  quantityAllocated: number;
  quantityExpected: number;
}
interface Items {
  productCode: string;
  canShip: boolean;
  reason: string;
}
export interface CheckNonDeliverResponse {
  canShip: boolean;
  items: Array<Items>;
}
export interface GetEcTemplateResponse {
  status: number;
  informations: Array<object> | null;
}

export type GetEcTemplateRecords = Array<GetEcTemplateRecord>;

interface GetEcTemplateRecord {
  ecTemplateId: string;
  class1: string;
  class2: string;
  class3: string;
  content: string;
  remarks: string;
  publishStatus: string;
}

interface CreditCardData {
  cardSequentialNumber: string;
  cardNumber: string;
  expirationDate: string;
  isDeleted: boolean;
  isDefault: boolean;
}

export interface GetCreditCards {
  status: number;
  registeredCreditCardList: Array<CreditCardData>;
}

interface EstimatedOrderAmount {
  amount: number;
  currencyCode: string;
}
interface CheckoutSessionConfiguration {
  payloadJSON: string;
  signature: string;
  publicKeyId: string;
  algorithm: string;
}
interface AmazonPayButton {
  sandbox: boolean;
  merchantId: string;
  ledgerCurrency: string;
  checkoutLanguage: string;
  productType: string;
  placement: string;
  buttonColor: string;
  estimatedOrderAmount: EstimatedOrderAmount;
  createCheckoutSessionConfig: CheckoutSessionConfiguration;
}
export interface AmazonPayButtonConfig {
  status: number;
  amazonPayButtonConfig: AmazonPayButton;
}

interface ShippingAddress {
  zipCode: string;
  prefecture: string;
  city: string;
  addressBookId: string;
}

export interface UpdateCartsToDbData {
  cartInUse: string;
  productItems: Array<ProductItem>;
  storeCode: string;
  shippingAddress: ShippingAddress;
  updatedAt: Date;
}

export interface UpdateCartsToDbResponse {
  status: number;
}

export interface ReceiptMethodPatternResponse {
  status: number;
  receiptMethodPattern?: number;
}

export interface GetCartsFromDb {
  status: number;
  cartData: object;
}
