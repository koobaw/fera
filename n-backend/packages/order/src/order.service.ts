/* eslint-disable no-else-return */
/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-dupe-else-if */
/* eslint no-param-reassign: "error" */
/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint no-underscore-dangle: 0 */
/* eslint-disable import/no-extraneous-dependencies */
import { AmazonPayClient } from '@amazonpay/amazon-pay-api-sdk-nodejs';
import assert from 'assert';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
  OnlineSalesType,
  DropshipCategory,
  ReceivingMethod,
  DeliveryChargeCategoryEc,
  StoreCodes,
  Product,
  ReceiptMethod,
} from '@cainz-next-gen/types';
import { AxiosError } from 'axios';
import {
  GetProduct,
  GetStore,
  GetMember,
  InvalidWebBackOrderFlagValue,
  GetIndividualShippingFee,
  InventoryErrorInformationInterface,
  ProductItems,
  InventoryResponse,
  CanBePurchasedValue,
  RenewProductItems,
  GetUser,
  SelectProductPrice,
  ProductItem,
  Price,
  UserInfo,
  GetShippingCost,
  CheckNonDeliverResponse,
  CheckNonDeliveryValue,
  ReceiptMethodPatternResponse,
  GetCartsFromDb,
  UpdateCartsToDbResponse,
  UpdateCartsToDbData,
  AmazonPayButtonConfig,
  CreateCartsToDb,
  GetEcTemplateRecords,
  GetEcTemplateResponse,
} from './interfaces/orderInterfaces.interface';
import {
  addressBookData,
  bffProductData,
  bffStoreData,
  memberData,
  myStoresData,
} from './BFF_data/data';
import { StatusCode } from './constants/status-code';
import {
  CategoryDescriptionMessage,
  CommonProcessCategoryError,
  CommonProcessCategoryErrorMessage,
  ErrorCode,
  ErrorMessage,
  MadeToOrderCategory,
} from './constants/error-code';
import {
  algorithmInUse,
  PlacementOptions,
  scopes,
} from './constants/amazonPayButton-configuration';
import { EcTemplateRecordData } from './BFF_data/templateRecord';

@Injectable()
export class OrderService {
  private readonly FIRESTORE_COLLECTION_USER = 'users';

  private readonly FIRESTORE_SUB_COLLECTION_NAME = 'carts';

  private readonly FIRESTORE_COLLECTION_NAME_ANNONYMOUS = 'anonymousUsers';

  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
  ) {
    dayjs.extend(timezone);
    dayjs.extend(utc);
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {invalidWebBackOrderFlag} boolean - Product master.Web order unavailable flag
   * @param {onlineSalesCategory} string - Product master.Online sales category
   * @param {customizedProductCategory} string - Product master.Product-specific classification
   * @param {dropShippingCategory} string - Product master.Dropship classification
   * @param {supportBackOrder} boolean - Store master.Availability of order
   * @return {object}
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public getInvalidWebBackOrderFlagValue(
    invalidWebBackOrderFlag: boolean,
    onlineSalesCategory: string,
    customizedProductCategory: string,
    dropShippingCategory: string,
    supportBackOrder: boolean,
  ): InvalidWebBackOrderFlagValue {
    try {
      this.logger.info('start: getInvalidWebBackOrderFlagValue');
      let status = 1;
      let invalidWebBackOrderFlagForStorePickup: boolean = null;
      let invalidWebBackOrderFlagForDesignatedDelivery: boolean = null;
      if (onlineSalesCategory === null) {
        status = 0;
      } else if (supportBackOrder === null) {
        status = 0;
      } else if (
        invalidWebBackOrderFlag === null &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === null &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = false;
        invalidWebBackOrderFlagForDesignatedDelivery = false;
      } else if (
        invalidWebBackOrderFlag === true &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === null &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = true;
        invalidWebBackOrderFlagForDesignatedDelivery = true;
      } else if (
        invalidWebBackOrderFlag === false &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === null &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = false;
        invalidWebBackOrderFlagForDesignatedDelivery = false;
      } else if (
        invalidWebBackOrderFlag === false &&
        onlineSalesCategory ===
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === null &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = false;
        invalidWebBackOrderFlagForDesignatedDelivery = true;
      } else if (
        invalidWebBackOrderFlag === false &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === DropshipCategory.DROPSHIP_PRODUCT_TYPE &&
        dropShippingCategory === null &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = true;
        invalidWebBackOrderFlagForDesignatedDelivery = true;
      } else if (
        invalidWebBackOrderFlag === false &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === DropshipCategory.DROPSHIP_PRODUCT_TYPE &&
        supportBackOrder === true
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = true;
        invalidWebBackOrderFlagForDesignatedDelivery = true;
      } else if (
        invalidWebBackOrderFlag === false &&
        onlineSalesCategory !==
          OnlineSalesType.ONLINESALESTYPE_DIRECTLY_MANUFACTURER &&
        customizedProductCategory === null &&
        dropShippingCategory === null &&
        supportBackOrder === false
      ) {
        status = 1;
        invalidWebBackOrderFlagForStorePickup = true;
        invalidWebBackOrderFlagForDesignatedDelivery = false;
      }
      this.logger.info('End: getInvalidWebBackOrderFlagValue');
      return {
        status,
        invalidWebBackOrderFlagForStorePickup,
        invalidWebBackOrderFlagForDesignatedDelivery,
      };
    } catch (error) {
      this.commonService.logException(
        'method getInvalidWebBackOrderFlagValue error',
        error,
      );
      return {
        status: 1,
        invalidWebBackOrderFlagForStorePickup: null,
        invalidWebBackOrderFlagForDesignatedDelivery: null,
      };
    }
  }

  /**
   * @param {productIds} Array - Product ID for which you want to obtain information
   * @param {storeCodes} Array - Store code for which you want to obtain price and inventory information
   * @param {membershipRank} string - Membership rank Set for members
   * @return {object}
   *
   * @throws {Error} Will throw an error if something goes wrong
   */
  public getProduct(
    productIds: Array<string>,
    storeCodes: Array<string>,
    membershipRank = '99',
  ): GetProduct {
    try {
      if (
        productIds === null ||
        productIds.length === 0 ||
        storeCodes === null ||
        storeCodes.length === 0 ||
        productIds.some((productId) => productId.length === 0) ||
        storeCodes.some((storeCode) => storeCode.length === 0)
      ) {
        return {
          status: 0,
          data: null,
        };
      }
      this.logger.info('start: getProduct');
      const productIdsString = productIds.join(',');
      const storeCodesString = this.editStoreCodes(storeCodes);
      this.logger.info('End: getProduct');
      return { status: 1, data: bffProductData };
    } catch (error) {
      this.commonService.logException('method getProduct error', error);
      throw new Error('Failed to access getProduct');
    }
  }

  /**
   * @param {storeCodes} Array - Store codes array
   * @return {string} Store codes concatenated as a string
   */
  public editStoreCodes(storeCode) {
    const paddedArray = storeCode.map((str) => str.padStart(4, 0));
    const storeCodeString = paddedArray.join(',');
    return storeCodeString;
  }

  /**
   * @param {storeCodes} Array - Store code
   * @return {object} Store information object
   *
   * @throws {Error} Will throw an error if something goes wrong
   */
  public getStore(storeCodes: Array<string>): GetStore {
    try {
      this.logger.info('start: getStore');
      if (
        storeCodes === null ||
        storeCodes.length === 0 ||
        storeCodes.some((storeCode) => storeCode.length === 0)
      ) {
        return {
          status: 0,
          data: null,
        };
      }
      // Edit the input values for calling the BFF store details API
      const modifiedStoreCodes = this.editStoreCodes(storeCodes);
      // BFF Store Details API Call reponsedata as storeInfo,temporary using mock data from docusaurus
      const responseObj = {
        status: 1,
        data: [bffStoreData],
      };
      this.logger.info('End: getStore');
      return responseObj;
    } catch (errror) {
      this.commonService.logException('method getStore error', errror);
      throw new Error('Failed to access getStore');
    }
  }

  /**
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong.
   */
  public getIndividualShippingFee(
    receivingMethod: string,
    deliveryChargeCategoryEc: string,
    individualDeliveryChargeEc: number,
    quantity: number,
  ): GetIndividualShippingFee {
    try {
      if (!(receivingMethod && deliveryChargeCategoryEc && quantity)) {
        return {
          status: 0,
        };
      }
      const individualDeliveryChargeEcValue = individualDeliveryChargeEc ?? 0;
      if (receivingMethod === ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS) {
        switch (deliveryChargeCategoryEc) {
          case DeliveryChargeCategoryEc.INDIVIDUAL_SHIPPING_FEE:
          case DeliveryChargeCategoryEc.FREE_BASIC_SHIPPING:
            return {
              status: 1,
              individualShippingCost: individualDeliveryChargeEcValue,
              subtotalIndividualShippingCost:
                individualDeliveryChargeEcValue * quantity,
            };
          case DeliveryChargeCategoryEc.FREE_SHIPPING:
          case DeliveryChargeCategoryEc.FLAT_RATE_SHIPPING:
          case DeliveryChargeCategoryEc.STANDARD_SHIPPING_FEE:
          case DeliveryChargeCategoryEc.FREE_SHIPPING_ON_ALL_ITEMS:
            return {
              status: 1,
              individualShippingCost: 0,
              subtotalIndividualShippingCost: 0,
            };
          default:
            return {
              status: 0,
            };
        }
      } else if (receivingMethod === ReceivingMethod.PICKUP_AT_STORE) {
        return {
          status: 1,
          individualShippingCost: 0,
          subtotalIndividualShippingCost: 0,
        };
      } else {
        return {
          status: 0,
        };
      }
    } catch (error) {
      this.commonService.logException(
        'method getIndividualShippingFee error',
        error,
      );
      throw new Error('Failed to access getIndividualShippingFee');
    }
  }

  /**
   * @param {userId} string - user ID for which you want to obtain information
   * @return {object}
   *
   * @throws {Error} Will throw an error if something goes wrong
   */
  public getMember(userId: string): GetMember {
    if (userId === null || userId.length === 0) {
      return {
        status: 0,
        member: null,
        addressBook: null,
        availablePoints: null,
        myStores: null,
      };
    }
    try {
      this.logger.info('start: getMember');
      // call BFF's personal information acquisition API
      const member = memberData;
      // call backend address book address inquiry API
      const addressBook = addressBookData;
      // call BFF Point acquisition API
      const availablePoints = 95;
      // call BFF's My Store acquisition API for EC
      const myStores = myStoresData;
      this.logger.info('end: getMember');
      return {
        status: 1,
        member,
        addressBook,
        availablePoints,
        myStores,
      };
    } catch (error) {
      this.commonService.logException('method getMember error', error);
      throw new Error('Failed to access getMember');
    }
  }

  /**
   * @param {productItems} ProductItem[] - Array of product items form cart
   * @return {object}
   * @param {requestForWebBackOrder} boolean - Set webBackOrder flag true or false
   * @throws {Error} Will throw an error if error occurred while doing inventory check for products
   */

  public checkInventory(
    productItems: ProductItems[],
    requestForWebBackOrder: boolean,
  ): InventoryResponse {
    const productItem: any = {
      status: StatusCode.SUCCESS,
      errors: [],
      notifications: [],
      productItems,
    };
    this.logger.info(`check Inventory for products is Started`);
    const isNonInventoryCheckCategory = (res, category) =>
      Object.values(category).some(
        (result: any) => result.id === res?.product?.customizedProductCategory,
      );
    try {
      productItems.forEach((res) => {
        res.errors = [];
        res.notifications = [];
        if (isNonInventoryCheckCategory(res, MadeToOrderCategory)) {
          this.logger.info(
            `Inventory check not required if product is belongs to made to Order category`,
          );
          res.isWebBackOrder = false;
        } else if (
          res?.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS
        ) {
          this.logger.info(
            `Inventory check is required if product not belongs to made to Order category`,
          );
          this.isProductBelongsDelivery(
            res,
            productItem,
            productItems,
            requestForWebBackOrder,
          );
        } else if (res?.receivingMethod === ReceivingMethod.PICKUP_AT_STORE) {
          this.isProductBelongsStore(
            res,
            productItem,
            productItems,
            requestForWebBackOrder,
          );
        }
      });
    } catch (e: any) {
      this.commonService.logException(
        'while checking Inventory for products getting error',
        `${e.message}`,
      );
      return { status: StatusCode.FAILURE };
    }
    return productItem;
  }

  public isProductBelongsDelivery(
    res: ProductItems,
    productItem: any,
    productItems: ProductItems[],
    requestForWebBackOrder: boolean,
  ) {
    this.logger.info(
      `${res?.productId} this product is chosen for designated delivery`,
    );
    if (res?.quantity > res?.product?.inventories[0].quantityAvailable) {
      this.logger.info(
        `${res?.productId} this product quantity is greater than available quantity`,
      );
      if (
        res?.invalidWebBackOrderFlagForDesignatedDelivery !== true &&
        requestForWebBackOrder === true
      ) {
        this.logger.info(`carts-shipping-notification message will come`);
        productItem.notifications = [];
        const notifications: InventoryErrorInformationInterface = {
          category: CommonProcessCategoryError.CART_CATEGORY_SHIPPING,
          errorCode: CommonProcessCategoryError.CART_SHIPPING_NOTIFICATION1,
          message:
            CommonProcessCategoryErrorMessage.CART_SHIPPING_NOTIFICATION1_MESSAGE,
        };
        res.notifications.push({
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_NOTIFICATION1,
          description:
            CommonProcessCategoryErrorMessage.CART_LINE_NOTIFICATION1_DESCRIPTION,
        });
        const notificationData = productItem.notifications.push(notifications);
        res.isWebBackOrder = true;
        productItem = {
          status: StatusCode.SUCCESS,
          notificationData,
          productItems,
        };
        this.logger.info(
          `${res.productId} this product Item chosen for delivery Available for order`,
        );
      } else if (
        requestForWebBackOrder === false ||
        (res?.invalidWebBackOrderFlagForDesignatedDelivery === true &&
          requestForWebBackOrder === true)
      ) {
        this.logger.info(`carts-data-error-004 error occurred here`);
        productItem.errors = [];
        const errors: InventoryErrorInformationInterface = {
          category: CommonProcessCategoryError.CART_CATEGORY,
          errorCode: CommonProcessCategoryError.CART_DATA_CODE4,
          message: CommonProcessCategoryErrorMessage.CART_DATA_CODE4_MESSAGE,
        };
        res.errors.push({
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM_2,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE9,
          description:
            CommonProcessCategoryErrorMessage.CART_LINE_CODE9_DESCRIPTION,
        });
        const errorData = productItem.errors.push(errors);
        res.isWebBackOrder = false;
        productItem = {
          status: StatusCode.SUCCESS,
          errorData,
          productItems,
        };
        this.logger.info(
          `${res.productId} this product Item chosen for delivery Not available for order`,
        );
      }
    } else if (res?.quantity < res?.product?.inventories[0].quantityAvailable) {
      this.logger.info(
        `${res?.productId} this product quantity is less than available quantity, so available for purchase`,
      );
      return productItem;
    } else if (
      res?.quantity === res?.product?.inventories[0].quantityAvailable
    ) {
      this.logger.info(
        `${res?.productId} this product quantity is equal to available quantity, so available for purchase`,
      );
      return productItem;
    }
  }

  public isProductBelongsStore(
    res: ProductItems,
    productItem: any,
    productItems: ProductItems[],
    requestForWebBackOrder: boolean,
  ) {
    this.logger.info(
      `${res?.productId} this product is chosen for store pick up`,
    );
    if (res?.quantity > res?.product?.inventories[0].quantityAvailable) {
      this.logger.info(
        `${res?.productId} this product quantity is greater than available quantity`,
      );
      if (
        res?.invalidWebBackOrderFlagForStorePickup !== true &&
        requestForWebBackOrder === true
      ) {
        this.logger.info(`carts-pickup-notification message will come`);
        productItem.notifications = [];
        const notifications: InventoryErrorInformationInterface = {
          category: CommonProcessCategoryError.CART_CATEGORY_STORE,
          errorCode: CommonProcessCategoryError.CART_PICKUP_NOTIFICATION1,
          message:
            CommonProcessCategoryErrorMessage.CART_PICKUP_NOTIFICATION1_DESCRIPTION,
        };
        res.notifications.push({
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_NOTIFICATION1,
          description:
            CommonProcessCategoryErrorMessage.CART_LINE_NOTIFICATION1_DESCRIPTION,
        });
        res.isWebBackOrder = true;
        const notificationData = productItem.notifications.push(notifications);
        productItem = {
          status: StatusCode.SUCCESS,
          notificationData,
          productItems,
        };
        this.logger.info(
          `${res.productId} this product Item chosen for StorePickup Available for order`,
        );
      } else if (
        requestForWebBackOrder === false ||
        (res?.invalidWebBackOrderFlagForStorePickup === true &&
          requestForWebBackOrder === true)
      ) {
        this.logger.info(`carts-data-error-004 error occurred here`);
        productItem.errors = [];
        const errors: InventoryErrorInformationInterface = {
          category: CommonProcessCategoryError.CART_CATEGORY,
          errorCode: CommonProcessCategoryError.CART_DATA_CODE4,
          message: CommonProcessCategoryErrorMessage.CART_DATA_CODE4_MESSAGE,
        };
        res.errors.push({
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM_2,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE10,
          description:
            CommonProcessCategoryErrorMessage.CART_LINE_CODE10_DESCRIPTION,
        });
        res.isWebBackOrder = false;
        const errorData = productItem.errors.push(errors);
        productItem = {
          status: StatusCode.SUCCESS,
          errorData,
          productItems,
        };
        this.logger.info(
          `${res.productId} this product Item chosen for StorePickup Not available for order`,
        );
      }
    } else if (res?.quantity < res?.product?.inventories[0].quantityAvailable) {
      this.logger.info(
        `${res?.productId} this product quantity is less than available quantity, so available for purchase`,
      );
      return productItem;
    } else if (
      res?.quantity === res?.product?.inventories[0].quantityAvailable
    ) {
      this.logger.info(
        `${res?.productId} this product quantity is equal to available quantity, so available for purchase`,
      );
      return productItem;
    }
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {productItem} Array
   * @return {object}
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */

  public async canBePurchased(productItem: any): Promise<CanBePurchasedValue> {
    this.logger.info('start: canBePurchased');
    try {
      if (
        !('supportPickup' in productItem) ||
        productItem?.supportPickup === null ||
        productItem?.supportPickup === '' ||
        productItem.productItems === null ||
        productItem.productItems.length === 0 ||
        productItem.productItems.some((item) => Object.keys(item).length === 0)
      ) {
        return { status: StatusCode.FAILURE };
      }
      const resp = await this.isValidCanPurchasedData(productItem);
      this.logger.info('end: canBePurchased');
      return resp;
    } catch (error) {
      this.commonService.logException('method canBePurchased error', error);
      throw new Error('Failed to access canBePurchased', error);
    }
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @return {object}
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async isValidCanPurchasedData(
    productItem: any,
  ): Promise<CanBePurchasedValue> {
    const { supportPickup } = productItem;
    let resp: CanBePurchasedValue;
    const productItems = [];
    const processDateTime = new Date();
    for (let index = 0; index < productItem.productItems.length; index++) {
      const items = productItem.productItems[index];
      if (
        !('onlineFlagEc' in items.product) ||
        !('onlineStartTimeEc' in items.product) ||
        !('onlineEndTimeEc' in items.product) ||
        !('receivingMethod' in items) ||
        !Object.values(ReceivingMethod).includes(items.receivingMethod) ||
        !('reserveFromStoreDisabled' in items.product) ||
        !('unitPrice' in items) ||
        !('invalidWebBackOrderFlagForStorePickup' in items)
      ) {
        return { status: StatusCode.FAILURE };
      }
      if (
        items.product.onlineFlagEc === false ||
        items.product.onlineStartTimeEc > processDateTime.toISOString() ||
        (items.product.onlineEndTimeEc < processDateTime.toISOString() &&
          items.product.onlineEndTimeEc !== null &&
          items.product.onlineEndTimeEc !== '')
      ) {
        resp = await this.basedOnlineAvailabilityProductMaster(
          items,
          productItems,
        );
      } else if (
        items.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
        items.product.personalDeliveryDisabled === true
      ) {
        resp = await this.basedOnUnacceptableProductMaster(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        items.product.reserveFromStoreDisabled === true
      ) {
        resp = await this.basedOnUnacceptableProductMaster(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        supportPickup === false
      ) {
        resp = await this.basedOnUnacceptableStoreMaster(items, productItems);
      } else if (
        items.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
        items.unitPrice === null
      ) {
        resp = await this.basedOnPriceInformation(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        Object.values(DropshipCategory).includes(
          items.product.dropShippingCategory,
        ) &&
        items.unitPrice === null
      ) {
        resp = await this.basedOnPriceInformation(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        !Object.values(DropshipCategory).includes(
          items.product.dropShippingCategory,
        ) &&
        items.unitPrice === null
      ) {
        resp = await this.basedOnPriceInformation(items, productItems);
      } else if (
        items.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
        items.product.inventories
          .map((res) => res.quantityAvailable === null)
          .includes(true)
      ) {
        resp = await this.basedOnInventoryInformation(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        Object.values(DropshipCategory).includes(
          items.product.dropShippingCategory,
        ) &&
        items.product.inventories
          .map((res) => res.quantityAvailable === null)
          .includes(true)
      ) {
        resp = await this.basedOnInventoryInformation(items, productItems);
      } else if (
        items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
        !Object.values(DropshipCategory).includes(
          items.product.dropShippingCategory,
        ) &&
        items.invalidWebBackOrderFlagForStorePickup === true
      ) {
        resp = await this.basedOnInventoryInformation(items, productItems);
      } else {
        productItems.push(items);
        const errors = resp?.errors;
        resp = { status: 1, errors, productItems };
      }
    }
    return resp;
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async basedOnlineAvailabilityProductMaster(
    items: any,
    productItems: any,
  ) {
    const errorObj = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE2,
      message:
        CategoryDescriptionMessage[CommonProcessCategoryError.CART_DATA_CODE2],
    };
    const status = StatusCode.SUCCESS;
    const errors = [];
    errors.push(errorObj);
    items.errors = [
      {
        category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
        errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
        description:
          CategoryDescriptionMessage[
            CommonProcessCategoryError.CART_LINE_CODE5
          ],
      },
    ];
    items.isReserveFromStoreAvailable = false;
    items.isPersonalDeliveryAvailable = false;
    productItems.push(items);
    return {
      status,
      errors,
      productItems,
    };
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {status} number
   * @param {errors} Array
   * @param {product} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async basedOnUnacceptableProductMaster(
    items: any,
    productItems: any,
  ) {
    const errorObj = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE2,
      message:
        CategoryDescriptionMessage[CommonProcessCategoryError.CART_DATA_CODE2],
    };
    const status = StatusCode.SUCCESS;
    const errors = [];
    errors.push(errorObj);
    if (items.product.reserveFromStoreDisabled === true) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE6,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE6
            ],
        },
      ];
      items.isReserveFromStoreAvailable = false;
    } else if (items.product.personalDeliveryDisabled === true) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE7,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE7
            ],
        },
      ];
      items.isPersonalDeliveryAvailable = false;
    }
    productItems.push(items);
    return {
      status,
      errors,
      productItems,
    };
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {errors} Array
   * @param {product} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async basedOnUnacceptableStoreMaster(items: any, productItems: any) {
    const errorObj = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE2,
      message:
        CategoryDescriptionMessage[CommonProcessCategoryError.CART_DATA_CODE2],
    };
    const status = StatusCode.SUCCESS;
    const errors = [];
    errors.push(errorObj);
    items.errors = [
      {
        category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
        errorCode: CommonProcessCategoryError.CART_LINE_CODE8,
        description:
          CategoryDescriptionMessage[
            CommonProcessCategoryError.CART_LINE_CODE8
          ],
      },
    ];
    items.isReserveFromStoreAvailable = false;
    productItems.push(items);
    return {
      status,
      errors,
      productItems,
    };
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {errors} Array
   * @param {product} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async basedOnPriceInformation(items: any, productItems: any) {
    const errorObj = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE2,
      message:
        CategoryDescriptionMessage[CommonProcessCategoryError.CART_DATA_CODE2],
    };
    const status = StatusCode.SUCCESS;
    const errors = [];
    errors.push(errorObj);
    if (
      items.receivingMethod ===
        ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
      items.unitPrice === null
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isPersonalDeliveryAvailable = false;
    } else if (
      items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
      Object.values(DropshipCategory).includes(
        items.product.dropShippingCategory,
      ) &&
      items.unitPrice === null
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isReserveFromStoreAvailable = false;
    } else if (
      items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
      !Object.values(DropshipCategory).includes(
        items.product.dropShippingCategory,
      ) &&
      items.unitPrice === null
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isReserveFromStoreAvailable = false;
    }
    productItems.push(items);
    return {
      status,
      errors,
      productItems,
    };
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {errors} Array
   * @param {product} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async basedOnInventoryInformation(items: any, productItems: any) {
    const errorObj = {
      category: CommonProcessCategoryError.CART_CATEGORY,
      errorCode: CommonProcessCategoryError.CART_DATA_CODE2,
      message:
        CategoryDescriptionMessage[CommonProcessCategoryError.CART_DATA_CODE2],
    };
    const status = StatusCode.SUCCESS;
    const errors = [];
    errors.push(errorObj);
    if (
      items.receivingMethod ===
        ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
      items.product.inventories
        .map((res) => res.quantityAvailable === null)
        .includes(true)
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isPersonalDeliveryAvailable = false;
    } else if (
      items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
      Object.values(DropshipCategory).includes(
        items.product.dropShippingCategory,
      ) &&
      items.product.inventories
        .map((res) => res.quantityAvailable === null)
        .includes(true)
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isReserveFromStoreAvailable = false;
    } else if (
      items.receivingMethod === ReceivingMethod.PICKUP_AT_STORE &&
      !Object.values(DropshipCategory).includes(
        items.product.dropShippingCategory,
      ) &&
      items.invalidWebBackOrderFlagForStorePickup === true
    ) {
      items.errors = [
        {
          category: CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
          errorCode: CommonProcessCategoryError.CART_LINE_CODE5,
          description:
            CategoryDescriptionMessage[
              CommonProcessCategoryError.CART_LINE_CODE5
            ],
        },
      ];
      items.isReserveFromStoreAvailable = false;
    }
    productItems.push(items);
    return {
      status,
      errors,
      productItems,
    };
  }

  /**
   * @param {errors} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public async checkNonDelivery(
    productItems: any,
    deliveryInfo: any,
  ): Promise<CheckNonDeliveryValue> {
    try {
      if (
        productItems === null ||
        productItems.length === 0 ||
        productItems.some((item) => Object.keys(item).length === 0) ||
        Object.keys(deliveryInfo).length === 0 ||
        !('zipCode' in deliveryInfo) ||
        !('prefecture' in deliveryInfo) ||
        !('city' in deliveryInfo) ||
        deliveryInfo.zipCode === null ||
        deliveryInfo.zipCode === '' ||
        deliveryInfo.prefecture === null ||
        deliveryInfo.prefecture === '' ||
        deliveryInfo.city === null ||
        deliveryInfo.city === ''
      ) {
        return { status: StatusCode.FAILURE };
      }
      const targetProductItems = productItems.filter(
        (resp) =>
          resp.receivingMethod ===
            ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
          resp.isCheckoutTarget === true,
      );
      if (targetProductItems.length === 0) {
        return { status: StatusCode.FAILURE };
      }
      this.logger.debug('start checkNonDelivery');
      return await this.getCheckDeliveryApiData(
        targetProductItems,
        deliveryInfo,
      );
    } catch (error) {
      this.commonService.logException('method checkNonDelivery error', error);
      throw new Error('Failed to access checkNonDelivery');
    }
  }

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {productItems} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async getCheckDeliveryApiData(
    productItem: any,
    deliveryDetails: any,
  ) {
    try {
      const headers = {
        client_id: this.env.get<string>('MULE_ECF_CLIENT_ID'),
        client_secret: this.env.get<string>('MULE_ECF_CLIENT_SECRET'),
      };
      const getCheckDeliveryUrl = this.env.get<string>(
        'UNDELIVERABLE_CHECK_API',
      );
      const productIdsString = productItem
        .map((items) => items.productId)
        .join(',');
      const url = getCheckDeliveryUrl
        .replace('{productIds}', productIdsString)
        .replace('{zipcode}', deliveryDetails.zipCode)
        .replace('{prefecture}', deliveryDetails.prefecture)
        .replace('{address1}', deliveryDetails.city)
        .replace('{address2}', deliveryDetails.city);
      const { data } = await firstValueFrom(
        this.httpService.get(url, { headers }).pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException(
              'checkNonDelivery API Error',
              error,
            );
            throw new HttpException(
              {
                errorCode: ErrorCode.UNDELIVERABLE_CHECK_API,
                message: ErrorMessage[ErrorCode.UNDELIVERABLE_CHECK_API],
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      const response = data as CheckNonDeliverResponse;
      return await this.isValidJudgmentForCheckDelivery(response, productItem);
    } catch (error) {
      this.commonService.logException(
        'getCheckDeliveryApiData API Error Occured',
        error,
      );
    }
  }

  /**
   * @param {errors} Array
   * @param {productItems} Array
   * @return {object}
   * @throws {Error} Will throw an error if method is something went wrong
   */
  private async isValidJudgmentForCheckDelivery(
    responseCheckDelivery: any,
    productItemData: any,
  ) {
    const productItems = [];
    const errors = [];
    const status = StatusCode.SUCCESS;
    if (responseCheckDelivery.canShip === true) {
      productItems.push(...productItemData);
      return {
        status,
        productItems,
      };
    }
    if (responseCheckDelivery.canShip === false) {
      if (responseCheckDelivery.items.length > 0) {
        productItemData.map((item) => {
          responseCheckDelivery.items.map((canShipData) => {
            if (
              item.productId === canShipData.productCode &&
              canShipData.canShip === false &&
              canShipData.reason ===
                'NOT_SHIP_AREAS_HOKKAIDO_OKINAWA_REMOTEISLAND'
            ) {
              item.errors = [
                {
                  category:
                    CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
                  errorCode: CommonProcessCategoryError.CART_LINE_CODE11,
                  description:
                    CategoryDescriptionMessage[
                      CommonProcessCategoryError.CART_LINE_CODE11
                    ],
                },
              ];
            } else if (
              item.productId === canShipData.productCode &&
              canShipData.canShip === false &&
              canShipData.reason === 'NOT_SHIP_AREAS_SEINO_TRANSPORTATION'
            ) {
              item.errors = [
                {
                  category:
                    CommonProcessCategoryError.CART_CATEGORY_PRODUCTITEM,
                  errorCode: CommonProcessCategoryError.CART_LINE_CODE12,
                  description:
                    CategoryDescriptionMessage[
                      CommonProcessCategoryError.CART_LINE_CODE12
                    ],
                },
              ];
            }
          });
        });
      }
      const errorCartObj = {
        category: CommonProcessCategoryError.CART_CATEGORY,
        errorCode: CommonProcessCategoryError.CART_DATA_CODE5,
        message:
          CategoryDescriptionMessage[
            CommonProcessCategoryError.CART_DATA_CODE5
          ],
      };
      const errorShipObj = {
        category: CommonProcessCategoryError.CART_CATEGORY_SHIPPING,
        errorCode: CommonProcessCategoryError.CART_SHIPPING_LINE_CODE1,
        message:
          CategoryDescriptionMessage[
            CommonProcessCategoryError.CART_SHIPPING_LINE_CODE1
          ],
      };
      errors.push(errorCartObj, errorShipObj);
    }
    productItems.push(...productItemData);
    return {
      status,
      errors,
      productItems,
    };
  }

  /**
   * @param {productItems} array - Array of productItem objects
   * @param {products} array - Array of product objects
   * @param {isMember} boolean - isMember of cainz or not
   * @param {storeInfo} object - object with store information
   * @return {object}
   */
  public async renewProductItems(
    productItems,
    products,
    isMember,
    storeInfo,
  ): Promise<RenewProductItems> {
    const failStatus = {
      status: StatusCode.FAILURE,
      productItems: null,
    };
    if (
      !(
        productItems &&
        products &&
        storeInfo &&
        typeof isMember === 'boolean'
      ) ||
      isMember === null ||
      productItems.length === 0 ||
      products.length === 0 ||
      Object.keys(storeInfo).length === 0
    ) {
      return failStatus;
    }
    try {
      this.logger.info('start: renewProductItems');
      for (let index = 0; index < productItems.length; index++) {
        let productItem = productItems[index];
        // update productItem.product
        productItem.product = JSON.parse(JSON.stringify(products[index]));
        // static value true will be replaced by productItem.product.InvalidWebBackOrderFlag
        const backOrderFlagVal = await this.setInvalidWebBackOrderFlagValue(
          productItem,
          storeInfo,
        );
        if (backOrderFlagVal.status !== StatusCode.SUCCESS) {
          return failStatus;
        }
        productItem = backOrderFlagVal.productItem;
        const productPriceSelectionVal = await this.setSelectProductPrice(
          productItem,
          storeInfo.code,
        );
        if (productPriceSelectionVal.status !== StatusCode.SUCCESS) {
          return failStatus;
        }
        productItem = productPriceSelectionVal.productItem;
        const shippingFeeVal = await this.setIndividualShippingFee(productItem);
        if (shippingFeeVal.status !== StatusCode.SUCCESS) {
          return failStatus;
        }
        productItem = shippingFeeVal.productItem;
        if (isMember) {
          // productItem.campaignPoints = productItem.product.campaignPoints;
          productItem.subtotalCampaignPoints =
            productItem.campaignPoints * productItem.quantity;
        } else {
          productItem.campaignPoints = 0;
          productItem.subtotalCampaignPoints = 0;
        }
        productItem.updatedAt = new Date();
      }
      this.logger.info('end: renewProductItems');
      return {
        status: StatusCode.SUCCESS,
        productItems,
      };
    } catch (error) {
      this.commonService.logException('method renewProductItems error', error);
      return failStatus;
    }
  }

  public async setIndividualShippingFee(productItem) {
    const result = await this.getIndividualShippingFee(
      productItem.receivingMethod,
      productItem.product.deliveryChargeCategoryEc,
      productItem.product.individualDeliveryChargeEc,
      productItem.quantity,
    );
    if (result.status === 1) {
      productItem.individualShippingCost = result.individualShippingCost;
      productItem.subtotalIndividualShippingCost =
        result.subtotalIndividualShippingCost;
      return { status: 1, productItem };
    }
    return { status: 0 };
  }

  public async setInvalidWebBackOrderFlagValue(productItem, storeInfo) {
    const result = await this.getInvalidWebBackOrderFlagValue(
      false,
      productItem.product.onlineSalesCategoryEc,
      productItem.product.customizedProductCategory,
      productItem.product.dropShippingCategory,
      storeInfo.detail.supportBackOrder,
    );
    if (result.status === 1) {
      productItem.invalidWebBackOrderFlagForStorePickup =
        result.invalidWebBackOrderFlagForStorePickup;
      productItem.invalidWebBackOrderFlagForDesignatedDelivery =
        result.invalidWebBackOrderFlagForDesignatedDelivery;
      return { status: 1, productItem };
    }
    return { status: 0 };
  }

  public async setSelectProductPrice(productItem, storeCode) {
    const result = await this.selectProductPrice(productItem, storeCode);
    if (result.status === 1) {
      productItem.unitPriceForStorePickup = result.unitPriceForStorePickup;
      productItem.unitPriceForDelivery = result.unitPriceForDelivery;
      productItem.selectedUnitPrice = result.selectedUnitPrice;
      productItem.subtotalProductAmount =
        productItem.selectedUnitPrice * productItem.quantity;
      return { status: 1, productItem };
    }
    return { status: 0, productItem };
  }

  /**
   * @param {userId} string - user ID for which you want to obtain user information
   * @return {Promise}
   *
   * @throws {Error} Will throw an error if something goes wrong
   */
  public async getUser(userId: string): Promise<GetUser> {
    if (userId === null || userId === '') {
      return {
        status: StatusCode.FAILURE,
        isMember: null,
        userData: null,
      };
    }
    try {
      this.logger.info('start: getUser');
      const userDocRef = await this.getUserDocRef(
        this.FIRESTORE_COLLECTION_USER,
        userId,
      );
      if ((await userDocRef.get()).exists) {
        const result = this.doPreProcessingGetUserInfo(userDocRef, true);
        return await result;
      }
      // find the userid in anonymous users collection
      const anonymousUserDocRef = await this.getUserDocRef(
        this.FIRESTORE_COLLECTION_NAME_ANNONYMOUS,
        userId,
      );
      if ((await anonymousUserDocRef.get()).exists) {
        const result = this.doPreProcessingGetUserInfo(
          anonymousUserDocRef,
          false,
        );
        return await result;
      }
      return {
        status: StatusCode.FAILURE,
        isMember: null,
        userData: null,
      };
    } catch (error) {
      this.commonService.logException('method getUser error', error);
      throw new Error('Failed to access getUser');
    }
  }

  public async getUserDocRef(collectionName, userId) {
    try {
      this.logger.info('start : getUserDocRef');
      const userDocRef = await this.firestoreBatchService
        .findCollection(collectionName)
        .doc(userId);
      return userDocRef;
    } catch (error) {
      this.commonService.logException('method getUserDocRef error', error);
      throw new Error('Failed to access getUserDocRef');
    }
  }

  public async getUserInformationObj(userDocRef) {
    try {
      this.logger.info('start : getUserInformationObj');
      const userDocumentData = (await userDocRef.get()).data();
      if (userDocumentData) {
        this.logger.debug(JSON.stringify(userDocumentData));
        return userDocumentData;
      }
    } catch (error) {
      this.commonService.logException(
        'method getUserInformationObj error',
        error,
      );
      throw new Error('Failed to access getUserInformationObj');
    }
  }

  /**
   * @param {productItem} object - 	Product line object
   * @param {storeCode} string - 	Selected pick-up store code
   * @return {object} selected product price information object
   * @throws {Error} Will throw an error if something goes wrong
   * @function unitPriceForStorePickup(productItem,prices,storeCode) - returns unitPriceForStorePickup With respect to dropShipping category
   * @function getStorePrice(prices,storeCode) - returns lowest price with respect to storeCode in prices object
   */
  public selectProductPrice(
    productItem: ProductItem,
    storeCode: string,
  ): SelectProductPrice {
    try {
      this.logger.info('start: selectProductPrice');
      const response = {
        status: StatusCode.FAILURE,
        unitPriceForStorePickup: null,
        unitPriceForDelivery: null,
        selectedUnitPrice: null,
      };
      // if productItem or storeCode is null or empty
      if (!(productItem && storeCode)) {
        this.logger.info('productItem or storeCode is empty or null');
        return response;
      }
      // if receiving method is not valid(null or empty)
      if (
        !(
          productItem.receivingMethod ===
            ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS ||
          productItem.receivingMethod === ReceivingMethod.PICKUP_AT_STORE
        )
      ) {
        return response;
      }
      const prices: Price[] = productItem?.product?.prices;
      // set unitPriceForDelivery with price associated with "888" storeCode
      response.unitPriceForDelivery = this.getStorePrice(
        prices,
        StoreCodes.EC_STORECODE,
      );
      // set unitPriceForStorePickup With respect to dropShipping category
      response.unitPriceForStorePickup = this.unitPriceForStorePickup(
        productItem,
        prices,
        storeCode,
      );
      // set selectedUnitPrice based on receivingMethod condition and returns response
      response.selectedUnitPrice =
        productItem.receivingMethod ===
        ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS
          ? response.unitPriceForDelivery
          : response.unitPriceForStorePickup;
      return { ...response, status: StatusCode.SUCCESS };
    } catch (error) {
      this.commonService.logException('method selectProductPrice error', error);
      throw new Error('Failed to access selectProductPrice');
    }
  }

  public unitPriceForStorePickup(
    productItem: ProductItem,
    prices: Price[],
    storeCode: string,
  ) {
    try {
      this.logger.info('start: unitPriceForStorePickup');
      const storeCodePrice = this.getStorePrice(prices, storeCode);
      const storeCodeEcPrice = this.getStorePrice(
        prices,
        StoreCodes.EC_STORECODE,
      );
      return productItem.product.dropShippingCategory ===
        DropshipCategory.DROPSHIP_PRODUCT_TYPE ||
        productItem.product.dropShippingCategory ===
          DropshipCategory.DROPSHIP_PRODUCT_TYPE_MARKETPLACE1 ||
        productItem.product.dropShippingCategory ===
          DropshipCategory.DROPSHIP_PRODUCT_TYPE_MARKETPLACE2
        ? storeCodeEcPrice
        : storeCodePrice;
    } catch (error) {
      this.commonService.logException(
        'method unitPriceForStorePickup error',
        error,
      );
      throw new Error('Failed to access unitPriceForStorePickup');
    }
  }

  public getStorePrice(prices: Price[], storeCode: string) {
    try {
      this.logger.info('start: getStorePrice');
      const priceInfo = prices.find((price) => price.storeCode === storeCode);
      if (!priceInfo) {
        return null;
      }
      const { priceIncludingTax } = priceInfo;
      const { salePriceIncludingTax } = priceInfo;
      if (priceIncludingTax == null) {
        return priceIncludingTax;
      }
      return priceIncludingTax <= salePriceIncludingTax
        ? priceIncludingTax
        : salePriceIncludingTax;
    } catch (error) {
      this.commonService.logException('method getStorePrice error', error);
      throw new Error('Failed to access getStorePrice');
    }
  }

  /**
   * @param {productItems} array - Array of productItem objects
   * @param {userInfo} object - User information object
   * @return {object}
   * @throws {Error} Will throw an error if something goes wrong
   * @function getShippingFeeApiData(productIdsString,amount,userInfo,)- returns the data from getShippingFeeApi
   */
  public async getShippingCost(
    productItems: ProductItem[],
    userInfo: UserInfo,
  ): Promise<GetShippingCost> {
    try {
      this.logger.info('start : getShippingCost');
      if (
        !(
          productItems.length &&
          userInfo &&
          typeof userInfo.isMember === 'boolean' &&
          userInfo.zipCode &&
          userInfo.prefecture
        ) ||
        (userInfo.isMember && !(typeof userInfo.billPayment === 'boolean')) ||
        (!userInfo.isMember && userInfo.billPayment !== false)
      ) {
        this.logger.info('Validation Failed');
        return { status: StatusCode.FAILURE };
      }
      const targetProductItems = productItems.filter(
        (productItem) =>
          productItem.receivingMethod ===
            ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS &&
          productItem.isCheckoutTarget,
      );
      if (targetProductItems.length === 0)
        return {
          status: StatusCode.SUCCESS,
          result: { basicFee: 0, regionalFee: 0, shortToDiscount: 0 },
        };
      const responseData = await this.getShippingFeeApiData(
        targetProductItems,
        userInfo,
      );
      return responseData.status === HttpStatus.OK
        ? { status: StatusCode.SUCCESS, result: responseData.result }
        : { status: StatusCode.FAILURE, result: responseData.result };
    } catch (error) {
      this.commonService.logException('method getShippingCost error', error);
      throw new Error('Failed to access getShippingCost');
    }
  }

  public async getShippingFeeApiData(
    targetProductItems: ProductItem[],
    userInfo: UserInfo,
  ): Promise<GetShippingCost> {
    try {
      this.logger.info('start : getShippingFeeApiData');
      const clientId = this.env.get<string>('MULE_ECF_CLIENT_ID');
      const clientSecret = this.env.get<string>('MULE_ECF_CLIENT_SECRET');
      const getShippingFeeUrl = this.env.get<string>('SHIPMENTS_FEES_URL');
      const productIdsString = targetProductItems
        .map((productItem) => productItem.product.productId)
        .join(',');
      const amount = targetProductItems.reduce((value, productItem) => {
        let finalAmount = value;
        finalAmount += productItem.subtotalProductAmount;
        return finalAmount;
      }, 0);
      const url =
        `${getShippingFeeUrl}?products=${productIdsString}` +
        `${
          'billPayment' in userInfo
            ? `&billpayment=${userInfo.billPayment}`
            : ''
        }` +
        `&amount=${amount}&zipcode=${userInfo.zipCode}&prefecture=${userInfo.prefecture}`;
      try {
        this.logger.info('call GetShippingFee API');
        const dataObj = await this.httpService.get(url, {
          headers: { client_id: clientId, client_secret: clientSecret },
        });
        const responseData = await lastValueFrom(dataObj);
        return { status: responseData.status, result: responseData.data };
      } catch (error: any) {
        this.commonService.logException(
          'GetShippingFee API Error Occured',
          error,
        );
        return { status: error.response.status, result: error.response.data };
      }
    } catch (error) {
      this.commonService.logException(
        'method getShippingFeeApiData error',
        error,
      );
      throw new Error('Failed to access getShippingFeeApiData');
    }
  }

  public async createCartsToDb(
    userId: string,
    isMember: boolean,
    req: any,
  ): Promise<CreateCartsToDb> {
    const returnObj = {
      status: StatusCode.FAILURE,
      cartId: null,
      cartInUse: null,
    };
    if (!(userId && typeof isMember === 'boolean')) {
      return returnObj;
    }
    try {
      this.logger.info('start: createCartsToDb');
      // Create a cart object according to "carts: Transport definitions" .
      const cartObj = {
        userId,
        productItems: [],
        storeCode: null,
        shippingAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await this.doPreProcessingCreateCartsToDb(
        userId,
        isMember,
        cartObj,
        req,
      );
      return result;
    } catch (error) {
      this.commonService.logException('method createCartsToDb error', error);
      return returnObj;
    }
  }

  public generateNewId(): string {
    // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    assert(autoId.length === 20, `Invalid auto ID: ${autoId}`);
    return autoId;
  }

  public async updateUserInfoInDb(userId, userDocRef, cartObj, req, isMember) {
    const returnFailureObj = {
      status: StatusCode.FAILURE,
      cartId: null,
      cartInUse: null,
    };
    try {
      this.logger.info('start: updateUserInfoInDb');
      if ((await userDocRef.get()).exists) {
        this.logger.info(
          'createCartsToDb: user id exists in users/annonymousers collection',
        );
        const docID = this.generateNewId();
        this.logger.info('docID');
        this.logger.info(docID);
        const usersCartsCollection = await userDocRef
          .collection(this.FIRESTORE_SUB_COLLECTION_NAME)
          .doc(docID)
          .set({ ...cartObj });

        const updatedBy = this.commonService.createFirestoreSystemName(
          req.originalUrl,
          req.method,
        );
        const updatedAt = new Date();
        const cartInUse = isMember
          ? `${this.FIRESTORE_COLLECTION_USER}/${userId}/${this.FIRESTORE_SUB_COLLECTION_NAME}/${docID}`
          : `${this.FIRESTORE_COLLECTION_NAME_ANNONYMOUS}/${userId}/${this.FIRESTORE_SUB_COLLECTION_NAME}/${docID}`;

        const updatedDataInUser = {
          updatedAt,
          updatedBy,
          cartInUse: await this.firestoreBatchService
            .findCollection(
              isMember
                ? this.FIRESTORE_COLLECTION_USER
                : this.FIRESTORE_COLLECTION_NAME_ANNONYMOUS,
            )
            .doc(userId)
            .collection(this.FIRESTORE_SUB_COLLECTION_NAME)
            .doc(docID),
        };
        const res = await userDocRef.update(updatedDataInUser);

        return {
          status: StatusCode.SUCCESS,
          cartId: docID,
          cartInUse,
        };
      }
      return returnFailureObj;
    } catch (error) {
      this.commonService.logException('method updateUserInfoInDb error', error);
      return returnFailureObj;
    }
  }

  public async doPreProcessingCreateCartsToDb(userId, isMember, cartObj, req) {
    const returnFailureObj = {
      status: StatusCode.FAILURE,
      cartId: null,
      cartInUse: null,
    };
    try {
      this.logger.info('start: doPreProcessingCreateCartsToDb');
      let userDocRef;
      if (isMember === true) {
        this.logger.info('doPreProcessingCreateCartsToDb :isMember true');
        userDocRef = await this.getUserDocRef(
          this.FIRESTORE_COLLECTION_USER,
          userId,
        );
      } else {
        this.logger.info('doPreProcessingCreateCartsToDb :isMember false');
        userDocRef = await this.getUserDocRef(
          this.FIRESTORE_COLLECTION_NAME_ANNONYMOUS,
          userId,
        );
      }

      const result = await this.updateUserInfoInDb(
        userId,
        userDocRef,
        cartObj,
        req,
        isMember,
      );
      return result;
    } catch (error) {
      this.commonService.logException(
        'method doPreProcessingCreateCartsToDb error',
        error,
      );
      return returnFailureObj;
    }
  }

  public async doPreProcessingGetUserInfo(userDocRef, isMember) {
    try {
      this.logger.info('start:doPreProcessingGetUserInfo');
      const usersInfoObj = await this.getUserInformationObj(userDocRef);
      const usersDataResult = {
        status: StatusCode.SUCCESS,
        isMember,
        userData: null,
      };
      if (usersInfoObj) {
        usersDataResult.userData = usersInfoObj;
        return usersDataResult;
      }
    } catch (error) {
      this.commonService.logException(
        'method doPreProcessingGetUserInfo error',
        error,
      );
    }
  }

  /**
   * @param {amazonPayTotalAmount} number - Amazon pay amount
   * @param {placement} object - Placement string where amazon pay button will be present
   * @return {object}
   */
  public async setAmazonPayButtonConfig(
    amazonPayTotalAmount: number,
    placement: string,
  ): Promise<AmazonPayButtonConfig> {
    const placementOptions = ['Cart', 'Checkout', 'Other'];
    if (
      !amazonPayTotalAmount ||
      !placement ||
      !placementOptions.includes(placement) ||
      typeof amazonPayTotalAmount !== 'number'
    ) {
      return {
        status: 0,
        amazonPayButtonConfig: null,
      };
    }
    try {
      this.logger.info('start: setAmazonPayButtonConfig');
      const config = {
        publicKeyId: this.env.get<string>('AMAZON_PAY_PUBLIC_KEY_ID'),
        privateKey: this.env.get<string>('AMAZON_PAY_SECRET_KEY'),
        region: 'jp',
        sandbox: true,
        algorithm: algorithmInUse,
      };
      let checkoutCancelUrlValue = '';
      if (placement === PlacementOptions.CART) {
        checkoutCancelUrlValue = this.env.get<string>(
          'AMAZON_PAY_CHECKOUT_CANCEL_URL_FOR_CART',
        );
      } else if (placement === PlacementOptions.CHECKOUT) {
        checkoutCancelUrlValue = this.env.get<string>(
          'AMAZON_PAY_CHECKOUT_CANCEL_URL_FOR_CHECKOUT',
        );
      }
      const payloadJSON = this.getPayloadJSON(
        checkoutCancelUrlValue,
        amazonPayTotalAmount,
      );
      const paymentClient = new AmazonPayClient(config);
      this.logger.info('Generating signature for payload');
      const signature = paymentClient.generateButtonSignature(payloadJSON);
      const amazonPayButtonConfig = this.getAmazonPayButtonConfig(
        amazonPayTotalAmount,
        placement,
        signature,
        payloadJSON,
      );
      this.logger.info('End: setAmazonPayButtonConfig');
      return {
        status: 1,
        amazonPayButtonConfig,
      };
    } catch (error) {
      this.commonService.logException(
        'method setAmazonPayButtonConfig error',
        error,
      );
      return {
        status: 0,
        amazonPayButtonConfig: null,
      };
    }
  }

  public getAmazonPayButtonConfig(amount, placement, signature, payloadJSON) {
    const sandBoxValue = true;
    return {
      sandbox: sandBoxValue,
      merchantId: this.env.get<string>('AMAZON_PAY_MERCHANT_ID'),
      ledgerCurrency: 'JPY',
      checkoutLanguage: 'ja_JP',
      productType: 'PayAndShip',
      placement,
      buttonColor: 'LightGray',
      estimatedOrderAmount: {
        amount,
        currencyCode: 'JPY',
      },
      createCheckoutSessionConfig: {
        payloadJSON: JSON.stringify(payloadJSON),
        signature,
        publicKeyId: this.env.get<string>('AMAZON_PAY_PUBLIC_KEY_ID'),
        algorithm: algorithmInUse,
      },
    };
  }

  public getPayloadJSON(checkoutCancelUrlValue, amazonPayTotalAmount) {
    return {
      webCheckoutDetails: {
        checkoutReviewReturnUrl: this.env.get<string>(
          'AMAZON_PAY_CHECKOUT_REVIEW_RETURN_URL',
        ),
        checkoutCancelUrl: checkoutCancelUrlValue,
      },
      deliverySpecifications: {
        addressRestrictions: {
          type: 'Allowed',
          restrictions: {
            JP: {
              statesOrRegions: this.env.get<string>('ADDRESS_RESTRICTIONS'),
            },
          },
        },
      },
      storeId: this.env.get<string>('AMAZON_PAY_STORE_ID'),
      scopes,
      paymentDetails: {
        chargeAmount: {
          amount: amazonPayTotalAmount.toString(),
          currencyCode: 'JPY',
        },
        allowOvercharge: false,
        paymentIntent: 'Confirm',
        canHandlePendingAuthorization: false,
      },
      chargePermissionType: 'OneTime',
      merchantMetadata: {
        merchantStoreName: this.env.get<string>('AMAZON_PAY_MERCHANT_NAME'),
        noteToBuyer: this.env.get<string>('AMAZON_PAY_NOTE_TO_BUYER'),
      },
    };
  }

  /**
   * @param {productItems} array - Array of productItem objects
   * @param {cartInUse} string - cartInUse information
   * @param {storeCode} string - storeCode information
   * @param {shippingAddress} object- shippingAdress information object
   * @return {status}
   * @throws {Error} Will throw an error if something goes wrong
   * @function processingUpdateCartsToDb(updateDbObj)- update data pass to next function
   * @function updateCartsInfoInDb(updateCartsDetails,userDocRef)- final data pass to firstore and return status
   */
  public async updateCartsToDb(
    cartInUse: string,
    productItems?: ProductItem[],
    storeCode?: string,
    shippingAddress?: any,
  ): Promise<UpdateCartsToDbResponse> {
    if (
      productItems === null ||
      !cartInUse ||
      cartInUse === null ||
      cartInUse === '' ||
      storeCode === null ||
      storeCode === '' ||
      shippingAddress === '' ||
      shippingAddress === null
    ) {
      return { status: StatusCode.FAILURE };
    }
    if (shippingAddress) {
      if (
        Object.keys(shippingAddress).length === 0 ||
        !('zipCode' in shippingAddress) ||
        !('prefecture' in shippingAddress) ||
        !('city' in shippingAddress)
      ) {
        return { status: StatusCode.FAILURE };
      }
    }
    try {
      this.logger.info('start: updateCartsToDb');
      // Create a cart object according to "carts: Transport definitions" .
      const cartObj: UpdateCartsToDbData = {
        cartInUse,
        productItems,
        storeCode,
        shippingAddress,
        updatedAt: new Date(),
      };
      return await this.processingUpdateCartsToDb(cartObj);
    } catch (error) {
      this.commonService.logException('method updateCartsToDb error', error);
      return { status: StatusCode.FAILURE };
    }
  }

  public async processingUpdateCartsToDb(updateDbObj) {
    try {
      this.logger.info('start: processingUpdateCartsToDb');
      const str = updateDbObj.cartInUse;
      const arr = str.split('/');
      const userId = arr[arr.length - 3];
      const userDocRef = await this.getUserDocRef(
        this.FIRESTORE_COLLECTION_USER,
        userId,
      );
      const result = await this.updateCartsInfoInDb(updateDbObj, userDocRef);
      return result;
    } catch (error) {
      this.commonService.logException(
        'method processingUpdateCartsToDb error',
        error,
      );
      return { status: StatusCode.FAILURE };
    }
  }

  public async updateCartsInfoInDb(updateCartsDetails, userDocRef) {
    const returnFailureObj = {
      status: StatusCode.FAILURE,
    };
    try {
      this.logger.info('start:updateCartsInfoInDb');
      if ((await userDocRef.get()).exists) {
        const str = updateCartsDetails.cartInUse;
        const arr = str.split('/');
        const cartInUse = arr[arr.length - 1];
        const usersCartsCollection = await userDocRef
          .collection(this.FIRESTORE_SUB_COLLECTION_NAME)
          .doc(cartInUse);
        delete updateCartsDetails.cartInUse;
        await this.firestoreBatchService.batchSet(
          usersCartsCollection,
          JSON.parse(JSON.stringify({ ...updateCartsDetails })),
          {
            merge: true,
          },
        );
        await this.firestoreBatchService.batchCommit();
        return {
          status: StatusCode.SUCCESS,
        };
      }
      return returnFailureObj;
    } catch (error) {
      this.commonService.logException(
        'method updateCartsInfoInDb error',
        error,
      );
      return returnFailureObj;
    }
  }

  /**
   * @param {productItems} array - Array of productItem objects
   * @return {object}
   * @throws {Error} Will throw an error if something goes wrong
   */

  public getReceiptMethodPattern(
    productItems: ProductItem[],
  ): ReceiptMethodPatternResponse {
    const isValid = this.IsValidReceiptMethodPatternData(productItems);
    if (!isValid) {
      return {
        status: StatusCode.FAILURE,
      };
    }
    // Get all checkout targetData
    const checkoutTargetTrueData = productItems.filter(
      (productItem) => productItem.isCheckoutTarget === true,
    );
    let receiptMethodPattern;

    if (checkoutTargetTrueData.length > 0) {
      // Get all delivery targetData
      const deliveryProductItems = checkoutTargetTrueData.filter(
        (productItem) =>
          productItem.receivingMethod ===
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS,
      );
      this.logger.info(
        `deliveryProductItems length ${deliveryProductItems.length}`,
      );

      // Get all store pickup targetData
      const storePickupProductItems = checkoutTargetTrueData.filter(
        (productItem) =>
          productItem.receivingMethod === ReceivingMethod.PICKUP_AT_STORE,
      );

      this.logger.info(
        `storePickupProductItems length ${storePickupProductItems.length}`,
      );

      // both is present then set receiptMethodPattern =3
      if (
        deliveryProductItems.length > 0 &&
        storePickupProductItems.length > 0
      ) {
        receiptMethodPattern = ReceiptMethod.BOTH;
      } else if (deliveryProductItems.length > 0) {
        receiptMethodPattern =
          ReceiptMethod.DELIVERY_TO_DESIGNATED_ADDRESS_ONLY;
      } else if (storePickupProductItems.length > 0) {
        receiptMethodPattern = ReceiptMethod.PICKUP_AT_STORE_ONLY;
      }
    } else {
      // checkout target is 0 then = 9
      receiptMethodPattern = ReceiptMethod.NOT_APPLICABLE;
    }
    return {
      status: StatusCode.SUCCESS,
      receiptMethodPattern,
    };
  }

  public IsValidReceiptMethodPatternData(productItems) {
    if (productItems === null) {
      this.logger.error(`productItems is null`);
      return false;
    }
    if (productItems.length <= 0) {
      this.logger.error(`productItems is empty`);
      return false;
    }

    const receiptMethodError = productItems.filter(
      (productItem) =>
        !Object.values(ReceivingMethod).includes(
          productItem.receivingMethod as ReceivingMethod,
        ),
    );
    if (receiptMethodError.length > 0) {
      this.logger.error(`Not valid ReceivingMethod`);
      return false;
    }
    return true;
  }

  /* @param {cartInUse} string - cartInUse information e.g. /users/{userId}/carts/{cartId} or /anonymousUsers/{userId}/carts/{cartId}
   * @return {Promise}
   *
   * @throws {Error} Will throw an error if something goes wrong
   */

  public async getCartsFromDb(cartInUse): Promise<GetCartsFromDb> {
    const returnFailureObj = {
      status: StatusCode.FAILURE,
      cartData: null,
    };
    if (!(cartInUse && cartInUse?.length)) {
      return returnFailureObj;
    }
    try {
      this.logger.info('start: getCartsFromDb');
      const cartInUseData = this.getCartInUseDetailedInfo(cartInUse);
      this.logger.info('cartId');
      this.logger.info(cartInUseData.cartId);
      const userDocRef = await this.getUserDocRef(
        cartInUseData.collectionName,
        cartInUseData.userId,
      );
      if ((await userDocRef.get()).exists) {
        this.logger.info(
          'getCartsFromDb: user id exists in users/annonymousers collection',
        );
        const cartObj = await this.getCartInformationObj(
          userDocRef,
          cartInUseData.cartId,
        );
        return {
          status: StatusCode.SUCCESS,
          cartData: cartObj,
        };
      }
      this.logger.info('getCartsFromDb: userDocRef doesnt exists');
      return returnFailureObj;
    } catch (error) {
      this.commonService.logException('method getCartsFromDb error', error);
    }
  }

  public getCartInUseDetailedInfo(cartInUse) {
    try {
      this.logger.info('start : getCartInUseDetailedInfo');

      const arr = cartInUse.split('/');
      const cartId = arr[arr.length - 1];
      const userId = arr[arr.length - 3];
      const collectionName = arr[arr.length - 4];
      const cartInUseDetailedInfo = {
        cartId,
        userId,
        collectionName,
      };
      return cartInUseDetailedInfo;
    } catch (error) {
      this.commonService.logException(
        'method getCartInUseDetailedInfo error',
        error,
      );
      throw new Error('Failed to access getCartInUseDetailedInfo');
    }
  }

  public async getCartInformationObj(userDocRef, cartId) {
    try {
      this.logger.info('start : getCartInformationObj');
      const usersCartsCollection = await userDocRef
        .collection(this.FIRESTORE_SUB_COLLECTION_NAME)
        .doc(cartId);
      if ((await usersCartsCollection.get()).exists) {
        this.logger.info('usersCartsCollection : exists');
        const userCartsData = (await usersCartsCollection.get()).data();
        if (userCartsData) {
          this.logger.debug(JSON.stringify(userCartsData));
          return userCartsData;
        }
      }
    } catch (error) {
      this.commonService.logException(
        'method getCartInformationObj error',
        error,
      );
      throw new Error('Failed to access getCartInformationObj');
    }
  }

  /**
   * @param {templateIds} string - array of templateIds
   * @return {object}
   */
  public getEcTemplate(templateIds: Array<string>): GetEcTemplateResponse {
    this.logger.info('start: getEcTemplate');
    try {
      const EcRecord: GetEcTemplateRecords = EcTemplateRecordData;
      if (templateIds.length === 0) {
        this.logger.info(`templateIds are not passed it is null or empty`);
        return {
          status: StatusCode.FAILURE,
          informations: null,
        };
      } else {
        const indexOfNonId = templateIds.findIndex(
          (result) => !EcRecord.map((res) => res.ecTemplateId).includes(result),
        );
        if (indexOfNonId !== -1) {
          this.logger.info(
            `The id : ${templateIds[indexOfNonId]} which you passed does not exist`,
          );
          return {
            status: StatusCode.FAILURE,
            informations: null,
          };
        }
        const templateRecordInformation = EcRecord.filter((result) =>
          templateIds.includes(result.ecTemplateId),
        );
        this.logger.info('end: getEcTemplate');
        return {
          status: StatusCode.SUCCESS,
          informations: templateRecordInformation,
        };
      }
    } catch (e: any) {
      this.commonService.logException(
        `Getting error while trying to get EC template master record data of corresponding templateId's`,
        `${e.message}`,
      );
      return {
        status: StatusCode.FAILURE,
        informations: null,
      };
    }
  }
}
