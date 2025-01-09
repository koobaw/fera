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
  variations: ProductDetailVariations[];
  variationProducts: ProductDetailVariationProducts[];
  faceProductId: string | null;
  serviceContents: string | null;
  relationProducts: ProductDetailRelationProducts[];
}

export interface ProductDetailVariation {
  id: string;
  value: string;
}

export interface ProductDetailVariations {
  variationId: string;
  type: string;
  label: string;
  options: ProductDetailVariationsOptions[];
}

export interface ProductDetailVariationsOptions {
  optionId: string;
  name: string;
  imageUrl: string;
}

export interface ProductDetailVariationProducts {
  productId: string;
  targetOptionIds: string[];
}

export interface ProductDetailRelationProducts {
  productId: string;
  relationType: string;
}

// NOTE: この行より下のcodeは商品詳細の修正のため、一部で一時的にTmpのprefixをつけて作成している。処理修正の際にはTmpを外して実装する。
// NOTE: この行い以下の部分の修正が正な商品詳細のschemaとなるため、本実装でこれより上のcodeは削除する
export interface TmpProductDetail extends Auditable {
  productId: string; // 商品code(JAN)
  name: string; // 商品名称
  cost: number; // 原単価(税抜)
  price: number; // 売単価(税込)
  departmentCode: string | null; // DPTコード(department選択時に付加)
  lineCode: string | null; // ラインコード(line選択時に付加)
  classCode: string | null; // クラスコード(class選択時に付加)
  description: string | null; // 商品詳細情報(description選択時に付加)
  supplierCode1: string | null; // 代表仕入れ先コード(supplier選択時に付加)
  supplierCode2: string | null; // 代表仕入れ先コード2(supplier2選択時に付加)
  singleItemByStore: SingleItemByStore | undefined; // 店別単品情報レコード(store選択時に付加)
  productRelationship: RelativeProduct[] | null; // 関連商品(pmr選択時に付加)
  salesControlField: SalesControlField | null; // 販売制御(sc選択時に付加)
  logisticsControlField: LogisticsControlField | null; // 物流管理(lm物流管理選択時に付加)
  productIdentificationField: ProductIdentificationField | null; // 商品特定(pi選択時に付加)
  productExplanationField: ProductExplanationField | null; // 商品説明(pd選択時に付加)
  relativeProductField: RelativeProductField | null; // 関連商品(rp選択時に付加 NOTE:このフィールドは将来的に廃止予定)
  variationField: VariationField | null; // 商品バリエーション(variation選択時に付加)
}

export interface SingleItemByStore {
  shopCode: number; // 店舗コード
  cost: number; // 店別の原単価（税抜）
  price: number; // 店別の売単価(税込)
}

export interface SalesControlField {
  applicableStartDate: Timestamp | null; // 適応開始日
  salesStartDate: Timestamp | null; // 販売開始日
  consumptionTaxRate: number | null; // 消費税税率
  consumptionTaxCategory: string | null; // 消費税区分
  salesEndDate: Timestamp | null; // 販売終了日
  salesEndFlag: boolean; // 販売終了フラグ
  designatedPharmaceuticalCategory: string | null; // 指定医療薬品区分
  liquorCategory: string | null; // 酒類区分
  tobaccoCategory: string | null; // タバコ区分
  hazardousMaterialFlag: boolean; // 危険物フラグ
  medicalEquipmentClass: string | null; // 医療機器クラス
  poisonousDeleteriousSubstanceCategory: string | null; // 毒物・劇物区分
  poisonousDrugCategory: string | null; // 毒薬・劇薬区分
  agriculturalChemicalCategory: string | null; // 農薬区分
  animalDrugCategory: string | null; // 動物薬区分
  warrantyIssuanceCategory: string | null; // 保証書発行区分
  pharmaceuticalFlag: boolean; // 医療品フラグ
  salesTypeCategory: string | null; // 販売形態区分
  warrantyCategory: string | null; // 保証区分
  warrantyPeriod: string | null; // 保証期間
  deliveryChargeCategoryEc: string | null; // 送料区分EC用
  onlineFlagEc: boolean; // オンラインフラグEC用
  onlineStartTimeEc: Timestamp | null; // オンライン開始日時EC用
  onlineEndTimeEc: Timestamp | null; // オンライン終了日時EC用
  consumptionTaxCategoryEc: string | null; // 消費税区分EC用
  onlineSalesCategoryEc: string | null; // オンライン販売区分EC用
  individualDeliveryChargeEc: number | null; // 個別送料額EC用
  setProductFlag: boolean; // セット品フラグ
  configurationFlag: boolean; // 構成フラグ
  customizedProductCategory: string | null; // 商品固有区分
  minOrderQuantity: number | null; // EC用最小注文数量
  maxOrderQuantity: number | null; // EC用最大注文数量
  stepQuantity: number | null; // EC用ステップ数量
  storeMinOrderQuantity: number | null; // 店舗取り置き用最小注文数量
  storeMaxOrderQuantity: number | null; // 店舗取り置き用最大注文数量
  storeStepOrderQuantity: number | null; // 店舗取り置き用ステップ数量
  newPeriodFrom: Timestamp | null; // 新商品期間開始日
  reserveFromStoreDisabled: boolean; // 取り置き不可フラグ
  sendToStoreDisabled: boolean; // 送料込みフラグ
  personalDeliveryDisabled: boolean; // 個別配送不可フラグ
  estimatedArrivalDays: number | null; // 特殊商品お届け予定算出日数
  productWithServiceFlag: boolean; // 付帯サービス商品フラグ
  dropShippingCategory: string | null; // ドロップシップ区分
  productArrivalDateText: string | null; // お届け予定日テキスト
  webBackOrderNotAllowedFlag: boolean; // web取り寄せ不可フラグ
}

export interface LogisticsControlField {
  vendorCode: string | null; // 仕入れ先コード
  representativeSupplierCode: string | null; // 代表仕入れ先コード
  representativeSupplierName: string | null; // 代表仕入れ先名
  distributionTypeCategory: string | null; // 物流形態区分
  deliveryTypeCategory: string | null; // 納品形態区分
  pickingListIssuanceCategory: string | null; // ピッキングリスト発行区分
  orderingUnitIndex: number[] | null; // 発注単位索引用
  minimumOrderQuantity: number | null; // 最低発注数量
  distributionComments: string | null; // 物流コメント
  shippingLot: number | null; // 出荷ロット
  packingFormCategory: string | null; // 荷姿区分
  largeSizedProductCategoryEc: string | null; // 大型商品区分EC用
  onlineOrderCategoryOnProductArrival: string | null; // オンライン入荷時発注区分
  numberOfBoxes: number | null; // 複数個口数
  receivingLimitDays: string | null; // 入庫限度日数
  shippingLimitDays: string | null; // 出荷限度日数
  distributionExtensionItem1: string | null; // 物流閣僚項目1
  distributionExtensionItem3: string | null; // 物流閣僚項目3
  shippingManagementPartNumber: string | null; // 出荷元管理品番
  salesProcessingJanCode: string | null; // 売上連携用JANコード
}

export interface ProductIdentificationField {
  productGroupCode: string | null; // 商品グループコード
  productNameInKanji: string | null; // 商品名(漢字)
  productNameInKatakana: string | null; // 商品名(カナ)
  productShortNameInKanji: string | null; // 商品名略称(漢字)
  productShortNameInKatakana: string | null; // 商品名略称(カナ)
  popProductName: string | null; // POP商品名
  productClassification: ProductClassification[] | null; // 商品分類コード名称1
  pbCategory: string | null; // PB区分
  feraOriginalProduct: boolean; // カインズオリジナル商品
  representativeJanCode: string | null; // 代表JANコード
  pbCategory2: string | null; // PB区分2
  ecProductNameEc: string | null; // EC用商品名
  searchKeywordListHigh: string | null; // キーワード検索用語(高)
  searchKeywordListMiddle: string | null; // キーワード検索用語(中)
  searchKeywordListLow: string | null; // キーワード検索用語(低)
  mainCategory: string | null; // 主要カテゴリ
}

export interface ProductExplanationField {
  originCountryCode: string | null; // 原産国コード
  flavorExpirationCategory: string | null; // 賞味期限区分
  flavorExpiration: number | null; // 賞味期限
  productCharacteristics: string | null; // 商品特徴
  colorPattern: string | null; // 色柄
  size: string | null; // サイズ
  brandName: string | null; // ブランド名
  singleItemSizeWidth: number | null; // 単品サイズ(幅)
  singleItemSizeHeight: number | null; // 単品サイズ(高さ)
  singleItemSizeDepth: number | null; // 単品サイズ(奥行)
  contentAmount: number | null; // 内容量
  contentAmountUnit: string | null; // 内容量単位
  modelNo: string | null; // 型番
  lawsStandards: string | null; // 法令・規格
  singleItemSize2Width: number | null; // 単品サイズ2(幅)
  singleItemSize2Height: number | null; // 単品サイズ2(高さ)
  singleItemSize2Depth: number | null; // 単品サイズ2(奥行)
  // NOTE: specCategoryの項目はArrayにして別のサブコレクションで管理
  characterCopyrightNameEc: string | null; // キャラクターコピーライト名EC用
  longDescription: string | null; // 商品特徴EC用
  cautions: string | null; // 注意事項
  productSpecGroupId: string | null; // 商品スペックグループ
}

interface RelativeProduct {
  relationType: string; // 関連タイプ(01:後継品、02:関連品、03:類似品、04:比較商品)
  productId: string; // 関連商品コード
}

// NOTE: 関連商品フィールドは将来的に廃止される予定
export interface RelativeProductField {
  similarProduct: string | null; // 類似品
  recommendedProduct: string | null; // おすすめ商品
  comparativeProduct: string | null; // 比較商品
  kukuru: string | null; // KUKURU
  variations: {
    variationId: string; // バリエーション項目ID
    variation: string; // バリエーション項目
  };
  faceProductId: string | null; // FACE商品JANコード
  serviceContents: string | null; // 関連サービス
}

export interface VariationField {
  variations: Variation[]; // バリエーションオブジェクト配列
  variants: VariationProduct[]; // バリエーション商品オブジェクト配列
}

interface Variation {
  variationId: string; // バリエーションID
  displayType: string; // バリエーション表示タイプ(1:カラーチップ、2:テキスト、3:ラジオボタン、4:プルダウン)
  label: string; // バリエーションラベル
  options: VariationOption[]; // バリエーションオプションオブジェクト配列
}

interface VariationOption {
  optionId: string; // バリエーションオプションID
  name: string; // バリエーションオプション名
  imageUrl: string; // バリエーションオプション画像URL
}

interface VariationProduct {
  productId: string; // バリエーション商品コード(JAN)
  composition: string[]; // バリエーションオプションID配列(対象となるバリエーション)
}

interface ProductClassification {
  productClassificationCodeName: string | null; // 商品分類コード名称
  productClassificationCode: string; // 商品分類コード
}

export type OmitTimestampProductDetail = Omit<
  ProductDetail,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
