/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-destructuring */
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { ConfigService } from '@nestjs/config';
import {
  ReceiptMethod,
  ReceivingMethod,
  StoreCodes,
} from '@fera-next-gen/types';
import { of } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AmazonPayClient } from '@amazonpay/amazon-pay-api-sdk-nodejs';
import { OrderService } from './order.service';
import {
  addressBookData,
  bffProductData,
  bffStoreData,
  bffProductItem,
  memberData,
  myStoresData,
  getCartData,
  productItems,
  products,
  storeInfo,
  userInfo,
  checkNonDeliveryData,
  cartInUse,
  updateProductItems,
  shippingAddress,
} from './BFF_data/data';
import { StatusCode } from './constants/status-code';
import {
  GetEcTemplateResponse,
  InvalidWebBackOrderFlagValue,
  ProductItem,
} from './interfaces/orderInterfaces.interface';

import { OrderModule } from './order.module';

process.env.APP_ENV = 'local';
const logger: LoggingService = new LoggingService();
const commonService: CommonService = new CommonService(logger);
let firestoreBatchService: FirestoreBatchService;
const httpService: HttpService = new HttpService();
const env: ConfigService = new ConfigService();
const service: OrderService = new OrderService(
  logger,
  commonService,
  firestoreBatchService,
  httpService,
  env,
);

describe('OrderService', () => {
  let getInvalidWebBackOrderFlagValueResult: InvalidWebBackOrderFlagValue;
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  process.env.UNDELIVERABLE_CHECK_API = 'UNDELIVERABLE_CHECK_API';
  describe('getInvalidWebBackOrderFlagValue should be return error true', () => {
    it('onlineSalesCategory is null and  supportBackOrder is null', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(null, null, null, null, null);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(0);
    });

    it('onlineSalesCategory is null and  supportBackOrder is not null', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(null, null, null, null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(0);
    });

    it('onlineSalesCategory is not null and  supportBackOrder is null', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(null, '2', null, null, null);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(0);
    });
  });
  // InvalidWebBackOrderFlag
  // onlineSalesCategory
  // customizedProductCategory
  // dropShippingCategory
  // supportBackOrder
  describe('getInvalidWebBackOrderFlagValue should be return error false', () => {
    it('and invalidWebBackOrderFlagForStorePickup = false and invalidWebBackOrderFlagForDesignatedDelivery = false when InvalidWebBackOrderFlag = null , onlineSalesCategory!=2 customizedProductCategory = null, dropShippingCategory=null, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(null, '1', null, null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(false);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(false);
    });

    it('and invalidWebBackOrderFlagForStorePickup = true and invalidWebBackOrderFlagForDesignatedDelivery = true when  InvalidWebBackOrderFlag = true , onlineSalesCategory!=2 customizedProductCategory = null, dropShippingCategory=null, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(true, '1', null, null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(true);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(true);
    });

    it('and invalidWebBackOrderFlagForStorePickup = false and invalidWebBackOrderFlagForDesignatedDelivery = false when InvalidWebBackOrderFlag = false , onlineSalesCategory!=2 customizedProductCategory = null, dropShippingCategory=null, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(false, '1', null, null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(false);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(false);
    });

    it('and invalidWebBackOrderFlagForStorePickup = false and invalidWebBackOrderFlagForDesignatedDelivery = true when  InvalidWebBackOrderFlag = false , onlineSalesCategory=2 customizedProductCategory = null, dropShippingCategory=null, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(false, '2', null, null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(false);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(true);
    });

    it('and invalidWebBackOrderFlagForStorePickup = true and invalidWebBackOrderFlagForDesignatedDelivery = true when InvalidWebBackOrderFlag = false , onlineSalesCategory!=2 customizedProductCategory = 1, dropShippingCategory=null, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(false, '1', '1', null, true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(true);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(true);
    });

    it('and invalidWebBackOrderFlagForStorePickup = true and invalidWebBackOrderFlagForDesignatedDelivery = true when InvalidWebBackOrderFlag = false , onlineSalesCategory!=2 customizedProductCategory = null, dropShippingCategory=1, supportBackOrder=true, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(false, '1', null, '1', true);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(true);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(true);
    });

    it('and invalidWebBackOrderFlagForStorePickup = true and invalidWebBackOrderFlagForDesignatedDelivery = false when InvalidWebBackOrderFlag = false , onlineSalesCategory!=2 customizedProductCategory = null, dropShippingCategory=null, supportBackOrder=false, ', () => {
      getInvalidWebBackOrderFlagValueResult =
        service.getInvalidWebBackOrderFlagValue(false, '1', null, null, false);
      expect(getInvalidWebBackOrderFlagValueResult.status).toBe(1);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForStorePickup,
      ).toBe(true);
      expect(
        getInvalidWebBackOrderFlagValueResult.invalidWebBackOrderFlagForDesignatedDelivery,
      ).toBe(false);
    });
  });

  // productIds
  // storeCodes
  describe('getProduct common service', () => {
    it('should return product acquisition api data', () => {
      const result = service.getProduct(
        ['4549509646945', '4549509646952'],
        ['859'],
      );
      const resultObj = {
        status: 1,
        data: bffProductData,
      };
      expect(result).toEqual(resultObj);
    });
    it('should throw an error if productIds are null', () => {
      const result = service.getProduct(null, ['859']);
      const errorObj = {
        status: 0,
        data: null,
      };
      expect(result).toEqual(errorObj);
    });
    it('should throw an error if storeCodes are null', () => {
      const result = service.getProduct(['123451', '124456'], null);
      const errorObj = {
        status: 0,
        data: null,
      };
      expect(result).toEqual(errorObj);
    });
  });

  describe('getStore common service', () => {
    it('should return store acquisition api information', () => {
      const result = service.getStore(['760']);
      const resultObj = {
        data: [bffStoreData],
        status: 1,
      };
      expect(result).toEqual(resultObj);
    });
    it('should throw an error if storecode are null', () => {
      const result = service.getStore(null);
      const errorObj = {
        data: null,
        status: 0,
      };
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });
  });

  describe('getMember common service', () => {
    it('should return data when valid user id is passed and all apis return data with code 200', () => {
      const result = service.getMember('12345');
      const resultObj = {
        status: 1,
        member: memberData,
        addressBook: addressBookData,
        availablePoints: 95,
        myStores: myStoresData,
      };
      expect(result).toEqual(resultObj);
    });
    it('should return status as 0 when userId is null', () => {
      const result = service.getMember(null);
      const errorObj = {
        status: 0,
        member: null,
        addressBook: null,
        availablePoints: null,
        myStores: null,
      };
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });
  });

  describe('getIndividualShippingFee', () => {
    it('returns correct data', () => {
      const result = service.getIndividualShippingFee('1', '3', 4, 5);
      expect(result.status).toBe(1);
    });
    it('throw error if any input value is empty or null', () => {
      const result = service.getIndividualShippingFee('', '3', 4, 5);
      expect(result.status).toBe(0);
    });
    it('should return 0 shippingCost when receivingMethod is "2"', () => {
      const result = service.getIndividualShippingFee('2', '3', 4, 5);
      expect(result.individualShippingCost).toBe(0);
    });
    it('should return multiplied value shippingCost when receiving method is "1" and Shipping fee classification is 3 or 5', () => {
      const result = service.getIndividualShippingFee('1', '5', 4, 5);
      expect(result.subtotalIndividualShippingCost).toBe(20);
    });
    it('should return 0 shippingCost when receiving method is "1" and Shipping fee classification other than 3 or 5', () => {
      const result = service.getIndividualShippingFee('1', '1', 4, 5);
      expect(result.individualShippingCost).toBe(0);
    });
  });

  describe('should be check Inventory for products in cart', () => {
    let productItem;
    const setProductItems = [];
    beforeEach(async () => {
      productItem = getCartData.productItems[0];
    });
    it('If customizedProductCategory belongs to MadeToOrderCategory means 1 or 4 or 5 or 9 then Not require an inventory check', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '1';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = true;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 1, quantity>quantityAvailable invalidWebBackOrderFlagForDesignatedDelivery = true or requestForWebBackOrder = false then  Not available for order', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = true;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = false;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 1, quantity>quantityAvailable invalidWebBackOrderFlagForDesignatedDelivery = false or requestForWebBackOrder = true then  available for order', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
      expect(result.notifications[0].errorCode).toBe(
        'carts-shipping-notification-001',
      );
      expect(result.notifications[0].category).toBe('shipping');
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 1, quantity>quantityAvailable , invalidWebBackOrderFlagForDesignatedDelivery = false or requestForWebBackOrder = false then Not available for order', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = false;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 1, quantity>quantityAvailable , invalidWebBackOrderFlagForDesignatedDelivery = true and requestForWebBackOrder = true then not available for order', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = true;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });
    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 1, quantity=quantityAvailable , invalidWebBackOrderFlagForDesignatedDelivery = false or requestForWebBackOrder = true then available for order', async () => {
      productItem.receivingMethod = '1';
      productItem.quantity = 10;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 10;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 2, quantity>quantityAvailable invalidWebBackOrderFlagForStorePickup = true or requestForWebBackOrder = false then not available for order', async () => {
      productItem.receivingMethod = '2';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = true;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = false;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 2, quantity>quantityAvailable invalidWebBackOrderFlagForStorePickup = false or requestForWebBackOrder = true then available for order', async () => {
      productItem.receivingMethod = '2';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = true;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
      expect(result.notifications[0].errorCode).toBe(
        'carts-pickup-notification-001',
      );
      expect(result.notifications[0].category).toBe('store');
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 2, quantity>quantityAvailable invalidWebBackOrderFlagForStorePickup = false or requestForWebBackOrder = false then not available for order', async () => {
      productItem.receivingMethod = '2';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = false;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 2, quantity>quantityAvailable invalidWebBackOrderFlagForStorePickup = true and requestForWebBackOrder = true then not available for order', async () => {
      productItem.receivingMethod = '2';
      productItem.quantity = 100;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = true;
      productItem.product.inventories[0].quantityAvailable = 20;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-004');
      expect(result.errors[0].category).toBe('cart');
      expect(result.notifications.length).toEqual(0);
    });

    it('If customizedProductCategory is other than 1,4,5,9 and receivingMethod = 2, quantity=quantityAvailable , invalidWebBackOrderFlagForStorePickup = false & requestForWebBackOrder = true then available for order', async () => {
      productItem.receivingMethod = '2';
      productItem.quantity = 10;
      productItem.product.customizedProductCategory = '2';
      productItem.invalidWebBackOrderFlagForDesignatedDelivery = false;
      productItem.invalidWebBackOrderFlagForStorePickup = false;
      productItem.product.inventories[0].quantityAvailable = 10;
      const requestForWebBackOrder = true;

      setProductItems.push(productItem);
      const result: any = service.checkInventory(
        setProductItems,
        requestForWebBackOrder,
      );
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
      expect(result.notifications.length).toEqual(0);
    });
  });

  describe('canBePurchased common service', () => {
    it('should return status as 0 if productItmes are null', async () => {
      const productItem = { productItems: [], supportPickup: false };
      const result = await service.canBePurchased(productItem);
      const resultObj = {
        status: 0,
      };
      expect(result).toEqual(resultObj);
    });
    it('should return status as 0 if productItmes array are present but supportPickup not present or null or empty', async () => {
      const productItem = { productItems };
      const result = await service.canBePurchased(productItem);
      const resultObj = {
        status: 0,
      };
      expect(result).toEqual(resultObj);
    });
    it('should return status as 1 and error if productItmes product onlineFlagEc is false or onlineStartTimeEc greater than processDateTime or onlineStartTimeEc less than processDateTime', async () => {
      const productItem = { productItems, supportPickup: false };
      const result = await service.canBePurchased(productItem);
      expect(result.status).toBe(1);
    });
  });

  describe('renewProductItems', () => {
    it('should return status as 1 and productItems array when all the parameters are valid', async () => {
      const result = await service.renewProductItems(
        productItems,
        products,
        true,
        storeInfo,
      );
      expect(result.status).toBe(1);
    });
    it('should return status as 0 and productItems as null if productItems array is empty or null', async () => {
      const result = await service.renewProductItems(
        [],
        products,
        true,
        storeInfo,
      );
      expect(result.status).toBe(0);
      expect(result.productItems).toBe(null);
    });
    it('should return status as 0 and productItems as null if products array is empty or null', async () => {
      const result = await service.renewProductItems(
        productItems,
        [],
        true,
        storeInfo,
      );
      expect(result.status).toBe(0);
      expect(result.productItems).toBe(null);
    });
    it('should return status as 0 and productItems as null if isMember is null', async () => {
      const result = await service.renewProductItems(
        productItems,
        products,
        null,
        storeInfo,
      );
      expect(result.status).toBe(0);
      expect(result.productItems).toBe(null);
    });
    it('should return status as 0 and productItems as null if storeInfo object is empty or null', async () => {
      const result = await service.renewProductItems(
        productItems,
        products,
        true,
        {},
      );
      expect(result.status).toBe(0);
      expect(result.productItems).toBe(null);
    });
    it('should set campaign points and subtotalCampaignPoints to 0 if isMember is false', async () => {
      const result = await service.renewProductItems(
        productItems,
        products,
        false,
        storeInfo,
      );
      expect(result.status).toBe(1);
      expect(result.productItems[0].campaignPoints).toBe(0);
      expect(result.productItems[0].subtotalCampaignPoints).toBe(0);
      expect(result.productItems[1].campaignPoints).toBe(0);
      expect(result.productItems[1].subtotalCampaignPoints).toBe(0);
    });
  });
  describe('getUser common service', () => {
    let servicegetUser: OrderService;
    const mockFirestoreBatchService = {
      findCollection: jest.fn(),
    };
    const mockCommonService = {
      logException: jest.fn(),
    };
    const mockLoggingService = {
      info: jest.fn(),
      debug: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          OrderService,
          ConfigService,
          {
            provide: FirestoreBatchService,
            useValue: mockFirestoreBatchService,
          },
          {
            provide: CommonService,
            useValue: mockCommonService,
          },
          {
            provide: LoggingService,
            useValue: mockLoggingService,
          },
        ],
      }).compile();

      servicegetUser = module.get<OrderService>(OrderService);
    });

    it('should return data when valid member user id is passed', async () => {
      const userInfoMockData = {
        cartInUse:
          'users/07P1He8a0Ze4OlTCpWf3D3M469P3/carts/pfgWfh6Vqooscy9SNRYb',
        updatedAt: 'Dec 19, 2023, 9:18:33.186 AM',
        createdBy: 'sys-user-api',
        rank: 'E',
        storeCodeInUse: '760',
      };
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => ({
              exists: true,
              data: jest.fn(() => userInfoMockData),
            })),
            collection: jest.fn(() => ({
              doc: jest.fn(() => ({
                get: jest.fn(() => ({
                  exists: true,
                })),
              })),
            })),
          })),
        }));

      const result = await servicegetUser.getUser('VjZDpgEx5qx2sryvniQw');
      const resultObj = {
        status: StatusCode.SUCCESS,
        isMember: true,
        userData: {},
      };
      expect(result.status).toBe(1);
      expect(result.isMember).toBe(true);
    });

    it('should return status as 0 when userId is null', async () => {
      const errorObj = {
        status: StatusCode.FAILURE,
        isMember: null,
        userData: null,
      };
      const result = await service.getUser(null);
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });
    it('should return status as 0 when userId is empty', async () => {
      const errorObj = {
        status: StatusCode.FAILURE,
        isMember: null,
        userData: null,
      };
      const result = await service.getUser('');
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });
  });
  describe('select Product Price', () => {
    it('should return correct data', () => {
      const result = service.selectProductPrice(bffProductItem, '0896');
      expect(result.status).toEqual(StatusCode.SUCCESS);
    });
    it('unitPriceForDelivery should be null when there is no storeCode"888" inside prices object', () => {
      bffProductItem.product.prices = [
        {
          productId: '4549509646945',
          storeCode: '859',
          membershipRank: '4',
          priceIncludingTax: 8980,
          salePriceIncludingTax: 7980,
        },
        {
          productId: '4549509646945',
          storeCode: '889',
          membershipRank: '4',
          priceIncludingTax: 6980,
          salePriceIncludingTax: 5980,
        },
      ];
      const result = service.selectProductPrice(bffProductItem, '0567');
      expect(result.unitPriceForDelivery).toEqual(null);
    });
    it('should return status-0 when input arguments were null or empty', () => {
      const result = service.selectProductPrice(null, '0567');
      expect(result.status).toEqual(StatusCode.FAILURE);
    });
    it('should return status-0 when recieving method is null or empty', () => {
      bffProductItem.receivingMethod = '';
      const result = service.selectProductPrice(bffProductItem, '0567');
      expect(result.status).toEqual(StatusCode.FAILURE);
    });
    describe('getStorePrice', () => {
      const mockPricesdata = [
        {
          productId: '4549509646945',
          storeCode: '859',
          membershipRank: '4',
          priceIncludingTax: 8980,
          salePriceIncludingTax: 7980,
        },
        {
          productId: '4549509646945',
          storeCode: '888',
          membershipRank: '4',
          priceIncludingTax: 6980,
          salePriceIncludingTax: 5980,
        },
      ];
      it('should return lowest price when matching store code is found', () => {
        const result = service.getStorePrice(
          mockPricesdata,
          StoreCodes.EC_STORECODE,
        );
        expect(result).toBe(5980);
      });
      it('should return Null when matching storeCode is not found', () => {
        const result = service.getStorePrice(mockPricesdata, '889');
        expect(result).toBe(null);
      });
    });
  });

  describe('getShippingCost', () => {
    const data = { basicFee: 1000, regionalFee: 1500, shortToDiscount: 5000 };
    const response: any = {
      data,
      status: 200,
      statusText: 'OK',
      headers: { client_Id: '123', client_secret: 'cvn' },
      config: {},
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    it('should return correct data', async () => {
      const result = await service.getShippingCost(productItems, userInfo);
      expect(result.status).toEqual(StatusCode.SUCCESS);
      expect(result.result).toEqual(data);
    });
    it('should return failure status when there are no product items in arguments', async () => {
      const mockProductItems = [];
      const result = await service.getShippingCost(mockProductItems, userInfo);
      expect(result.status).toEqual(StatusCode.FAILURE);
    });
    it('should return failure status when isMember-true and billPayment-null', async () => {
      const mockUserInfo = {
        isMember: true,
        billPayment: null,
        zipCode: '3670030',
        prefecture: '埼玉県',
      };
      const result = await service.getShippingCost(productItems, mockUserInfo);
      expect(result.status).toEqual(StatusCode.FAILURE);
    });
    it('should return failure status when isMemmber-false and billPayment-true', async () => {
      const mockUserInfo = {
        isMember: false,
        billPayment: true,
        zipCode: '3670030',
        prefecture: '埼玉県',
      };
      const result = await service.getShippingCost(productItems, mockUserInfo);
      expect(result.status).toEqual(StatusCode.FAILURE);
    });
    it('should return status success if there are no targetProductItems with receiving method "1"', async () => {
      const mockProductItems = productItems.map((productItem) => {
        const item = { ...productItem };
        item.receivingMethod = '2';
        return item;
      });
      const mockResultData = {
        basicFee: 0,
        regionalFee: 0,
        shortToDiscount: 0,
      };
      const result = await service.getShippingCost(mockProductItems, userInfo);
      expect(result.status).toEqual(StatusCode.SUCCESS);
      expect(result.result).toEqual(mockResultData);
    });
    describe('getShippingFeeApiData', () => {
      it('should return correct data', async () => {
        const result = await service.getShippingFeeApiData(
          productItems,
          userInfo,
        );
        expect(result.status).toBe(HttpStatus.OK);
        expect(result.result).toEqual(data);
      });
    });
  });
  describe('createCartsToDb common service', () => {
    let serviceCreateCarts: OrderService;
    const mockFirestoreBatchService = {
      findCollection: jest.fn(),
    };
    const mockCommonService = {
      logException: jest.fn(),
      createFirestoreSystemName: jest.fn(),
    };

    const mockLoggingService = {
      info: jest.fn(),
      debug: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          OrderService,
          ConfigService,
          {
            provide: FirestoreBatchService,
            useValue: mockFirestoreBatchService,
          },
          {
            provide: CommonService,
            useValue: mockCommonService,
          },
          {
            provide: LoggingService,
            useValue: mockLoggingService,
          },
        ],
      }).compile();
      serviceCreateCarts = module.get<OrderService>(OrderService);
    });

    it('should return status as 0 when userId is null', async () => {
      const errorObj = {
        status: StatusCode.FAILURE,

        cartId: null,
        cartInUse: null,
      };
      const result = await service.createCartsToDb(null, null, {
        originalUrl: 'abc',
        method: 'GET',
      });
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });

    it('should create carts for correct arguments', async () => {
      jest
        .spyOn(commonService, 'createFirestoreSystemName')
        .mockReturnValue('dummyOperatorName');
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => ({
              exists: true,
            })),
            update: jest.fn(() => {}),

            collection: jest.fn(() => ({
              doc: jest.fn(() => ({
                set: jest.fn(() => ({})),
              })),
            })),
          })),
        }));

      const result = await serviceCreateCarts.createCartsToDb(
        'ENyjlo9AoCI0fauyVqXh',
        true,
        { originalUrl: 'abc', method: 'POST' },
      );

      expect(result.status).toBe(1);
    });
  });

  describe('checkNonDelivery common service', () => {
    it('should return status as 1 and productItems array when all the parameters are valid', async () => {
      const data = {
        canShip: true,
        items: [
          {
            productCode: '4549509524318',
            canShip: true,
          },
          {
            productCode: '4549509524317',
            canShip: true,
          },
        ],
      };
      const response: any = {
        data,
        status: 200,
        statusText: 'OK',
        headers: { client_Id: '123', client_secret: 'cvn' },
        config: {},
      };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
      const result = await service.checkNonDelivery(
        checkNonDeliveryData.productItems,
        checkNonDeliveryData.deliveryInfo,
      );
      expect(result.status).toBe(1);
    });
    it('should return status as 1 and error information and productItems array error information when getcheckdeliveryApi return canShip false', async () => {
      const data = {
        canShip: false,
        items: [
          {
            productCode: '4549509524318',
            canShip: false,
            reason: 'NOT_SHIP_AREAS_HOKKAIDO_OKINAWA_REMOTEISLAND',
          },
          {
            productCode: '4549509524317',
            canShip: false,
            reason: 'NOT_SHIP_AREAS_SEINO_TRANSPORTATION',
          },
        ],
      };
      const response: any = {
        data,
        status: 200,
        statusText: 'OK',
        headers: { client_Id: '123', client_secret: 'cvn' },
        config: {},
      };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
      const result = await service.checkNonDelivery(
        checkNonDeliveryData.productItems,
        checkNonDeliveryData.deliveryInfo,
      );
      expect(result.status).toBe(1);
    });
    it('should return status as 0 when productItems array null', async () => {
      checkNonDeliveryData.productItems = [];
      const result = await service.checkNonDelivery(
        checkNonDeliveryData.productItems,
        checkNonDeliveryData.deliveryInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when productItems array present but deliveryInfo object zipcode empty or null', async () => {
      checkNonDeliveryData.deliveryInfo.zipCode = null;
      const result = await service.checkNonDelivery(
        checkNonDeliveryData.productItems,
        checkNonDeliveryData.deliveryInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when productItems array present but deliveryInfo not present', async () => {
      delete checkNonDeliveryData.deliveryInfo;
      const result = await service.checkNonDelivery(
        checkNonDeliveryData.productItems,
        checkNonDeliveryData.deliveryInfo,
      );
      expect(result.status).toBe(0);
    });
  });

  describe('setAmazonPayButtonConfig common process', () => {
    it('should return status as 1 when amazonPayTotalAmount is a number and placement is a valid string', async () => {
      AmazonPayClient.prototype.generateButtonSignature = jest
        .fn()
        .mockResolvedValue('mockedSignature');
      const result = await service.setAmazonPayButtonConfig(500, 'Cart');
      expect(result.status).toBe(1);
    });
    it('should return status as 0 when amazonPayTotalAmount is null and placement is a valid string', async () => {
      const result = await service.setAmazonPayButtonConfig(null, 'Cart');
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when amazonPayTotalAmount is a number and placement is a invalid string', async () => {
      const result = await service.setAmazonPayButtonConfig(500, 'Carts');
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when amazonPayTotalAmount is a number and placement is null or empty', async () => {
      const result = await service.setAmazonPayButtonConfig(500, null);
      expect(result.status).toBe(0);
    });
  });

  describe('updateCartsToDb common process', () => {
    let serviceCreateCarts: OrderService;
    const mockFirestoreBatchService = {
      findCollection: jest.fn(),
      batchCommit: jest.fn(),
      batchSet: jest.fn(),
    };
    const mockCommonService = {
      logException: jest.fn(),
      createFirestoreSystemName: jest.fn(),
    };
    const mockLoggingService = {
      info: jest.fn(),
      debug: jest.fn(),
    };
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          OrderService,
          ConfigService,
          {
            provide: FirestoreBatchService,
            useValue: mockFirestoreBatchService,
          },
          {
            provide: CommonService,
            useValue: mockCommonService,
          },
          {
            provide: LoggingService,
            useValue: mockLoggingService,
          },
        ],
      }).compile();
      serviceCreateCarts = module.get<OrderService>(OrderService);
    });
    jest
      .spyOn(mockFirestoreBatchService, 'findCollection')
      .mockImplementation(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => ({
            exists: true,
          })),
          collection: jest.fn(() => ({
            doc: jest.fn(() => ({
              batchSet: jest.fn(() => ({
                batchCommit: jest.fn(),
              })),
            })),
          })),
        })),
      }));
    it('should return status as 1 when productItems are updated successfully', async () => {
      const result = await serviceCreateCarts.updateCartsToDb(
        cartInUse,
        updateProductItems,
        '0760',
        shippingAddress,
      );
      expect(result.status).toBe(1);
    });
    it('should return status as 0 when productItems is null or undefined or an empty array', async () => {
      const result = await service.updateCartsToDb(
        cartInUse,
        [],
        '0760',
        shippingAddress,
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when any field in productItem is empty', async () => {
      const productItemsUpdateObj = [{ ...updateProductItems[0], itemId: '' }];
      const result = await service.updateCartsToDb(
        cartInUse,
        productItemsUpdateObj,
        '0760',
        shippingAddress,
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when shippingAddress is null or undefined or an empty object', async () => {
      const result = await service.updateCartsToDb(
        cartInUse,
        updateProductItems,
        '0760',
        null,
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when cartInUse is an empty string or null or undefined', async () => {
      const result = await service.updateCartsToDb(
        '',
        updateProductItems,
        '0760',
        shippingAddress,
      );
      expect(result.status).toBe(0);
    });
  });

  describe('getReceiptMethodPattern common service', () => {
    describe('getReceiptMethodPattern should be return status 0', () => {
      it('when Product Items is empty', () => {
        const getReceiptMethodPatternResult = service.getReceiptMethodPattern(
          [],
        );
        expect(getReceiptMethodPatternResult.status).toBe(StatusCode.FAILURE);
      });
    });
    describe('getReceiptMethodPattern should be return status is 1 and receipt method also when productItems Present ', () => {
      const productItemsData = [productItems[0], productItems[1]];
      // set all to delivery
      productItemsData[0].isCheckoutTarget = true;
      productItemsData[1].isCheckoutTarget = true;
      it('receiptMethodPattern should be 1 when all product Items are delivery to specific address ', () => {
        productItemsData[0].receivingMethod =
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS;
        productItemsData[1].receivingMethod =
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS;
        const getReceiptMethodPatternResult =
          service.getReceiptMethodPattern(productItemsData);
        expect(getReceiptMethodPatternResult.status).toBe(StatusCode.SUCCESS);
        expect(getReceiptMethodPatternResult.receiptMethodPattern).toBe(
          ReceiptMethod.DELIVERY_TO_DESIGNATED_ADDRESS_ONLY,
        );
      });
      it('receiptMethodPattern should be 2 when all product Items are store Pickup ', () => {
        productItemsData[0].receivingMethod = ReceivingMethod.PICKUP_AT_STORE;
        productItemsData[1].receivingMethod = ReceivingMethod.PICKUP_AT_STORE;
        const getReceiptMethodPatternResult =
          service.getReceiptMethodPattern(productItemsData);
        expect(getReceiptMethodPatternResult.status).toBe(StatusCode.SUCCESS);
        expect(getReceiptMethodPatternResult.receiptMethodPattern).toBe(
          ReceiptMethod.PICKUP_AT_STORE_ONLY,
        );
      });

      it('receiptMethodPattern should be 3 when all product Items are store Pickup and delivery ', () => {
        productItemsData[0].isCheckoutTarget = true;
        productItemsData[1].isCheckoutTarget = true;
        productItemsData[0].receivingMethod =
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS;
        productItemsData[1].receivingMethod = ReceivingMethod.PICKUP_AT_STORE;
        console.log('productItemsData[0]', productItemsData[0].receivingMethod);
        console.log('productItemsData[1]', productItemsData[1].receivingMethod);
        const getReceiptMethodPatternResult =
          service.getReceiptMethodPattern(productItemsData);
        expect(getReceiptMethodPatternResult.status).toBe(StatusCode.SUCCESS);
        expect(getReceiptMethodPatternResult.receiptMethodPattern).toBe(
          ReceiptMethod.BOTH,
        );
      });

      it('should be 9 while checkout target false for all product Items ', () => {
        productItemsData[0].isCheckoutTarget = false;
        productItemsData[1].isCheckoutTarget = false;
        productItemsData[0].receivingMethod = ReceivingMethod.PICKUP_AT_STORE;
        productItemsData[1].receivingMethod =
          ReceivingMethod.DELIVERY_TO_DESIGNATED_ADDRESS;
        const getReceiptMethodPatternResult =
          service.getReceiptMethodPattern(productItemsData);
        expect(getReceiptMethodPatternResult.status).toBe(StatusCode.SUCCESS);
        expect(getReceiptMethodPatternResult.receiptMethodPattern).toBe(
          ReceiptMethod.NOT_APPLICABLE,
        );
      });
    });
  });

  describe('getCartsFromDb common service', () => {
    let servicGetCarts: OrderService;
    const mockFirestoreBatchService = {
      findCollection: jest.fn(),
    };
    const mockCommonService = {
      logException: jest.fn(),
      createFirestoreSystemName: jest.fn(),
    };

    const mockLoggingService = {
      info: jest.fn(),
      debug: jest.fn(),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          OrderService,
          ConfigService,
          {
            provide: FirestoreBatchService,
            useValue: mockFirestoreBatchService,
          },
          {
            provide: CommonService,
            useValue: mockCommonService,
          },
          {
            provide: LoggingService,
            useValue: mockLoggingService,
          },
        ],
      }).compile();
      servicGetCarts = module.get<OrderService>(OrderService);
    });

    it('should return status as 0 when userId is null', async () => {
      const errorObj = {
        status: StatusCode.FAILURE,
        cartData: null,
      };
      const result = await service.getCartsFromDb(null);
      expect(result.status).toBe(0);
      expect(result).toEqual(errorObj);
    });

    it('should get carts for correct cartInUse', async () => {
      const cartInfoMockData = {
        productItems: [],
        updatedAt: 'Dec 19, 2023, 9:18:33.186 AM',
        createdAt: 'Dec 19, 2023, 9:18:33.186 AM',
        userId: 'RzMlOcujJMZS2CmaBZzD',
        storeCode: '760',
        shippingAddress: '',
      };
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn(() => ({
            get: jest.fn(() => ({
              exists: true,
            })),
            collection: jest.fn(() => ({
              doc: jest.fn(() => ({
                get: jest.fn(() => ({
                  exists: true,
                  data: jest.fn(() => cartInfoMockData),
                })),
              })),
            })),
          })),
        }));

      const result = await servicGetCarts.getCartsFromDb(
        '/anonymousUsers/RzMlOcujJMZS2CmaBZzD/carts/XLoj5pb6ZxLOu34TstaO',
      );

      expect(result.status).toBe(1);
    });
  });

  describe('should be able to get EC template master record', () => {
    it(`If we pass template Ids as 2 and 3 then we get corresponding Ec template records for both id's`, async () => {
      const templateIds: any = ['2', '3'];
      const result: GetEcTemplateResponse = service.getEcTemplate(templateIds);
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.informations.map((res) => res.ecTemplateId)[0]).toEqual(
        '2',
      );
      expect(result.informations.map((res) => res.ecTemplateId)[1]).toEqual(
        '3',
      );
      expect(result.informations.map((res) => res.class1)[0]).toEqual(
        'Regular product',
      );
    });

    it(`If we pass template Ids as 2 and 100 then it will returns an error because template id = 100 not exist to get template master record`, async () => {
      const templateIds: any = ['2', '100'];
      const result: GetEcTemplateResponse = service.getEcTemplate(templateIds);
      expect(result.status).toBe(StatusCode.FAILURE);
      expect(result.informations).toEqual(null);
    });

    it(`If we pass empty template Ids then it will returns an error because template id is null not able to get template master record`, async () => {
      const templateIds: any = [];
      const result: GetEcTemplateResponse = service.getEcTemplate(templateIds);
      expect(result.status).toBe(StatusCode.FAILURE);
      expect(result.informations).toEqual(null);
    });
  });
});
