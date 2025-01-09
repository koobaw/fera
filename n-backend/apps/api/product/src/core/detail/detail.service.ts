import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Product,
  ProductDetail,
  ProductSpecCategory,
  ProductDetailVariation,
  PRODUCTS_COLLECTION_NAME,
  PRODUCTS_DETAIL_COLLECTION_NAME,
  PRODUCTS_SPECCATEGORIES_COLLECTION_NAME,
  SpecCategory,
  OmitTimestampProduct,
} from '@fera-next-gen/types';
import { CommonService } from '@fera-next-gen/common';
import firestore, { DocumentReference } from '@google-cloud/firestore';

import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

import {
  ProductDetails,
  InterProductDetails,
} from './interfaces/detail.interface';
import { DetailDto } from './dto/detail.dto';
import { DetailMuleApiService } from './detail-mule-api/detail-mule-api.service';
import { MuleProductDetail } from './interfaces/mule-api-detail.interface';

@Injectable()
export class DetailService {
  private readonly MAX_IMG_URLS = 6;

  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly detailMuleService: DetailMuleApiService,
    private readonly commonService: CommonService,
  ) {}

  public async getDetail(detailDto: DetailDto): Promise<ProductDetails[]> {
    const muleData = await this.detailMuleService.getDetailFromMule(detailDto);

    if (muleData.length === 0) {
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_NOT_FOUND,
          message: ErrorMessage[ErrorCode.DETAIL_NG_NOT_FOUND],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const product = muleData.map((data) => {
      const productHeader = this.generateProduct(data);
      const productDetail = this.generateProductDetail(data);
      const specCategories = this.generateSpecCategories(data);
      return { header: productHeader, detail: productDetail, specCategories };
    });

    return product;
  }

  public async saveToFirestore(
    products: ProductDetails[],
    operatorName: string,
    saveDetail = true,
  ) {
    this.logger.debug('start saveToFirestore(products)');

    try {
      const productCollection = this.firestoreBatchService.findCollection(
        PRODUCTS_COLLECTION_NAME,
      );

      await Promise.all(
        products.map(async (product) => {
          const docId = this.getDocId(product.detail.productId);

          const productDocRef = productCollection.doc(docId);
          // productsに保存
          await this.batchSetProduct(productDocRef, product, operatorName);

          if (saveDetail) {
            // products.detailに保存
            await this.batchSetProductDetail(
              productDocRef,
              product,
              operatorName,
            );

            // products.specCategories保存
            await this.batchSetSpecCategories(
              productDocRef,
              product,
              operatorName,
            );
          }
        }),
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(`Save to firestore is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.DETAIL_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end saveToFirestore(products)');
  }

  private generateSpecCategories(muleProductDetail: MuleProductDetail) {
    const NAME_PREFIX = 'specCategoryName';
    const VALUE_PREFIX = 'specCategoryValue';
    const categories = (nameKeys: Array<string>): Array<SpecCategory> =>
      nameKeys.map((_, index) => {
        const categoryNumber: string = nameKeys[index].split(NAME_PREFIX)[1];
        return {
          name: muleProductDetail[nameKeys[index]],
          value: muleProductDetail[VALUE_PREFIX + categoryNumber] ?? '',
          sortOrder: categoryNumber,
        };
      });

    const nameKeys = Object.keys(muleProductDetail)
      .filter((key) => key.startsWith(NAME_PREFIX))
      .sort(
        (key1, key2) =>
          Number(key1.split(NAME_PREFIX)[1]) -
          Number(key2.split(NAME_PREFIX)[1]),
      );

    return categories(nameKeys);
  }

  private generateVariation(muleProductDetail: MuleProductDetail) {
    const NAME_PREFIX = 'variationId';
    const VALUE_PREFIX = 'variation';
    const variations = (
      nameKeys: Array<string>,
    ): Array<ProductDetailVariation> =>
      nameKeys.map((_, index) => {
        const categoryNumber: string = nameKeys[index].split(NAME_PREFIX)[1];
        return {
          id: muleProductDetail[nameKeys[index]],
          value: muleProductDetail[VALUE_PREFIX + categoryNumber] ?? '',
        };
      });

    const nameKeys = Object.keys(muleProductDetail)
      .filter((key) => key.startsWith(NAME_PREFIX))
      .sort(
        (key1, key2) =>
          Number(key1.split(NAME_PREFIX)[1]) -
          Number(key2.split(NAME_PREFIX)[1]),
      );

    const tempVariations = variations(nameKeys);
    return tempVariations.filter((variation) => variation.id != null);
  }

  private generateCategoryId(
    muleProductDetail: MuleProductDetail,
  ): string | null {
    const mainCategory = muleProductDetail?.mainCategory ?? null;
    if (mainCategory == null) {
      return null;
    }
    // mainCategory は {カテゴリId:カテゴリ名} の形式になっている想定
    const tmpMainCategory: string[] = mainCategory.split(':');
    let categoryId = null;

    if (tmpMainCategory.length > 1) {
      [categoryId] = tmpMainCategory;
    }
    return categoryId;
  }

  private generateProduct(muleData: MuleProductDetail): OmitTimestampProduct {
    const productId = muleData.code;
    const imageUrls = this.generateImageUrls(productId);
    const row: OmitTimestampProduct = {
      productId,
      name: muleData.name,
      categoryId: this.generateCategoryId(muleData),
      imageUrls,
    };

    return row;
  }

  private generateProductDetail(
    muleData: MuleProductDetail,
  ): InterProductDetails {
    const lawData = muleData as MuleProductDetail;
    const variation = this.generateVariation(lawData);
    const row: InterProductDetails = {
      productId: lawData.code,
      departmentCode: lawData.departmentCode,
      lineCode: lawData.lineCode,
      classCode: lawData.classCode,
      description: lawData.description,
      applicableStartDate:
        this.commonService.convertDateStringToJstTimestampString(
          lawData.applicableStartDate,
        ),
      salesStartDate: this.commonService.convertDateStringToJstTimestampString(
        lawData.salesStartDate,
      ),
      salesEndDate: this.commonService.convertDateStringToJstTimestampString(
        lawData.salesEndDate,
      ),
      salesEndFlag: this.convertToBoolean(lawData.salesEndFlag),
      consumptionTaxRate: lawData.consumptionTaxRate,
      consumptionTaxCategory: lawData.consumptionTaxCategory,
      designatedPharmaceuticalCategory:
        lawData?.designatedPharmaceuticalCategory ?? null,
      liquorCategory: lawData?.liquorCategory ?? null,
      tobaccoCategory: lawData?.tobaccoCategory ?? null,
      hazardousMaterialFlag: this.convertToBoolean(
        lawData?.hazardousMaterialFlag,
      ),
      medicalEquipmentClass: lawData?.medicalEquipmentClass ?? null,
      poisonousDeleteriousSubstanceCategory:
        lawData?.poisonousDeleteriousSubstanceCategory ?? null,
      poisonousDrugCategory: lawData?.poisonousDrugCategory ?? null,
      agriculturalChemicalCategory:
        lawData?.agriculturalChemicalCategory ?? null,
      animalDrugCategory: lawData?.poisonousDrugCategory ?? null,
      warrantyIssuanceCategory: lawData?.poisonousDrugCategory ?? null,
      pharmaceuticalFlag: this.convertToBoolean(lawData?.pharmaceuticalFlag),
      salesTypeCategory: lawData?.salesTypeCategory ?? null,
      warrantyCategory: lawData?.warrantyCategory ?? null,
      warrantyPeriod: lawData?.warrantyPeriod ?? null,
      deliveryChargeCategoryEc: lawData?.deliveryChargeCategoryEc ?? null,
      onlineFlagEc: this.convertToBoolean(lawData.onlineFlagEc),
      onlineStartTimeEc: lawData.onlineStartTimeEc,
      onlineEndTimeEc: lawData.onlineEndTimeEc,
      consumptionTaxCategoryEc: lawData.consumptionTaxCategoryEc,
      onlineSalesCategoryEc: lawData.onlineSalesCategoryEc,
      individualDeliveryChargeEc: lawData.individualDeliveryChargeEc,
      setProductFlag: this.convertToBoolean(lawData.setProductFlag),
      configurationFlag: this.convertToBoolean(lawData.configurationFlag),
      customizedProductCategory: lawData.customizedProductCategory,
      minOrderQuantity: lawData?.minOrderQuantity ?? null,
      maxOrderQuantity: lawData?.maxOrderQuantity ?? null,
      stepQuantity: lawData?.stepQuantity ?? null,
      storeMinOrderQuantity: lawData.storeMinOrderQuantity,
      storeMaxOrderQuantity: lawData.storeMaxOrderQuantity,
      storeStepOrderQuantity: lawData.storeStepOrderQuantity,
      newPeriodFrom: lawData.newPeriodFrom,
      reserveFromStoreDisabled: this.convertToBoolean(
        lawData.reserveFromStoreDisabled,
      ),
      sendToStoreDisabled: this.convertToBoolean(lawData.sendToStoreDisabled),
      personalDeliveryDisabled: this.convertToBoolean(
        lawData.personalDeliveryDisabled,
      ),
      estimatedArrivalDays: lawData?.maxOrderQuantity ?? null,
      productWithServiceFlag: this.convertToBoolean(
        lawData.productWithServiceFlag,
      ),
      dropShippingCategory: lawData.dropShippingCategory,
      largeSizedProductCategoryEc: lawData.largeSizedProductCategoryEc,
      originCountryCode: lawData?.originCountryCode ?? null,
      flavorExpirationCategory: lawData?.flavorExpirationCategory ?? null,
      flavorExpiration: lawData?.maxOrderQuantity ?? null,
      productCharacteristics: lawData?.productCharacteristics ?? null,
      colorPattern: lawData?.colorPattern ?? null,
      size: lawData?.size ?? null,
      brandName: lawData?.brandName ?? null,
      singleItemSizeWidth: lawData?.singleItemSizeWidth ?? null,
      singleItemSizeHeight: lawData?.singleItemSizeHeight ?? null,
      singleItemSizeDepth: lawData?.singleItemSizeDepth ?? null,
      contentAmount: lawData?.contentAmount ?? null,
      contentAmountUnit: lawData?.contentAmountUnit ?? null,
      modelNo: lawData?.modelNo ?? null,
      lawsStandards: lawData?.lawsStandards ?? null,
      singleItemSize2Width: lawData?.singleItemSize2Width ?? null,
      singleItemSize2Height: lawData?.singleItemSize2Height ?? null,
      singleItemSize2Depth: lawData?.singleItemSize2Depth ?? null,
      characterCopyrightNameEc: lawData?.characterCopyrightNameEc ?? null,
      longDescription: lawData?.longDescription ?? null,
      cautions: lawData?.cautions ?? null,
      productSpecGroupId: lawData?.productSpecGroupId ?? null,
      similarProduct: lawData?.similarProduct ?? null,
      recommendedProduct: lawData?.recommendedProduct ?? null,
      comparativeProduct: lawData?.comparativeProduct ?? null,
      kukuru: lawData.kukuru,
      variation,
      faceProductId: lawData?.faceProductId ?? null,
      serviceContents: lawData?.serviceContents ?? null,
      variations: [],
      variationProducts: [],
      relationProducts: [],
    };

    return row;
  }

  private generateImageUrls(productId: string): Array<string> {
    const ret = [];
    for (let i = 1; i <= this.MAX_IMG_URLS; i++) {
      const imgNo = i.toString().padStart(2, '0');
      const imgUrl = `https://imgix.fera.com/${productId}/product/${productId}_${imgNo}.jpg`;
      ret.push(imgUrl);
    }
    return ret;
  }

  private convertToBoolean(code: string | undefined): boolean {
    // 0かundefinedであればfalse、それ以外はtrueを返す
    if (!code) {
      return false;
    }
    if (code === '0') {
      return false;
    }
    return true;
  }

  private getDocId(productId: string) {
    // productsのdocumentId(productIdの文字列を反転)を取得する
    return productId.split('').reverse().join('');
  }

  private async batchSetProduct(
    productDocRef: DocumentReference,
    product: ProductDetails,
    operatorName: string,
  ) {
    this.logger.debug('start batchSetProduct');
    try {
      const oldProduct = await productDocRef.get();
      let saveProductData: Product;
      const productHeader = product.header;

      if (oldProduct.exists) {
        saveProductData = {
          productId: productHeader.productId,
          categoryId: productHeader.categoryId,
          name: productHeader.name,
          imageUrls: productHeader.imageUrls,
          createdBy: oldProduct.data()?.createdBy,
          createdAt: oldProduct.data()?.createdAt,
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      } else {
        saveProductData = {
          productId: productHeader.productId,
          categoryId: productHeader.categoryId,
          name: productHeader.name,
          imageUrls: productHeader.imageUrls,
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }

      await this.firestoreBatchService.batchSet(
        productDocRef,
        saveProductData,
        {
          merge: true,
        },
      );
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.DETAIL_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end batchSetProduct');
  }

  private async batchSetProductDetail(
    productDocRef: DocumentReference,
    product: ProductDetails,
    operatorName: string,
  ) {
    this.logger.debug('start batchSetProductDetail');
    try {
      const docId = product.header.productId;
      // detail保存
      const detailDocRef = productDocRef
        .collection(PRODUCTS_DETAIL_COLLECTION_NAME)
        .doc(docId);

      const oldProduct = await detailDocRef.get();
      let saveDetailData: ProductDetail | null = null;

      if (oldProduct.exists) {
        // すでにデータがある場合
        saveDetailData = {
          ...product.detail,
          applicableStartDate: this.commonService.convertToTimestampWithNull(
            product.detail.applicableStartDate,
          ),
          salesStartDate: this.commonService.convertToTimestampWithNull(
            product.detail.salesStartDate,
          ),
          salesEndDate: this.commonService.convertToTimestampWithNull(
            product.detail.salesEndDate,
          ),
          onlineStartTimeEc: this.commonService.convertToTimestampWithNull(
            product.detail.onlineStartTimeEc,
          ),
          onlineEndTimeEc: this.commonService.convertToTimestampWithNull(
            product.detail.onlineEndTimeEc,
          ),
          newPeriodFrom: this.commonService.convertToTimestampWithNull(
            product.detail.newPeriodFrom,
          ),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          createdAt: oldProduct.data().createdAt,
          createdBy: oldProduct.data().createdBy,
        };
      } else {
        // 新規の場合
        saveDetailData = {
          ...product.detail,
          applicableStartDate: this.commonService.convertToTimestampWithNull(
            product.detail.applicableStartDate,
          ),
          salesStartDate: this.commonService.convertToTimestampWithNull(
            product.detail.salesStartDate,
          ),
          salesEndDate: this.commonService.convertToTimestampWithNull(
            product.detail.salesEndDate,
          ),
          onlineStartTimeEc: this.commonService.convertToTimestampWithNull(
            product.detail.onlineStartTimeEc,
          ),
          onlineEndTimeEc: this.commonService.convertToTimestampWithNull(
            product.detail.onlineEndTimeEc,
          ),
          newPeriodFrom: this.commonService.convertToTimestampWithNull(
            product.detail.newPeriodFrom,
          ),
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }
      await this.firestoreBatchService.batchSet(detailDocRef, saveDetailData, {
        merge: true,
      });
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${PRODUCTS_COLLECTION_NAME}.${PRODUCTS_DETAIL_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.DETAIL_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.debug('end batchSetProductDetail');
  }

  private async batchSetSpecCategories(
    productDocRef: DocumentReference,
    product: ProductDetails,
    operatorName: string,
  ) {
    this.logger.debug('start batchSetSpecCategories');
    try {
      const docId = product.header.productId;
      const specCategoryDocRef = productDocRef
        .collection(PRODUCTS_SPECCATEGORIES_COLLECTION_NAME)
        .doc(docId);
      const oldSpecCategory = await specCategoryDocRef.get();
      let saveData: ProductSpecCategory;
      const specCategoriesData = product.specCategories;
      if (oldSpecCategory.exists) {
        saveData = {
          specCategories: specCategoriesData,
          createdBy: oldSpecCategory.data()?.createdBy,
          createdAt: oldSpecCategory.data()?.createdAt,
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      } else {
        saveData = {
          specCategories: specCategoriesData,
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }
      await this.firestoreBatchService.batchSet(specCategoryDocRef, saveData, {
        merge: true,
      });
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${PRODUCTS_COLLECTION_NAME}.${PRODUCTS_SPECCATEGORIES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.DETAIL_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end batchSetSpecCategories');
  }
}
