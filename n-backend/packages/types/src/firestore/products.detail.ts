import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const PRODUCTS_DETAIL_COLLECTION_NAME = 'detail';

export interface ProductDetail extends Auditable {
  productId: string;
  description: string | null;
  departmentCode: string;
  lineCode: string;
  classCode: string;
  applicableStartDate: Timestamp | null;
  salesStartDate: Timestamp | null;
  salesEndDate: Timestamp | null;
  salesEndFlag: boolean;
  consumptionTaxRate: number;
  consumptionTaxCategory: string;
  designatedPharmaceuticalCategory: string | null;
  liquorCategory: string | null;
  tobaccoCategory: string | null;
  hazardousMaterialFlag: boolean;
  medicalEquipmentClass: string | null;
  poisonousDeleteriousSubstanceCategory: string | null;
  poisonousDrugCategory: string | null;
  agriculturalChemicalCategory: string | null;
  animalDrugCategory: string | null;
  warrantyIssuanceCategory: string | null;
  pharmaceuticalFlag: boolean;
  salesTypeCategory: string | null;
  warrantyCategory: string | null;
  warrantyPeriod: string | null;
  deliveryChargeCategoryEc: string | null;
  onlineFlagEc: boolean;
  onlineStartTimeEc: Timestamp | null;
  onlineEndTimeEc: Timestamp | null;
  consumptionTaxCategoryEc: string | null;
  onlineSalesCategoryEc: string | null;
  individualDeliveryChargeEc: number;
  setProductFlag: boolean;
  configurationFlag: boolean;
  customizedProductCategory: string | null;
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  stepQuantity: number | null;
  storeMinOrderQuantity: number | null;
  storeMaxOrderQuantity: number | null;
  storeStepOrderQuantity: number | null;
  newPeriodFrom: Timestamp | null;
  reserveFromStoreDisabled: boolean;
  sendToStoreDisabled: boolean;
  personalDeliveryDisabled: boolean;
  estimatedArrivalDays: number | null;
  productWithServiceFlag: boolean;
  dropShippingCategory: string | null;
  largeSizedProductCategoryEc: string | null;
  originCountryCode: string | null;
  flavorExpirationCategory: string | null;
  flavorExpiration: number | null;
  productCharacteristics: string | null;
  colorPattern: string | null;
  size: string | null;
  brandName: string | null;
  singleItemSizeWidth: number | null;
  singleItemSizeHeight: number | null;
  singleItemSizeDepth: number | null;
  contentAmount: number | null;
  contentAmountUnit: string | null;
  modelNo: string | null;
  lawsStandards: string | null;
  singleItemSize2Width: number | null;
  singleItemSize2Height: number | null;
  singleItemSize2Depth: number | null;
  characterCopyrightNameEc: string | null;
  longDescription: string | null;
  cautions: string | null;
  productSpecGroupId: string | null;
  similarProduct: string | null;
  recommendedProduct: string | null;
  comparativeProduct: string | null;
  kukuru: string | null;
  variation: ProductDetailVariation[];
  faceProductId: string | null;
  serviceContents: string | null;
}

export interface ProductDetailVariation {
  id: string;
  value: string;
}

export type OmitTimestampProductDetail = Omit<
  ProductDetail,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
