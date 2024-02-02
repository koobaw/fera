// eslint-disable-next-line max-classes-per-file
import {
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsEnum,
  ValidateNested,
  IsNumber,
  Matches,
  IsInt,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReceivingMethod } from './post.cart-add-item-body.dto';

enum MembershipRank {
  A_rank = '0',
  B_rank = '1',
  C_rank = '2',
  D_rank = '3',
  E_rank = '4',
  Non_member = '99',
}

class OrderSpecification {
  @IsOptional()
  @Matches(/^([0-9]{2}[-][0-9]{2}[-][0-9]{6})$/)
  simulationNo: string;

  @IsOptional()
  @IsNumber()
  @Matches(/^([0-9]{1,3})$/)
  height: number;

  @IsOptional()
  @IsNumber()
  @Matches(/^([0-9]{1,3})$/)
  width: number;

  @IsOptional()
  hook: string | null;
}

class SpecCategory {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  value: string;
}

class Variation {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  value: string;
}

class Prices {
  @IsOptional()
  @Matches(/^([0-9]{13})$/)
  productId: string;

  @IsOptional()
  @Matches(/^([0-9]{4})$/)
  storeCodes: string;

  @IsOptional()
  @IsEnum(MembershipRank)
  membershipRank: MembershipRank;

  @IsOptional()
  @IsInt()
  priceIncludingTax: number;

  @IsOptional()
  @IsInt()
  salePriceIncludingTax: number;
}

class Inventories {
  @IsNotEmpty()
  @Matches(/^([0-9]{13})$/)
  productId: string;

  @IsOptional()
  @Matches(/^([0-9]{4})$/)
  storeCode: string;

  @IsOptional()
  @IsNumber()
  quantityOpening: number;

  @IsOptional()
  @IsNumber()
  quantitySold: number;

  @IsOptional()
  @IsNumber()
  quantityAvailable: number;

  @IsOptional()
  @IsNumber()
  quantityAllocated: number;

  @IsOptional()
  quantityExpected: number;

  @IsOptional()
  @Matches(/^([0-9]{4}-[0-9]{2}-[0-9]{2}T)+([0-9]{2}:[0-9]{2}:[0-9.Z]+)$/)
  expectedArrivalDate: Date;
}

class Items {
  @IsNotEmpty()
  productCode: string;

  @IsOptional()
  estimatedDate: Date;

  @IsOptional()
  isSeparate: boolean;
}

class Shipping {
  @IsOptional()
  estimatedDate: Date;

  @IsOptional()
  canSelectDate: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Items)
  items: Items[];
}

class Pickup {
  @IsOptional()
  dateTime: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Items)
  items: Items[];
}

class Delivery {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Shipping)
  shipping: Shipping;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Pickup)
  pickup: Pickup;
}

class Product {
  @IsNotEmpty()
  @Matches(/^([0-9]{13})$/)
  productId: string;

  @IsOptional()
  name: string;

  @IsOptional()
  categoryId: string;

  @IsOptional()
  imageUrls: string[];

  @IsOptional()
  departmentCode: string;

  @IsOptional()
  lineCode: string;

  @IsOptional()
  classCode: string;

  @IsOptional()
  description: string;

  @IsOptional()
  applicableStartDate: Date;

  @IsOptional()
  salesStartDate: Date;

  @IsOptional()
  @IsNumber()
  consumptionTaxRate: number;

  @IsOptional()
  consumptionTaxCategory: string;

  @IsOptional()
  salesEndDate: Date;

  @IsOptional()
  salesEndFlag: boolean;

  @IsOptional()
  designatedPharmaceuticalCategory: string;

  @IsOptional()
  liquorCategory: string;

  @IsOptional()
  tobaccoCategory: string;

  @IsOptional()
  hazardousMaterialFlag: boolean;

  @IsOptional()
  medicalEquipmentClas: string;

  @IsOptional()
  poisonousDeleteriousSubstanceCategory: string;

  @IsOptional()
  poisonousDrugCategory: string;

  @IsOptional()
  agriculturalChemicalCategory: string;

  @IsOptional()
  animalDrugCategory: string;

  @IsOptional()
  warrantyIssuanceCategory: string;

  @IsOptional()
  pharmaceuticalFlag: boolean;

  @IsOptional()
  salesTypeCategory: string;

  @IsOptional()
  warrantyCategory: string;

  @IsOptional()
  warrantyPeriod: string;

  @IsOptional()
  deliveryChargeCategoryEc: string;

  @IsOptional()
  onlineFlagEc: boolean;

  @IsOptional()
  onlineStartTimeEc: Date;

  @IsOptional()
  onlineEndTimeEc: Date;

  @IsOptional()
  consumptionTaxCategoryEc: string;

  @IsOptional()
  onlineSalesCategoryEc: string;

  @IsOptional()
  @IsNumber()
  individualDeliveryChargeEc: number;

  @IsOptional()
  setProductFlag: boolean;

  @IsOptional()
  configurationFlag: boolean;

  @IsOptional()
  customizedProductCategory: string;

  @IsOptional()
  @IsNumber()
  minOrderQuantity: number;

  @IsOptional()
  @IsNumber()
  maxOrderQuantity: number;

  @IsOptional()
  @IsNumber()
  stepQuantity: number;

  @IsOptional()
  @IsNumber()
  storeMinOrderQuantity: number;

  @IsOptional()
  @IsNumber()
  storeMaxOrderQuantity: number;

  @IsOptional()
  @IsNumber()
  storeStepOrderQuantity: number;

  @IsOptional()
  newPeriodFrom: Date;

  @IsOptional()
  reserveFromStoreDisabled: boolean;

  @IsOptional()
  sendToStoreDisabled: boolean;

  @IsOptional()
  personalDeliveryDisabled: boolean;

  @IsOptional()
  @IsNumber()
  estimatedArrivalDays: number;

  @IsOptional()
  productWithServiceFlag: boolean;

  @IsOptional()
  dropShippingCategory: string;

  @IsOptional()
  originCountryCode: string;

  @IsOptional()
  flavorExpirationCategory: string;

  @IsOptional()
  @IsNumber()
  flavorExpiration: number;

  @IsOptional()
  productCharacteristics: string;

  @IsOptional()
  colorPattern: string;

  @IsOptional()
  size: string;

  @IsOptional()
  brandName: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSizeWidth: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSizeHeight: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSizeDepth: number;

  @IsOptional()
  @IsNumber()
  contentAmount: number;

  @IsOptional()
  contentAmountUnit: string;

  @IsOptional()
  modelNo: string;

  @IsOptional()
  lawsStandards: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSize2Width: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSize2Height: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  singleItemSize2Depth: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecCategory)
  specCategory: SpecCategory[];

  @IsOptional()
  characterCopyrightNameEc: string;

  @IsOptional()
  longDescription: string;

  @IsOptional()
  cautions: string;

  @IsOptional()
  productSpecGroupId: string;

  @IsOptional()
  similarProduct: string;

  @IsOptional()
  recommendedProduct: string;

  @IsOptional()
  comparativeProduct: string;

  @IsOptional()
  kukuru: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Variation)
  variation: Variation[];

  @IsOptional()
  faceProductId: string;

  @IsOptional()
  serviceContents: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Prices)
  prices: Prices[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Inventories)
  inventories: Inventories[];
}

class Error {
  @IsNotEmpty()
  errorCode: string;

  @IsOptional()
  description: string;
}

class Errors2 {
  @IsNotEmpty()
  errorCode: string;

  @IsOptional()
  description: string;
}

class Notifications {
  @IsNotEmpty()
  messageCode: string;

  @IsOptional()
  description: string;
}

class ProductItems {
  @IsNotEmpty()
  itemId: string;

  @IsOptional()
  @IsEnum(ReceivingMethod)
  receivingMethod: ReceivingMethod;

  @IsNotEmpty()
  @Matches(/^([0-9]{13})$/)
  productId: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  orderSpecification: OrderSpecification;

  @IsOptional()
  @ValidateNested()
  @Type(() => Product)
  product: Product;

  @IsOptional()
  @ValidateNested()
  @Type(() => Delivery)
  delivery: Delivery;

  @IsOptional()
  setProductType: string;

  @IsOptional()
  isReserveFromStoreAvailable: boolean;

  @IsOptional()
  isPersonalDeliveryAvailable: string;

  @IsOptional()
  invalidWebBackOrderFlagForStorePickup: boolean;

  @IsOptional()
  invalidWebBackOrderFlagForDesignatedDelivery: boolean;

  @IsOptional()
  isWebBackOrder: boolean;

  @IsOptional()
  @IsInt()
  unitPrice: number;

  @IsOptional()
  @IsInt()
  subtotalProductAmount: number;

  @IsOptional()
  @IsInt()
  individualShippingCost: number;

  @IsOptional()
  @IsInt()
  subtotalIndividualShippingCost: number;

  @IsOptional()
  @IsInt()
  campaignPoints: number;

  @IsOptional()
  @IsInt()
  subtotalCampaignPoints: number;

  @IsOptional()
  isCheckoutTarget: boolean;

  @IsOptional()
  checkoutId: string;

  @IsOptional()
  checkoutStatus: string;

  @IsOptional()
  @IsArray()
  error: Error;

  @IsOptional()
  @IsArray()
  error2: Errors2;

  @IsOptional()
  @IsArray()
  notifications: Notifications;
}

class TelNumberList {
  @IsNotEmpty()
  contactName: string;

  @IsNotEmpty()
  @Matches(/^([0-9]{10,11})$/)
  telNumber: string;
}

class Landscape {
  @IsNotEmpty()
  @IsInt()
  latitude: number;

  @IsNotEmpty()
  @IsInt()
  longitude: number;
}

class FloorGuideList {
  @IsNotEmpty()
  @IsNumber()
  floorGuideOrder: number;

  @IsNotEmpty()
  floorGuideName: string;

  @IsOptional()
  floorGuideUrl: string;
}

class MessageSettings {
  @IsNotEmpty()
  from: Date;

  @IsNotEmpty()
  to: Date;

  @IsNotEmpty()
  message: string;
}

class Detail {
  @IsOptional()
  mainBuildingOpeningTime: Date;

  @IsOptional()
  mainBuildingClosingTime: Date;

  @IsOptional()
  ResourceBuildingOpeningTime: Date;

  @IsOptional()
  ResourceBuildingClosingTime: Date;

  @IsOptional()
  storeMapUrl: string;

  @IsOptional()
  visible: boolean;

  @IsOptional()
  publiclyAccessible: boolean;

  @IsOptional()
  publiclyAccessibleFrom: Date;

  @IsOptional()
  publiclyAccessibleTo: Date;

  @IsOptional()
  @Matches(/^([0-9]{4})$/)
  code: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Landscape)
  landscape: Landscape;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorGuideList)
  floorGuideList: FloorGuideList[];

  @IsOptional()
  prefectureName: string;

  @IsOptional()
  prefectureCode: string;

  @IsOptional()
  openingDate: Date;

  @IsOptional()
  closingDate: Date;

  @IsOptional()
  supportPickup: boolean;

  @IsOptional()
  supportCredit: boolean;

  @IsOptional()
  supportPickupInnerLocker: boolean;

  @IsOptional()
  supportPickupPlace: boolean;

  @IsOptional()
  supportPickupPlaceParking: boolean;

  @IsOptional()
  supportBackOrder: boolean;

  @IsOptional()
  supportGeomagnetism: boolean;

  @IsOptional()
  geomagnetismMapId: string;

  @IsOptional()
  supportPocketRegi: boolean;

  @IsOptional()
  supportCuttingService: boolean;

  @IsOptional()
  supportDIYReserve: boolean;

  @IsOptional()
  supportDogRun: boolean;

  @IsOptional()
  supportToolRental: boolean;

  @IsOptional()
  showVisitingNumber: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageSettings)
  messageSettings: MessageSettings[];

  @IsOptional()
  digitalFlyerURL: string;

  @IsOptional()
  materialHallExistence: boolean;

  @IsOptional()
  cultureClassExistence: boolean;

  @IsOptional()
  cycleParkExistence: boolean;

  @IsOptional()
  DIYSTYLEFloorExistence: boolean;

  @IsOptional()
  dogParkExistence: boolean;

  @IsOptional()
  exteriorPlazaExistence: boolean;

  @IsOptional()
  foodAreaExistence: boolean;

  @IsOptional()
  gardeningHallExistence: boolean;

  @IsOptional()
  greenAdvisorExistence: boolean;

  @IsOptional()
  petsOneExistence: boolean;

  @IsOptional()
  reformCenterExistence: boolean;

  @IsOptional()
  workshopExistence: boolean;

  @IsOptional()
  storePickupExistence: boolean;

  @IsOptional()
  supermarketExistence: boolean;
}

class Announcements {
  @IsNotEmpty()
  @Matches(/^([0-9]{4})$/)
  code: string;

  @IsOptional()
  title: string;

  @IsOptional()
  body: string;
}

class StoreInfo {
  @IsOptional()
  @Matches(/^([0-9]{4})$/)
  code: string;

  @IsOptional()
  name: string;

  @IsOptional()
  address: string;

  @IsOptional()
  @Matches(/^([0-9]{7})$/)
  postCode: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelNumberList)
  telNumberList: TelNumberList[];

  @IsOptional()
  businessTime: Date;

  @IsOptional()
  businessTimeNote: string;

  @IsOptional()
  regularHoliday: string;

  @IsOptional()
  regularHolidayNote: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Detail)
  detail: Detail;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Announcements)
  announcements: Announcements[];
}

class ShippingAddress {
  @IsNotEmpty()
  @Matches(/^([0-9]{4})$/)
  zipCode: string;

  @IsNotEmpty()
  prefecture: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  addressBookId: string;
}

export class CartChangeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItems)
  productItems: ProductItems[];

  storeCode: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddress)
  shippingAddress: ShippingAddress;
}
