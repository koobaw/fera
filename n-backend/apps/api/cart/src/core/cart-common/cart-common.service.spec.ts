/* eslint-disable prefer-destructuring */
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { OrderService, ProductItem, StatusCode } from '@cainz-next-gen/order';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { CartCommonService } from './cart-common.service';
import {
  getCartData,
  userInfo,
  itemData,
  products,
  updateCartChangeData,
  selectedItems,
} from '../../data_json/data';
import { GlobalsModule } from '../../globals.module';
import { CartService } from '../cart/cart.service';
import { OrderSpecification } from '../interfaces/cart-productItem.interface';

describe('CartCommonService', () => {
  let service: CartCommonService;
  let orderService: OrderService;
  let firestoreBatchService: FirestoreBatchService;
  let httpService: any;
  let env: any;
  const logger: LoggingService = new LoggingService();
  const commonService: CommonService = new CommonService(logger);
  beforeEach(async () => {
    const OrderServiceData: OrderService = new OrderService(
      logger,
      commonService,
      firestoreBatchService,
      httpService,
      env,
    );
    const getStoreResult = await OrderServiceData.getStore(['760']);
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        CartCommonService,
        LoggingService,
        CommonService,
        {
          provide: OrderService,
          useValue: {
            getShippingCost: jest.fn().mockResolvedValue({
              status: StatusCode.SUCCESS,
              result: {
                basicFee: 100,
                regionalFee: 100,
                shortToDiscount: 100,
              },
            }),
            setInvalidWebBackOrderFlagValue: jest.fn().mockResolvedValue({
              status: 1,
              productItem: updateCartChangeData.productItems[0],
            }),
            setSelectProductPrice: jest.fn().mockResolvedValue({
              status: 1,
              productItem: updateCartChangeData.productItems[0],
            }),
            setIndividualShippingFee: jest.fn().mockResolvedValue({
              status: 1,
              productItem: updateCartChangeData.productItems[0],
            }),
            generateNewId: jest.fn().mockResolvedValue({
              autoId: 'APDuozUXNjj6umKKMWzJ',
            }),
            getStore: jest.fn(() => getStoreResult),
          },
        },
      ],
    }).compile();

    service = module.get<CartCommonService>(CartCommonService);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.checkMaximumAndMinimumAndStepQuantity).toBeDefined();
  });

  describe('calculateCartAmount', () => {
    let userInfoMockData;
    let productItemsMockData;
    beforeEach(() => {
      productItemsMockData = getCartData.productItems;
      userInfoMockData = userInfo;
    });
    it('should be defined', () => {
      expect(service.calculateCartAmount).toBeDefined();
    });
    describe('should be return status 1 when', () => {
      it('all argument is perfectly ', async () => {
        userInfoMockData.isMember = true;
        userInfoMockData.billPayment = true;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.SUCCESS);
      });
    });

    describe('should be return status 0 when below argument missing', () => {
      it('When isMember is null ', async () => {
        userInfoMockData.isMember = null;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.FAILURE);
      });

      it('When zipcode  is null ', async () => {
        userInfoMockData.zipCode = null;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.FAILURE);
      });

      it('When prefecture  is null ', async () => {
        userInfoMockData.prefecture = null;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.FAILURE);
      });

      it('When is member is true and billPayment is null ', async () => {
        userInfoMockData.billPayment = null;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.FAILURE);
      });

      it('When is any received method of product Items is  other then 1,2 ', async () => {
        productItemsMockData[0].receivingMethod = 3;
        const result = await service.calculateCartAmount(
          productItemsMockData,
          userInfoMockData,
        );
        expect(result.status).toBe(StatusCode.FAILURE);
      });
    });
  });

  describe('checkMaximumAndMinimumAndStepQuantity ', () => {
    describe('should be Status is 1 and errors when receiving method is 1 and', () => {
      let productItem;
      const setProudctItems = [];
      beforeEach(async () => {
        // eslint-disable-next-line prefer-destructuring
        productItem = getCartData.productItems[0];
        productItem.receivingMethod = '1';
      });

      it('Minimum order Qty> OrderQty', async () => {
        productItem.product.maxOrderQuantity = 500;
        productItem.product.minOrderQuantity = 2;
        productItem.quantity = 1;
        productItem.product.stepQuantity = 1;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });

      it('Maximum order Qty< OrderQty', async () => {
        productItem.product.maxOrderQuantity = 500;
        productItem.product.minOrderQuantity = 2;
        productItem.quantity = 501;
        productItem.receivingMethod = '1';
        productItem.product.stepQuantity = 1;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });

      it('orderQty % stepQty !=0', async () => {
        productItem.product.maxOrderQuantity = 500;
        productItem.product.minOrderQuantity = 10;
        productItem.quantity = 2;
        productItem.receivingMethod = '1';
        productItem.product.stepQuantity = 3;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('should be Status is 1 and errors when receiving method is 2 and', () => {
      let productItem;
      const setProudctItems = [];
      beforeEach(async () => {
        // eslint-disable-next-line prefer-destructuring
        productItem = getCartData.productItems[0];
        productItem.receivingMethod = '1';
      });

      it('Minimum order Qty> OrderQty', async () => {
        productItem.product.storeMaxOrderQuantity = 500;
        productItem.product.storeMinOrderQuantity = 2;
        productItem.quantity = 1;
        productItem.product.storeStepOrderQuantity = 1;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });

      it('Maximum order Qty< OrderQty', async () => {
        productItem.product.storeMaxOrderQuantity = 500;
        productItem.product.storeMinOrderQuantity = 2;
        productItem.quantity = 501;
        productItem.product.storeStepOrderQuantity = 1;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });

      it('orderQty % stepQty !=0', async () => {
        productItem.product.storeMaxOrderQuantity = 500;
        productItem.product.storeMinOrderQuantity = 10;
        productItem.quantity = 2;
        productItem.product.storeStepOrderQuantity = 3;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe('should be Status is 1 and errors is [] when ', () => {
      let productItem;
      const setProudctItems = [];
      beforeEach(async () => {
        // eslint-disable-next-line prefer-destructuring
        productItem = getCartData.productItems[0];
      });

      it('receiving method is 2', async () => {
        productItem.receivingMethod = '2';
        productItem.product.storeMaxOrderQuantity = 500;
        productItem.product.storeMinOrderQuantity = 2;
        productItem.quantity = 2;
        productItem.product.storeStepOrderQuantity = 2;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toEqual(0);
      });

      it('receivingMethod is 1', async () => {
        productItem.receivingMethod = '1';
        productItem.product.maxOrderQuantity = 500;
        productItem.product.minOrderQuantity = 2;
        productItem.quantity = 2;
        productItem.product.stepQuantity = 1;
        setProudctItems.push(productItem);
        const result =
          service.checkMaximumAndMinimumAndStepQuantity(setProudctItems);
        expect(result.status).toBe(1);
        expect(result.errors.length).toEqual(0);
      });
    });
  });

  describe('check simultaneous purchase possible or not', () => {
    it('canBePurchasedAtTheSameTime method should be defined', () => {
      expect(service.canBePurchasedAtTheSameTime).toBeDefined();
    });

    let productItem1;
    let productItem2;
    beforeEach(async () => {
      const cartService: CartService = new CartService(logger, commonService);
      const productItems = await cartService.getCart('111');
      productItem1 = productItems.productItems[0];
      productItem2 = productItems.productItems[1];
    });

    it('should be call canBePurchasedAtTheSameTime method and If dropShippingCategory = 1 and receivingMethod = 2 in all products eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If dropShippingCategory = 1 and receivingMethod = 2 in all products eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = '1';
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If dropShippingCategory = 1 and receivingMethod = 2 in one product and dropShippingCategory = 1 and receivingMethod = 1 and when checkoutTarget is false in other product eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = '1';
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = false;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If dropShippingCategory = 1 and receivingMethod = 2 in one product and dropShippingCategory = 1 and receivingMethod = 1 and checkoutTarget is true in other product not eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = '1';
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-001',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and  Normal product along with dropshipping product not eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[1].errors[0].category).toBe('detail 1');
      expect(result.productItems[1].errors[0].errorCode).toBe(
        'carts-line-error-001',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and  Dropshipping product be 3 and receiving method be 2  Product with trusco dropshipping product not eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = '3';
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[1].errors[0].category).toBe('detail 1');
      expect(result.productItems[1].errors[0].errorCode).toBe(
        'carts-line-error-001',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and Dropshipping product be 3 and receiving method be 2 Product with trusco dropshipping product not eligible for purchase.', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '2';
      productItem1.product.dropShippingCategory = '2';
      productItem1.product.customizedProductCategory = null;

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[1].errors[0].category).toBe('detail 1');
      expect(result.productItems[1].errors[0].errorCode).toBe(
        'carts-line-error-001',
      );
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If all products belongs to  customizedProductCategory = Rose seedlings', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '6';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other products are different but checkoutTarget is false', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = false;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other products are different but checkoutTarget is true', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-002',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other one is dropshipping product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-002',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other one is normal product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-002',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other one is mother day product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '7';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-002',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Rose seedlings and other one is father day product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '6';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '8';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-002',
      );
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If all products belongs to  customizedProductCategory = Mothers day', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '7';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Mothers day and other products are different but checkoutTarget is false', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = false;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Mothers day and other products are different but checkoutTarget is true', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-003',
      );
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Mothers day and other one is dropshipping product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-003',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Mothers day and other one is normal product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-003',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Mothers day and other one is fathers day product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '7';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '8';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-003',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If all products belongs to  customizedProductCategory = Fathers day', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '8';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '8';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Fathers day and other products are different but checkoutTarget is false', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '8';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = false;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors.length).toEqual(0);
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Fathers day and other products are different but checkoutTarget is true', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '8';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = '2';
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-004',
      );
    }, 10000);

    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Fathers day and other product is dropshipping product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '8';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '2';
      productItem2.product.dropShippingCategory = '1';
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-004',
      );
    }, 10000);
    it('should be call canBePurchasedAtTheSameTime method and If one product belongs to  customizedProductCategory = Fathers day and other is normal product', () => {
      productItem1.checkoutStatus = 'In-progress';
      productItem1.isCheckoutTarget = true;
      productItem1.receivingMethod = '1';
      productItem1.product.dropShippingCategory = null;
      productItem1.product.customizedProductCategory = '8';

      productItem2.checkoutStatus = 'In-progress';
      productItem2.isCheckoutTarget = true;
      productItem2.receivingMethod = '1';
      productItem2.product.dropShippingCategory = null;
      productItem2.product.customizedProductCategory = null;
      const setProudctItems = [];

      setProudctItems.push(productItem1);
      setProudctItems.push(productItem2);
      const result: any = service.canBePurchasedAtTheSameTime(setProudctItems);
      expect(result.status).toBe(1);
      expect(result.errors[0].errorCode).toBe('carts-data-error-001');
      expect(result.errors[0].category).toBe('cart');
      expect(result.productItems[0].errors[0].category).toBe('detail 1');
      expect(result.productItems[0].errors[0].errorCode).toBe(
        'carts-line-error-004',
      );
    }, 10000);
  });

  describe('needsItemCreation ', () => {
    let needsItemCreationResult;
    it('should be defined -> needsItemCreation', () => {
      expect(service).toBeDefined();
      expect(service.needsItemCreation).toBeDefined();
    });
    describe('should be Status is 0 when', () => {
      it('productId is null', () => {
        needsItemCreationResult = service.needsItemCreation(null, null, null);
        expect(needsItemCreationResult.status).toBe(StatusCode.FAILURE);
      });
    });

    describe('should be Status is 1 needsItemCreation is true and canBeAddedToCart is true when', () => {
      it('productId is not null and orderSpecification and productItems is null', () => {
        needsItemCreationResult = service.needsItemCreation(
          '4987167051921',
          null,
          null,
        );
        expect(needsItemCreationResult.status).toBe(StatusCode.SUCCESS);
        expect(needsItemCreationResult.needsItemCreation).toBe(true);
        expect(needsItemCreationResult.canBeAddedToCart).toBe(true);
      });

      it('productId is not null and orderSpecification is {} productItems is []', () => {
        const orderSpecification = {} as OrderSpecification; // This fails saying property XX is missing

        needsItemCreationResult = service.needsItemCreation(
          '4987167051921',
          orderSpecification,
          [],
        );
        expect(needsItemCreationResult.status).toBe(StatusCode.SUCCESS);
        expect(needsItemCreationResult.needsItemCreation).toBe(true);
        expect(needsItemCreationResult.canBeAddedToCart).toBe(true);
      });
      describe('should be Status is 1 needsItemCreation is true and canBeAddedToCart is true when', () => {
        it('productId is not null and orderSpecification is not present in productItems and productItems count less then maximumNumberOfCartsThatCanBeAdded', () => {
          const orderSpecification = {} as OrderSpecification; // This fails saying property XX is missing
          const productItems = [
            getCartData.productItems[0],
          ] as unknown as ProductItem[];
          needsItemCreationResult = service.needsItemCreation(
            '4987167051921',
            orderSpecification,
            productItems,
          );
          expect(needsItemCreationResult.status).toBe(StatusCode.SUCCESS);
          expect(needsItemCreationResult.needsItemCreation).toBe(true);
          expect(needsItemCreationResult.canBeAddedToCart).toBe(true);
        });
      });

      describe('should be Status is 1 needsItemCreation is false and canBeAddedToCart is true when', () => {
        it('productId is not null and orderSpecification is  present in productItems and productItems count less then maximumNumberOfCartsThatCanBeAdded', () => {
          const orderSpecification = {} as OrderSpecification; // This fails saying property XX is missing
          const productItems = [
            getCartData.productItems[0],
          ] as unknown as ProductItem[];
          productItems[0].productId = '4987167051921';
          productItems[0].orderSpecification = orderSpecification;

          needsItemCreationResult = service.needsItemCreation(
            '4987167051921',
            orderSpecification,
            productItems,
          );
          expect(needsItemCreationResult.status).toBe(StatusCode.SUCCESS);
          expect(needsItemCreationResult.needsItemCreation).toBe(false);
          expect(needsItemCreationResult.canBeAddedToCart).toBe(true);
        });
      });

      describe('should be Status is 1 needsItemCreation is false and canBeAddedToCart is false when', () => {
        it('productId is not null and orderSpecification is  not present in productItems and productItems count less greater than maximumNumberOfCartsThatCanBeAdded', () => {
          const orderSpecification = {} as OrderSpecification; // This fails saying property XX is missing
          const productItems =
            getCartData.productItems as unknown as ProductItem[];
          productItems[0].productId = '4987167051922';
          // eslint-disable-next-line turbo/no-undeclared-env-vars
          process.env.MAXIMUM_NUMBER_OF_CARTS_THAT_CAN_BE_ADDED = '2';
          needsItemCreationResult = service.needsItemCreation(
            '4987167051921',
            orderSpecification,
            productItems,
          );
          expect(needsItemCreationResult.status).toBe(StatusCode.SUCCESS);
          expect(needsItemCreationResult.needsItemCreation).toBe(true);
          expect(needsItemCreationResult.canBeAddedToCart).toBe(false);
        });
      });
    });
  });

  describe('createProductItem common process', () => {
    it('should return the status as 1 and a valid productItem', async () => {
      const result = await service.createProductItem(
        itemData,
        products,
        true,
        '0859',
        updateCartChangeData.storeInfo,
      );
      expect(result.status).toBe(1);
    });
    it('should return status 0 when itemData is empty or null', async () => {
      const result = await service.createProductItem(
        {},
        products,
        true,
        '0859',
        updateCartChangeData.storeInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status 0 when products is an empty array or null', async () => {
      const result = await service.createProductItem(
        itemData,
        [],
        true,
        '0859',
        updateCartChangeData.storeInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status 0 when isMember is null', async () => {
      const result = await service.createProductItem(
        itemData,
        products,
        null,
        '0859',
        updateCartChangeData.storeInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status 0 when storeCode is an empty string or null', async () => {
      const result = await service.createProductItem(
        itemData,
        products,
        true,
        '',
        updateCartChangeData.storeInfo,
      );
      expect(result.status).toBe(0);
    });
    it('should return status 0 when storeInfo is an empty object or null', async () => {
      const result = await service.createProductItem(
        itemData,
        products,
        true,
        '0859',
        {},
      );
      expect(result.status).toBe(0);
    });
  });

  describe('should be able to check Selectable PickUpLocations for store', () => {
    let storeInfoData;
    beforeEach(() => {
      storeInfoData = getCartData.storeInfo;
    });
    it('If any store master flag is false in store Info then set supportPickupInnerLocker,supportPickupPlace,supportPickupPlaceParking to false', async () => {
      const isMember = true;
      const isStorePaymentSelected = true;
      storeInfoData.detail.supportPickupInnerLocker = false;
      storeInfoData.detail.supportPickupPlace = true;
      storeInfoData.detail.supportPickupPlaceParking = true;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.supportPickupInnerLocker).toEqual(false);
      expect(result.supportPickupPlace).toEqual(false);
      expect(result.supportPickupPlaceParking).toEqual(false);
    });
    it('If isStorePaymentSelected is true and isMember is true then all pickupLocations be true', async () => {
      const isMember = true;
      const isStorePaymentSelected = true;
      storeInfoData.detail.supportPickupInnerLocker = true;
      storeInfoData.detail.supportPickupPlace = true;
      storeInfoData.detail.supportPickupPlaceParking = true;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.supportPickupInnerLocker).toEqual(true);
      expect(result.supportPickupPlace).toEqual(true);
      expect(result.supportPickupPlaceParking).toEqual(true);
    });
    it('If isStorePaymentSelected is true and isMember is false then supportPickupInnerLocker be true,supportPickupPlace be false,supportPickupPlaceParking be false', async () => {
      const isMember = false;
      const isStorePaymentSelected = true;
      storeInfoData.detail.supportPickupInnerLocker = true;
      storeInfoData.detail.supportPickupPlace = true;
      storeInfoData.detail.supportPickupPlaceParking = true;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.supportPickupInnerLocker).toEqual(true);
      expect(result.supportPickupPlace).toEqual(false);
      expect(result.supportPickupPlaceParking).toEqual(false);
    });
    it('If isStorePaymentSelected is false and isMember is true then supportPickupInnerLocker be true,supportPickupPlace be false,supportPickupPlaceParking be false', async () => {
      const isMember = true;
      const isStorePaymentSelected = false;
      storeInfoData.detail.supportPickupInnerLocker = true;
      storeInfoData.detail.supportPickupPlace = true;
      storeInfoData.detail.supportPickupPlaceParking = true;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.supportPickupInnerLocker).toEqual(true);
      expect(result.supportPickupPlace).toEqual(false);
      expect(result.supportPickupPlaceParking).toEqual(false);
    });
    it('If isStorePaymentSelected is false and isMember is false then supportPickupInnerLocker be true,supportPickupPlace be false,supportPickupPlaceParking be false', async () => {
      const isMember = false;
      const isStorePaymentSelected = false;
      storeInfoData.detail.supportPickupInnerLocker = true;
      storeInfoData.detail.supportPickupPlace = true;
      storeInfoData.detail.supportPickupPlaceParking = true;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.SUCCESS);
      expect(result.supportPickupInnerLocker).toEqual(true);
      expect(result.supportPickupPlace).toEqual(false);
      expect(result.supportPickupPlaceParking).toEqual(false);
    });
    it('If isMember is null then status should be 0', async () => {
      const isMember = null;
      const isStorePaymentSelected = false;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.FAILURE);
    });
    it('If isStorePaymentSelected is null then status should be 0', async () => {
      const isMember = true;
      const isStorePaymentSelected = null;
      const result: any = service.getSelectablePickUpLocation(
        storeInfoData,
        isMember,
        isStorePaymentSelected,
      );
      expect(result.status).toBe(StatusCode.FAILURE);
    });
  });

  describe('checkoutCanBeStarted common process', () => {
    it('should return status as 1 when all the inputs are valid', async () => {
      const result = await service.checkoutCanBeStarted(
        getCartData.productItems,
        selectedItems,
      );
      expect(result.status).toBe(1);
    });
    it('should return status as 0 when cartData is empty or null', async () => {
      const result = await service.checkoutCanBeStarted([], selectedItems);
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when selectedItems is empty or null', async () => {
      const result = await service.checkoutCanBeStarted(
        getCartData.productItems,
        [],
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when any string in selectedItems is empty or null', async () => {
      const result = await service.checkoutCanBeStarted(
        getCartData.productItems,
        [...selectedItems, ''],
      );
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when any object in cartData is empty or null', async () => {
      const result = await service.checkoutCanBeStarted(
        [...getCartData.productItems, null],
        selectedItems,
      );
      expect(result.status).toBe(0);
    });
  });
});
