/* eslint-disable no-else-return */
/* eslint-disable no-dupe-else-if */
/* eslint-disable no-param-reassign */
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { Injectable } from '@nestjs/common';
import {
  OrderService,
  StatusCode,
  ProductItem,
  UserInfo,
} from '@cainz-next-gen/order';
import { ConfigService } from '@nestjs/config';
import assert from 'assert';
import {
  CalculateCartAmountResponse,
  CreateProductItem,
  CheckMaximumAndMinimumAndStepQuantityResponse,
  CanBePurchasedAtTheSameTime,
  ProductItems,
  ErrorInformation,
  OrderSpecification,
  NeedsItemCreationResponse,
  CartData,
  OverwriteContent,
  OverwriteContents,
} from '../interfaces/cart-productItem.interface';
import { ReceivingMethod } from '../cart/dto/post.cart-add-item-body.dto';
import {
  CartCommonErrorCategory,
  CartCommonErrorCategoryErrors,
  CommonProcessCategoryError,
  CommonProcessCategoryErrorMessage,
  DropShippingCategory,
  checkItemCategory,
} from '../../types/constants/error-code';
import { emptyProductItem } from '../../data_json/data';

@Injectable()
export class CartCommonService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly orderService: OrderService,
    private readonly env: ConfigService,
  ) {}

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {productItems} ProductItem[] - Array of product items form cart
   * @return {object}
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public checkMaximumAndMinimumAndStepQuantity(
    productItems: ProductItem[],
  ): CheckMaximumAndMinimumAndStepQuantityResponse {
    try {
      const errors = [];
      for (let i = 0; i < productItems.length; i++) {
        const productItem = productItems[i];
        let errorData;
        const isValidData = this.isValidMaxMinStepQtyData(productItem);
        if (!isValidData) {
          return { status: 0, errors: [] };
        }

        if (
          productItem.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_SPECIFIED_ADDRESS
        ) {
          if (
            !productItem.product.minOrderQuantity ||
            !productItem.product.maxOrderQuantity ||
            !productItem.product.stepQuantity
          ) {
            this.logger.error(
              'Argument Missing for minOrderQuantity / maxOrderQuantity/  stepQuantity',
            );
            return { status: 0, errors: [] };
          }
          errorData = this.isValidDelivery(productItem);
          if (errorData) {
            errors.push(errorData);
            break;
          }
        }

        if (productItem.receivingMethod === ReceivingMethod.STORE_RESERVE) {
          if (
            !productItem.product.storeMinOrderQuantity ||
            !productItem.product.storeMaxOrderQuantity ||
            !productItem.product.storeStepOrderQuantity
          ) {
            this.logger.error(
              'Argument Missing for storeMinOrderQuantity / storeMaxOrderQuantity/  storeStepOrderQuantity',
            );
            return { status: 0, errors: [] };
          }
          errorData = this.isValidStorePickUp(productItem);
          if (errorData) {
            errors.push(errorData);
            break;
          }
        }
      }
      return { status: 1, errors };
    } catch (error) {
      this.commonService.logException(
        'method checkMaximumAndMinimumAndStepQuantity error',
        error,
      );
      return { status: 0, errors: [] };
    }
  }

  public isValidMaxMinStepQtyData(productItem: ProductItem): boolean {
    if (!productItem.receivingMethod || !productItem.quantity) {
      this.logger.error('Argument Missing for receivingMethod / quantity');
      return false;
    }
    if (
      !Object.values(ReceivingMethod).includes(
        productItem.receivingMethod as ReceivingMethod,
      )
    ) {
      this.logger.error('This is not valid receivingMethod');
      return false;
    }
    return true;
  }

  public isValidStorePickUp(productItem: ProductItem) {
    const { quantity } = productItem;
    let errorData = null;
    const messageMinOrderQty =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MIN_ORDER_QTY;
    const messageMaxOrderQty =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MAX_ORDER_QTY;
    const messageStepQty = CartCommonErrorCategoryErrors.CART_CATEGORY_STEP_QTY;
    const message =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MAX_MINI_STEP_COMMON +
      messageMinOrderQty.replace(
        '{}',
        productItem.product.storeMinOrderQuantity.toString(),
      ) +
      messageMaxOrderQty.replace(
        '{}',
        productItem.product.storeMaxOrderQuantity.toString(),
      ) +
      messageStepQty.replaceAll(
        '{}',
        productItem.product.storeStepOrderQuantity.toString(),
      );
    if (productItem.product.storeMinOrderQuantity > quantity) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    } else if (productItem.product.storeMaxOrderQuantity < quantity) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    } else if (quantity % productItem.product.storeStepOrderQuantity !== 0) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    }
    return errorData;
  }

  public isValidDelivery(productItem: ProductItem) {
    const { quantity } = productItem;
    let errorData = null;
    const messageMinOrderQty =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MIN_ORDER_QTY;
    const messageMaxOrderQty =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MAX_ORDER_QTY;
    const messageStepQty = CartCommonErrorCategoryErrors.CART_CATEGORY_STEP_QTY;
    const message =
      CartCommonErrorCategoryErrors.CART_CATEGORY_MAX_MINI_STEP_COMMON +
      messageMinOrderQty.replace(
        '{}',
        productItem.product.minOrderQuantity.toString(),
      ) +
      messageMaxOrderQty.replace(
        '{}',
        productItem.product.maxOrderQuantity.toString(),
      ) +
      messageStepQty.replaceAll(
        '{}',
        productItem.product.stepQuantity.toString(),
      );
    if (productItem.product.minOrderQuantity > quantity) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    } else if (productItem.product.maxOrderQuantity < quantity) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    } else if (quantity % productItem.product.stepQuantity !== 0) {
      errorData = {
        category: CartCommonErrorCategory.CART_CATEGORY,
        errorCode: CartCommonErrorCategory.CART_CATEGORY_CODE,
        message,
      };
    }
    return errorData;
  }

  // Cart amount calculation
  /**
   * @param {productItems} ProductItem[] - Array of product items form cart
   * @param {userInfo} UserInfo - User Information as object
   * @return {object}  CalculateCartAmountResponse
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public async calculateCartAmount(
    productItems: ProductItem[],
    userInfo: UserInfo,
  ): Promise<CalculateCartAmountResponse> {
    try {
      const isValidData = this.isValidCalculateCartAmountData(
        productItems,
        userInfo,
      );
      if (!isValidData) {
        this.logger.error(`Not valid validation`);
        return { status: StatusCode.FAILURE };
      }

      const shippingCost: any = await this.orderService.getShippingCost(
        productItems,
        userInfo,
      );
      this.logger.info(`shippingCost ${JSON.stringify(shippingCost)}`);
      if (!shippingCost || shippingCost.status === StatusCode.FAILURE) {
        this.logger.error(`Not valid status from shippingCost method `);
        return { status: StatusCode.FAILURE };
      }
      // Variable Declaration
      let totalProductAmountStore = 0;
      let totalProductAmountEc = 0;
      let totalIndividualShippingCost = 0;
      let totalGrossAmount = 0;
      let storeItemCount = 0;
      let shippingItemCount = 0;
      let error = false;

      const basicShippingCost = shippingCost.result.basicFee
        ? shippingCost.result.basicFee
        : 0;
      const regionalShippingCost = shippingCost.result.regionalFee
        ? shippingCost.result.regionalFee
        : 0;
      const priceToFreeBasicShipping = shippingCost.result.shortToDiscount
        ? shippingCost.result.shortToDiscount
        : 0;
      let isCheckOutTargetFlag = false;
      for (let i = 0; i < productItems.length; i++) {
        const productItem = productItems[i];
        // Amount Calculation
        if (
          Object.values(ReceivingMethod).includes(
            productItem.receivingMethod as ReceivingMethod,
          )
        ) {
          if (
            productItem.receivingMethod ===
            ReceivingMethod.DELIVERY_TO_SPECIFIED_ADDRESS
          ) {
            shippingItemCount += 1;
            if (productItem.isCheckoutTarget === true) {
              totalProductAmountEc += productItem.subtotalProductAmount;
              totalIndividualShippingCost +=
                productItem.subtotalIndividualShippingCost;
              isCheckOutTargetFlag = true;
            }
          } else if (
            productItem.receivingMethod === ReceivingMethod.STORE_RESERVE
          ) {
            if (productItem.isCheckoutTarget === true) {
              totalProductAmountStore += productItem.subtotalProductAmount;
              isCheckOutTargetFlag = true;
            }
            storeItemCount += 1;
          }
        } else {
          error = true;
          this.logger.error(
            `Not valid receiving method for ${productItem.productId}`,
          );
          break;
        }
      }
      totalGrossAmount =
        totalProductAmountEc +
        totalProductAmountStore +
        totalIndividualShippingCost +
        basicShippingCost +
        regionalShippingCost;
      // return values

      if (error === true) {
        return { status: StatusCode.FAILURE };
      }
      const result = {
        status: StatusCode.SUCCESS,
        amountInfo: {
          totalProductAmountStore: isCheckOutTargetFlag
            ? totalProductAmountStore || 0
            : 0,
          totalProductAmountEc: isCheckOutTargetFlag
            ? totalProductAmountEc || 0
            : 0,
          basicShippingCost: isCheckOutTargetFlag ? basicShippingCost || 0 : 0,
          regionalShippingCost: isCheckOutTargetFlag
            ? regionalShippingCost || 0
            : 0,
          totalIndividualShippingCost: isCheckOutTargetFlag
            ? totalIndividualShippingCost || 0
            : 0,
          totalGrossAmount: isCheckOutTargetFlag ? totalGrossAmount || 0 : 0,
          priceToFreeBasicShipping: isCheckOutTargetFlag
            ? priceToFreeBasicShipping || 0
            : 0,
        },
        storeItemCount,
        shippingItemCount,
      };
      this.logger.info(`Return result ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.commonService.logException(
        'method calculateCartAmount error',
        error,
      );
      return { status: StatusCode.FAILURE };
    }
  }

  public isValidCalculateCartAmountData(
    productItems: ProductItem[],
    userInfo: UserInfo,
  ): boolean {
    this.logger.error(
      `Argument Missing for userInfo ${JSON.stringify(userInfo)}`,
    );
    if (
      productItems.length === 0 ||
      typeof userInfo.isMember === 'undefined' ||
      userInfo.isMember === null ||
      userInfo.zipCode === null ||
      typeof userInfo.zipCode === 'undefined' ||
      userInfo.zipCode === '' ||
      userInfo.prefecture === null ||
      typeof userInfo.prefecture === 'undefined' ||
      userInfo.prefecture === '' ||
      !userInfo
    ) {
      this.logger.error(`Argument Missing for productItems / userInfo `);
      return false;
    }
    if (
      userInfo.isMember === true &&
      ![true, false].includes(userInfo.billPayment)
    ) {
      this.logger.error('bill payment is not valid');
      return false;
    }
    if (userInfo.isMember === false && userInfo.billPayment !== false) {
      this.logger.error('bill payment is not valid');
      return false;
    }

    return true;
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {productItems} ProductItem[] - Array of product items form cart
   * @return {object}
   *
   * @throws {Error} Will throw an error if simultaneous purchase is not possible
   */

  public canBePurchasedAtTheSameTime(
    productItems: ProductItems[],
  ): CanBePurchasedAtTheSameTime {
    const purchaseAtTheSameTimeResponse: any = {
      status: StatusCode?.SUCCESS,
      errors: [],
      productItems,
    };
    // set errors error information
    const errors: ErrorInformation = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE1,
      // Items that cannot be purchased at the same time they have been selected.
      description:
        CommonProcessCategoryErrorMessage.CART_DATA_CODE1_DESCRIPTION,
    };
    try {
      this.logger.info(
        `check one by one product in cart to verify purchase possible or not`,
      );
      productItems.forEach((res: ProductItems) => {
        res.errors = [];
        this.checkDropShippingCategory(
          res,
          productItems,
          errors,
          purchaseAtTheSameTimeResponse,
        );
        this.checkProductInCustomizedCategory(
          res,
          productItems,
          errors,
          purchaseAtTheSameTimeResponse,
        );
      });
    } catch (e: any) {
      this.commonService.logException(
        'checking simultaneous purchase possibility Error',
        `${e.message}`,
      );
      return { status: StatusCode.FAILURE };
    }
    return purchaseAtTheSameTimeResponse;
  }

  public checkDropShippingCategory(
    res: ProductItems,
    productItems: ProductItems[],
    errors: ErrorInformation,
    purchaseAtTheSameTimeResponse: any,
  ) {
    this.logger.info(`checking drop shipping category products in cart`);
    const checkDropShippingCategory = productItems.map(
      (product) =>
        product.product?.dropShippingCategory ===
          DropShippingCategory.TRUSCO_NAKAYAMA &&
        product.receivingMethod === ReceivingMethod.STORE_RESERVE &&
        product.isCheckoutTarget === true,
    );
    let isDropshippingCategory: boolean;
    if (checkDropShippingCategory.includes(true)) {
      this.logger.info(`Trusco drop shipping product is there in cart`);
      isDropshippingCategory = true;
    } else {
      isDropshippingCategory = false;
    }
    if (isDropshippingCategory) {
      this.logger.info(
        `check and count the other than Trusco drop shipping products in cart whose checkoutTarget should be true`,
      );
      const checkOtherDropCategory = productItems
        .map(
          (product) =>
            product.isCheckoutTarget === true &&
            (product.product?.dropShippingCategory !==
              DropShippingCategory.TRUSCO_NAKAYAMA ||
              product.receivingMethod !== ReceivingMethod.STORE_RESERVE),
        )
        .includes(true);

      const otherProductsWithTrusco = productItems
        .map(
          (product) =>
            product.product?.dropShippingCategory ===
              DropShippingCategory.TRUSCO_NAKAYAMA &&
            product.receivingMethod === ReceivingMethod.STORE_RESERVE,
        )
        .includes(false);

      if (otherProductsWithTrusco) {
        const indexOfFalse = productItems
          .map(
            (product) =>
              product.product?.dropShippingCategory ===
                DropShippingCategory.TRUSCO_NAKAYAMA &&
              product.receivingMethod === ReceivingMethod.STORE_RESERVE,
          )
          .indexOf(false);
        const otherDropShippingProductsCheckoutTargetResult =
          productItems[indexOfFalse].isCheckoutTarget === false;
        if (
          !otherDropShippingProductsCheckoutTargetResult ||
          checkOtherDropCategory
        ) {
          this.logger.info(
            `set error when user try to buy trusco drop shipping products along with other products`,
          );
          if (
            res?.product?.dropShippingCategory ===
              DropShippingCategory.TRUSCO_NAKAYAMA &&
            res?.receivingMethod === ReceivingMethod.STORE_RESERVE &&
            res.isCheckoutTarget === true
          ) {
            purchaseAtTheSameTimeResponse.errors = [];
            res.errors.push({
              category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
              errorCode: CommonProcessCategoryError.CART_LINE_CODE1,
              // Some products cannot be purchased at the same time. Delete the product or delete other products.
              description:
                CommonProcessCategoryErrorMessage.CART_LINE_CODE1_DESCRIPTION,
            });
            const errorData = purchaseAtTheSameTimeResponse.errors.push(errors);
            purchaseAtTheSameTimeResponse = {
              status: StatusCode?.SUCCESS,
              errorData,
              productItems,
            };
            this.logger.info(
              `Some products cannot be purchased at the same time. Delete the product or delete other products`,
            );
          }
        }
      }
    }
    this.logger.info(`dropshipping products purchase possible`);
  }

  public checkProductInCustomizedCategory(
    res: ProductItems,
    productItems: ProductItems[],
    errors: ErrorInformation,
    purchaseAtTheSameTimeResponse: any,
  ) {
    const isProductInCategory = (resProduct, category) =>
      Object.values(category).some(
        (result: any) =>
          result.id === resProduct.product.customizedProductCategory,
      );
    if (isProductInCategory(res, checkItemCategory)) {
      if (
        res.product.customizedProductCategory ===
        checkItemCategory.ROSE_SEEDLINGS.id
      ) {
        this.logger.info(
          `${res.productId} is ${checkItemCategory.ROSE_SEEDLINGS.value} category product`,
        );
        this.RoseSeedlingCategory(
          res,
          productItems,
          errors,
          purchaseAtTheSameTimeResponse,
        );
      } else if (
        res.product.customizedProductCategory ===
        checkItemCategory.MOTHERS_DAY.id
      ) {
        this.logger.info(
          `${res.productId} is ${checkItemCategory.MOTHERS_DAY.value} category product`,
        );
        this.MothersDayCategory(
          res,
          productItems,
          errors,
          purchaseAtTheSameTimeResponse,
        );
      } else if (
        res.product.customizedProductCategory ===
        checkItemCategory.FATHERS_DAY.id
      ) {
        this.logger.info(
          `${res.productId} is ${checkItemCategory.FATHERS_DAY.value} category product`,
        );
        this.FathersDayCategory(
          res,
          productItems,
          errors,
          purchaseAtTheSameTimeResponse,
        );
      }
    }
  }

  public RoseSeedlingCategory(
    res: ProductItems,
    productItems: ProductItems[],
    errors: ErrorInformation,
    purchaseAtTheSameTimeResponse: any,
  ) {
    this.logger.info(`checking rose seedling products in cart`);
    const checkRoseSeedlings = productItems.map(
      (product) =>
        product.product?.customizedProductCategory ===
          checkItemCategory.ROSE_SEEDLINGS.id &&
        product.isCheckoutTarget === true,
    );
    let isRoseSeedlingProductsAvailable: boolean;
    if (checkRoseSeedlings.includes(true)) {
      this.logger.info(`Rose seedling product is there in cart`);
      isRoseSeedlingProductsAvailable = true;
    } else {
      isRoseSeedlingProductsAvailable = false;
    }
    if (isRoseSeedlingProductsAvailable) {
      this.logger.info(
        `check and count the other than rose seedling products in cart whose checkoutTarget should be true`,
      );
      const isNotRoseSeedling = productItems.map(
        (product) =>
          product.product?.customizedProductCategory !==
            checkItemCategory.ROSE_SEEDLINGS.id &&
          product.isCheckoutTarget === true,
      );
      const otherProductsWithRoseSeedlings = isNotRoseSeedling.reduce(
        (count, value) => (value === true ? count + 1 : count),
        0,
      );
      if (otherProductsWithRoseSeedlings >= 1) {
        this.logger.info(
          `${otherProductsWithRoseSeedlings} Rose seedling products in cart`,
        );
        const indexOfFalse = productItems
          .map(
            (product) =>
              product.product?.customizedProductCategory ===
              checkItemCategory.ROSE_SEEDLINGS.id,
          )
          .indexOf(false);
        const otherRoseProductsCheckoutTargetResult =
          productItems[indexOfFalse].isCheckoutTarget === false;
        if (!otherRoseProductsCheckoutTargetResult || isNotRoseSeedling) {
          this.logger.info(
            `set error when user try to buy rose seedling products along with other products`,
          );
          if (
            res.product.customizedProductCategory ===
              checkItemCategory.ROSE_SEEDLINGS.id &&
            res.isCheckoutTarget === true
          ) {
            if (
              productItems[indexOfFalse].product.customizedProductCategory !==
              checkItemCategory.ROSE_SEEDLINGS.id
            ) {
              res.errors.push({
                category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
                errorCode: CommonProcessCategoryError.CART_LINE_CODE2,
                // There are some products that cannot be purchased together with rose seedlings. Please delete the rose seedlings or other products.
                description:
                  CommonProcessCategoryErrorMessage.CART_LINE_CODE2_DESCRIPTION,
              });
            }
            purchaseAtTheSameTimeResponse.errors = [];
            const errorData = purchaseAtTheSameTimeResponse.errors.push(errors);
            purchaseAtTheSameTimeResponse = {
              status: StatusCode?.SUCCESS,
              errorData,
              productItems,
            };
            this.logger.info(
              `${res.productId} this product Item belongs to Rose seedlings category products cannot purchase along with other products`,
            );
          }
        }
      }
      this.logger.info(`Rose seedling products purchase possible`);
    }
  }

  public MothersDayCategory(
    res: ProductItems,
    productItems: ProductItems[],
    errors: ErrorInformation,
    purchaseAtTheSameTimeResponse: any,
  ) {
    this.logger.info(`checking mothers day products in cart`);
    const checkMothersCategory = productItems.map(
      (product) =>
        product.product?.customizedProductCategory ===
          checkItemCategory.MOTHERS_DAY.id && product.isCheckoutTarget === true,
    );
    let isMotherProductsAvailable: boolean;
    if (checkMothersCategory.includes(true)) {
      this.logger.info(`Mothers day product is there in cart`);
      isMotherProductsAvailable = true;
    } else {
      isMotherProductsAvailable = false;
    }
    if (isMotherProductsAvailable) {
      this.logger.info(
        `check and count the other than mothers day products in cart whose checkoutTarget should be true`,
      );
      const isNotMothersCategory = productItems.map(
        (product) =>
          product.product?.customizedProductCategory !==
            checkItemCategory.MOTHERS_DAY.id &&
          product.isCheckoutTarget === true,
      );
      const otherProductsWithMothers = isNotMothersCategory.reduce(
        (count, value) => (value === true ? count + 1 : count),
        0,
      );
      if (otherProductsWithMothers >= 1) {
        this.logger.info(
          `${otherProductsWithMothers} Mother day products in cart`,
        );
        const indexOfFalse = productItems
          .map(
            (product) =>
              product.product?.customizedProductCategory ===
              checkItemCategory.MOTHERS_DAY.id,
          )
          .indexOf(false);
        const otherMothersDayProductsCheckoutTargetResult =
          productItems[indexOfFalse].isCheckoutTarget === false;
        if (
          !otherMothersDayProductsCheckoutTargetResult ||
          isNotMothersCategory
        ) {
          this.logger.info(
            `set error when user try to buy mothers day products along with other products`,
          );
          if (
            res?.product?.customizedProductCategory ===
              checkItemCategory.MOTHERS_DAY.id &&
            res?.isCheckoutTarget === true
          ) {
            if (
              productItems[indexOfFalse].product.customizedProductCategory !==
              checkItemCategory.MOTHERS_DAY.id
            ) {
              res.errors.push({
                category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
                errorCode: CommonProcessCategoryError.CART_LINE_CODE3,
                // There are some products that cannot be purchased at the same time as Mother's Day products. Please delete the Mother's Day products or delete other products.
                description:
                  CommonProcessCategoryErrorMessage.CART_LINE_CODE3_DESCRIPTION,
              });
            }
            purchaseAtTheSameTimeResponse.errors = [];
            const errorData = purchaseAtTheSameTimeResponse.errors.push(errors);
            purchaseAtTheSameTimeResponse = {
              status: StatusCode?.SUCCESS,
              errorData,
              productItems,
            };
            this.logger.info(
              `${res.productId} this product Item belongs to Mothers day category products cannot purchase along with others`,
            );
          }
        }
      }
      this.logger.info(`Mothers day products purchase possible`);
    }
  }

  public FathersDayCategory(
    res: ProductItems,
    productItems: ProductItems[],
    errors: ErrorInformation,
    purchaseAtTheSameTimeResponse: any,
  ) {
    this.logger.info(`checking fathers day products in cart`);
    const checkFathersCategory = productItems.map(
      (product) =>
        product.product?.customizedProductCategory ===
          checkItemCategory.FATHERS_DAY.id && product.isCheckoutTarget === true,
    );

    let isFatherProductsAvailable: boolean;
    if (checkFathersCategory.includes(true)) {
      this.logger.info(`Fathers day product is there in cart`);
      isFatherProductsAvailable = true;
    } else {
      isFatherProductsAvailable = false;
    }
    if (isFatherProductsAvailable) {
      this.logger.info(
        `check and count the other than fathers day products in cart whose checkoutTarget should be true`,
      );
      const isNotFathersCategory = productItems.map(
        (product) =>
          product.product?.customizedProductCategory !==
            checkItemCategory.FATHERS_DAY.id &&
          product.isCheckoutTarget === true,
      );
      const otherProductsWithFathers = isNotFathersCategory.reduce(
        (count, value) => (value === true ? count + 1 : count),
        0,
      );
      if (otherProductsWithFathers >= 1) {
        this.logger.info(
          `${otherProductsWithFathers} Father Day products in cart`,
        );
        const indexOfFalse = productItems
          .map(
            (product) =>
              product.product?.customizedProductCategory ===
              checkItemCategory.FATHERS_DAY.id,
          )
          .indexOf(false);
        const otherFathersDayProductsCheckoutTargetResult =
          productItems[indexOfFalse].isCheckoutTarget === false;
        if (
          !otherFathersDayProductsCheckoutTargetResult ||
          isNotFathersCategory
        ) {
          this.logger.info(
            `set error when user try to buy fathers day products along with other products`,
          );
          if (
            res.product.customizedProductCategory ===
              checkItemCategory.FATHERS_DAY.id &&
            res.isCheckoutTarget === true
          ) {
            if (
              productItems[indexOfFalse].product.customizedProductCategory !==
              checkItemCategory.FATHERS_DAY.id
            ) {
              res.errors.push({
                category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
                errorCode: CommonProcessCategoryError.CART_LINE_CODE4,
                // There are some products that cannot be purchased at the same time as Father's Day products. Please delete Father's Day products or delete other products.
                description:
                  CommonProcessCategoryErrorMessage.CART_LINE_CODE4_DESCRIPTION,
              });
            }
            purchaseAtTheSameTimeResponse.errors = [];
            const errorData = purchaseAtTheSameTimeResponse.errors.push(errors);
            purchaseAtTheSameTimeResponse = {
              status: StatusCode?.SUCCESS,
              errorData,
              productItems,
            };
            this.logger.info(
              `${res.productId} this product Item belongs to Fathers day category product cannot purchase along with others`,
            );
          }
        }
      }

      this.logger.info(`Fathers day products purchase possible`);
    }
  }
  // needsItemCreation
  /**
   * @param {productId} string - Product Ids
   * @param {orderSpecification} OrderSpecification - OrderSpecification object
   * @param {productItems} productItems - productItems object
   * @return {object}  NeedsItemCreationResponse
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */

  public needsItemCreation(
    productId: string,
    orderSpecification: OrderSpecification,
    productItems: Partial<ProductItem>[],
  ): Partial<NeedsItemCreationResponse> {
    const failStatus = {
      status: StatusCode.FAILURE,
      needsItemCreation: null,
      productItem: null,
      canBeAddedToCart: null,
    };
    try {
      if (productId === null || productId === '') {
        return failStatus;
      }
      if (productItems === null) {
        return {
          status: StatusCode.SUCCESS,
          needsItemCreation: true,
          productItem: null,
          canBeAddedToCart: true,
        };
      }
      const productItemValue: Partial<ProductItem> = productItems.find(
        (productItem) => productItem.productId === productId,
      );
      if (productItemValue) {
        const { needsItemCreation, canBeAddedToCart } =
          this.compareOrderSpecification(
            productItemValue,
            orderSpecification,
            productItems,
          );
        delete productItemValue.checkoutId;
        delete productItemValue.checkoutStatus;
        return {
          status: StatusCode.SUCCESS,
          needsItemCreation,
          productItem: needsItemCreation === true ? null : productItemValue,
          canBeAddedToCart,
        };
      }
      const maximumNumberOfCartsThatCanBeAdded = this.env.get<number>(
        'MAXIMUM_NUMBER_OF_CARTS_THAT_CAN_BE_ADDED',
      );
      let canBeAddedToCart = true;
      if (maximumNumberOfCartsThatCanBeAdded <= productItems.length) {
        canBeAddedToCart = false;
      }
      return {
        status: StatusCode.SUCCESS,
        needsItemCreation: true,
        productItem: null,
        canBeAddedToCart,
      };
    } catch (error: any) {
      this.commonService.logException('method needsItemCreation error', error);
      return failStatus;
    }
  }

  public compareOrderSpecification(
    productItemValue,
    orderSpecification,
    productItems,
  ) {
    let needsItemCreation = false;
    let canBeAddedToCart = true;
    const maximumNumberOfCartsThatCanBeAdded = this.env.get<number>(
      'MAXIMUM_NUMBER_OF_CARTS_THAT_CAN_BE_ADDED',
    );
    if (
      (JSON.stringify(orderSpecification) === '{}' &&
        productItemValue.orderSpecification === null) ||
      (JSON.stringify(productItemValue.orderSpecification) === '{}' &&
        orderSpecification === null)
    ) {
      needsItemCreation = false;
      if (maximumNumberOfCartsThatCanBeAdded <= productItems.length) {
        canBeAddedToCart = false;
      } else {
        canBeAddedToCart = true;
      }
    } else if (
      JSON.stringify(productItemValue.orderSpecification) !==
      JSON.stringify(orderSpecification)
    ) {
      needsItemCreation = true;

      this.logger.error(
        `maximumNumberOfCartsThatCanBeAdded value ${maximumNumberOfCartsThatCanBeAdded}`,
      );

      this.logger.error(`productItems Length value ${productItems.length}`);
      if (maximumNumberOfCartsThatCanBeAdded <= productItems.length) {
        canBeAddedToCart = false;
      } else {
        canBeAddedToCart = true;
      }
    }
    return { needsItemCreation, canBeAddedToCart };
  }

  /**
   * @param {itemData} object - object with item details
   * @param {products} array - Array of product objects
   * @param {isMember} boolean - isMember of cainz or not
   * @param {storeCode} string - store code
   * @param {storeInfo} object - object with store information
   * @return {object}
   */
  public async createProductItem(
    itemData,
    products,
    isMember,
    storeCode,
    storeInfo,
  ): Promise<CreateProductItem> {
    this.logger.info('start: createProductItem');
    const failStatus = {
      status: 0,
      productItem: null,
    };
    if (
      !(
        itemData &&
        products &&
        storeCode &&
        storeInfo &&
        typeof isMember === 'boolean'
      ) ||
      isMember === null ||
      products.length === 0 ||
      Object.keys(itemData).length === 0 ||
      Object.keys(storeInfo).length === 0 ||
      !('supportBackOrder' in storeInfo.detail)
    ) {
      this.logger.error('Error in method parameters, missing or null');
      return failStatus;
    }
    try {
      let productItem: ProductItem = emptyProductItem;
      productItem = await this.setProductItem(products, productItem, itemData);
      if (
        productItem.itemId === null ||
        productItem.productId === null ||
        productItem.receivingMethod === null ||
        productItem.quantity === null
      ) {
        this.logger.error(
          'Error, productItem set to null or itemId or productId or receivingMethod or quantity is null',
        );
        return failStatus;
      }
      const webBackOrderFlagVal =
        await this.orderService.setInvalidWebBackOrderFlagValue(
          productItem,
          storeInfo,
        );
      if (webBackOrderFlagVal.status !== StatusCode.SUCCESS) {
        this.logger.error('Error in setInvalidWebBackOrderFlagValue');
        return failStatus;
      }
      productItem = webBackOrderFlagVal.productItem;
      const productPriceSelectionVal =
        await this.orderService.setSelectProductPrice(productItem, storeCode);
      if (productPriceSelectionVal.status !== StatusCode.SUCCESS) {
        this.logger.error('Error in setSelectProductPrice');
        return failStatus;
      }
      productItem = productPriceSelectionVal.productItem;
      const shippingFeeVal = await this.orderService.setIndividualShippingFee(
        productItem,
      );
      if (shippingFeeVal.status !== StatusCode.SUCCESS) {
        this.logger.error('Error in setIndividualShippingFee');
        return failStatus;
      }
      productItem = shippingFeeVal.productItem;
      if (isMember) {
        // The property campaign points will be added to the product detail interface in the future.
        // static value of 25 is being used until the property is added.
        productItem.campaignPoints = productItem.product.campaignPoints
          ? productItem.product.campaignPoints
          : 25;
        productItem.subtotalCampaignPoints =
          productItem.campaignPoints * productItem.quantity;
      } else {
        productItem.campaignPoints = 0;
        productItem.subtotalCampaignPoints = 0;
      }
      productItem.createdAt = new Date();
      productItem.updatedAt = new Date();
      this.logger.info('end: createProductItem');
      return {
        status: StatusCode.SUCCESS,
        productItem,
      };
    } catch (error) {
      this.commonService.logException('method createProductItem error', error);
      return failStatus;
    }
  }

  /**
   * @param {products} array - Array of product objects
   * @param {productItem} object - Empty productItem object
   * @param {itemData} object - object with item details
   * @return {object}
   */
  public async setProductItem(products, productItem, itemData) {
    let productIdMatches = false;
    productItem.itemId = await this.orderService.generateNewId();
    productItem.receivingMethod = itemData.receivingMethod
      ? itemData.receivingMethod
      : null;
    productItem.productId = itemData.productId ? itemData.productId : null;
    productItem.quantity = itemData.quantity ? itemData.quantity : null;
    productItem.orderSpecification = itemData.orderSpecification
      ? itemData.orderSpecification
      : null;
    products.forEach((product) => {
      if (product.productId === productItem.productId) {
        productItem.product = JSON.parse(JSON.stringify(product));
        productIdMatches = true;
      }
    });
    if (productIdMatches === false) {
      productItem = null;
    }
    return productItem;
  }

  /**
   * @param {productItems} array<ProductItem> - array of ProductItem object
   * @param {itemId} string - itemId
   *
   * @return {array<object>}
   */
  public deleteItemFromProductItems(
    productItems: Array<ProductItem>,
    itemId: string,
  ) {
    try {
      this.logger.info('start: deleteItemFromProductItems');
      const product = productItems.find(
        (productObj) => productObj.itemId === itemId,
      );
      if (!product) {
        this.logger.info(
          `itemId Id ${itemId} not found so returning productItems as it is `,
        );
        return productItems;
      } else {
        this.logger.info(
          `itemId Id ${itemId}  found so deleting matching productItems and returning `,
        );
        productItems.splice(productItems.indexOf(product), 1);
        return productItems;
      }
    } catch (error) {
      this.commonService.logException(
        'method deleteItemFromProductItems error',
        error,
      );
      throw new Error('Failed in deleteItemFromProductItems');
    }
  }

  /**
   * @param {cartData} object - The data of items present in the cart
   * @param {overwriteContent} object - The data that will be used to overwrite cart content
   * @return {object}
   */
  public async overwriteCartContents(
    cartData: CartData,
    overwriteContent: OverwriteContent,
  ): Promise<OverwriteContents> {
    const failStatus = {
      status: 0,
      cartData: null,
    };
    if (!cartData) {
      return failStatus;
    }
    try {
      this.logger.info('start: overwriteCartContents');
      if (
        overwriteContent &&
        overwriteContent.productItems &&
        overwriteContent.productItems.length > 0
      ) {
        overwriteContent.productItems.forEach((overwriteItem) => {
          const matchingCartItem = cartData.productItems.find(
            (cartItem) => cartItem.itemId === overwriteItem.itemId,
          );
          if (matchingCartItem) {
            if (
              matchingCartItem.quantity !== overwriteItem.quantity ||
              matchingCartItem.receivingMethod !== overwriteItem.receivingMethod
            ) {
              delete overwriteItem.checkoutId;
              delete overwriteItem.checkoutStatus;
            }
          }
        });
        cartData.productItems = overwriteContent.productItems;
      }

      if (
        overwriteContent &&
        overwriteContent.storeCode &&
        overwriteContent.storeCode.length > 0
      ) {
        cartData.storeCode = overwriteContent.storeCode;
      }
      if (
        overwriteContent &&
        overwriteContent.shippingAddress &&
        'zipCode' in overwriteContent.shippingAddress &&
        'prefecture' in overwriteContent.shippingAddress &&
        'city' in overwriteContent.shippingAddress
      ) {
        cartData.shippingAddress = overwriteContent.shippingAddress;
      }
      this.logger.info('end: overwriteCartContents');
      return {
        status: 1,
        cartData,
      };
    } catch (error) {
      this.commonService.logException(
        'method overwriteCartContents error',
        error,
      );
      return failStatus;
    }
  }
}
