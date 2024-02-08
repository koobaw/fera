/* eslint-disable prefer-destructuring */
import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { StatusCode } from '@cainz-next-gen/order';
import {
  addressBookMockData,
  amazonInfoMockData,
  customerInfoEnteredByGuest,
  mockMemberData,
  shippingInfoGuestInputInfo,
} from '../../../test/mock';
import { CheckoutCommonService } from './checkout-common.service';
import { CheckoutCommonValidation } from './checkout-common-validation';
import { GlobalsModule } from '../../globals.module';
import {
  amazonInfo,
  getCartData,
  selectedItems,
} from '../checkout/data_json/data';

describe('CheckoutCommonService', () => {
  let service: CheckoutCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutCommonService,
        CommonService,
        LoggingService,
        CheckoutCommonValidation,
      ],

      imports: [GlobalsModule],
    }).compile();
    service = module.get<CheckoutCommonService>(CheckoutCommonService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.getAmazonPayBillingDestination).toBeDefined();
  });

  describe('CheckoutCommonService: createCustomerInfo', () => {
    it('should be defined createCustomerInfo', () => {
      expect(service.createCustomerInfo).toBeDefined();
    });

    describe('createCustomerInfo status should be 0', () => {
      it('when all params is null', () => {
        const customerInfo = service.createCustomerInfo(
          null,
          null,
          null,
          null,
          null,
        );
        expect(customerInfo.status).toBe(0);
      });
      it('when amazonInfo is not null and amazonInfo.billingInfo || amazonInfo.shippingInfo is not defined', () => {
        const customerInfo = service.createCustomerInfo(
          false,
          null,
          null,
          {},
          null,
        );
        expect(customerInfo.status).toBe(0);
      });
    });

    describe('createCustomerInfo status should be 1', () => {
      it('when member  is not null', () => {
        const customerInfo = service.createCustomerInfo(
          true,
          mockMemberData,
          null,
          null,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });

      it('when amazonInfo is not null and amazonInfo.billingInfo || amazonInfo.shippingInfo is  defined', () => {
        const customerInfo = service.createCustomerInfo(
          false,
          mockMemberData,
          null,
          amazonInfoMockData,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });
      it('when amazonInfo is  null  and customerInfoEnteredByGuest not null', () => {
        const customerInfo = service.createCustomerInfo(
          false,
          mockMemberData,
          null,
          amazonInfoMockData,
          customerInfoEnteredByGuest,
        );
        expect(customerInfo.status).toBe(1);
      });
    });
  });

  describe('getAmazonPayBillingDestination', () => {
    it('should return status as 0 when amazonCheckoutSessionId is null', async () => {
      const result = await service.getAmazonPayBillingDestination(null);
      expect(result.status).toBe(0);
    });
    it('should return status as 0 when amazonCheckoutSessionId is empty', async () => {
      const result = await service.getAmazonPayBillingDestination('');
      expect(result.status).toBe(0);
    });
    it('should return status as 1 when amazonCheckoutSessionId is a valid session id', async () => {
      const result = await service.getAmazonPayBillingDestination(
        '6bad50d1-bc67-46e4-a768-a3eccf90d6bb',
      );
      expect(result.status).toBe(1);
      expect(result.amazonInfo).toEqual(amazonInfo);
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

  describe('check and Confirm the type of product purchased', () => {
    let productItem1;
    let productItem2;
    let productItem3;
    beforeEach(async () => {
      productItem1 = getCartData.productItems[0];
      productItem2 = getCartData.productItems[1];
      productItem3 = getCartData.productItems[2];
    });

    it('should be able to call confirmPurchaseProductType method and If all Normal products with no web back order in any product', () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '2';
      productItem2.isWebBackOrder = false;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(false);
      expect(result.hasWebBackOrder).toEqual(false);
    }, 10000);
    it('should be able to call confirmPurchaseProductType method and If all Normal products with  web back order in any product', () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '2';
      productItem2.isWebBackOrder = true;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(false);
      expect(result.hasWebBackOrder).toEqual(true);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If all Normal products along with Mother'sDay product`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '7';
      productItem2.isWebBackOrder = false;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(false);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If Normal products with  Mother'sDay product along with web back order Product`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '7';
      productItem2.isWebBackOrder = false;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = true;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(true);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If all Normal products along with Father'sDay product`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '8';
      productItem2.isWebBackOrder = false;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(false);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If Normal products with Father'sDay product along with web back order Product`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '8';
      productItem2.isWebBackOrder = false;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = true;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(true);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If Normal products with  Mother'sDay product has web back order`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '7';
      productItem2.isWebBackOrder = true;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(true);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If Normal products with  Father'sDay product has web back order`, () => {
      productItem1.product.customizedProductCategory = '1';
      productItem1.isWebBackOrder = false;

      productItem2.product.customizedProductCategory = '8';
      productItem2.isWebBackOrder = true;

      productItem3.product.customizedProductCategory = '4';
      productItem3.isWebBackOrder = false;
      const setProductItems = [];
      setProductItems.push(productItem1, productItem2, productItem3);
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(1);
      expect(result.hasGiftProducts).toEqual(true);
      expect(result.hasWebBackOrder).toEqual(true);
    }, 10000);
    it(`should be able to call confirmPurchaseProductType method and If When there is no products passed`, () => {
      const setProductItems = [];
      const result = service.confirmPurchaseProductType(setProductItems);
      expect(result.status).toBe(0);
    }, 10000);
  });

  describe('CheckoutCommonService: createShippingInfo', () => {
    it('should be defined createShippingInfo', () => {
      expect(service.createShippingInfo).toBeDefined();
    });

    describe('createShippingInfo status should be 0', () => {
      it('when all params is null', () => {
        const customerInfo = service.createShippingInfo(
          null,
          null,
          null,
          null,
          null,
          null,
        );
        expect(customerInfo.status).toBe(0);
      });
      it('when amazonInfo is not null and amazonInfo.shippingInfo is not defined', () => {
        const customerInfo = service.createShippingInfo(
          false,
          null,
          null,
          {},
          null,
          null,
        );
        expect(customerInfo.status).toBe(0);
      });
      it('when addressBook data is not null and selectAddressBookId not in addressBook', () => {
        const customerInfo = service.createShippingInfo(
          true,
          null,
          '3',
          null,
          addressBookMockData,
          null,
        );
        expect(customerInfo.status).toBe(0);
      });
    });

    describe('shipping status should be 1', () => {
      it('when member  is not null', () => {
        const customerInfo = service.createShippingInfo(
          true,
          mockMemberData,
          null,
          null,
          null,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });

      it('when selectedAddressBookId  is not null', () => {
        const customerInfo = service.createShippingInfo(
          true,
          mockMemberData,
          '2',
          null,
          addressBookMockData,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });

      it('when amazonInfo is not null  amazonInfo.shipping is  defined', () => {
        const customerInfo = service.createShippingInfo(
          false,
          mockMemberData,
          null,
          amazonInfoMockData,
          null,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });
      it('when member is false and guest not is null', () => {
        const customerInfo = service.createShippingInfo(
          false,
          null,
          null,
          null,
          null,
          null,
        );
        expect(customerInfo.status).toBe(1);
      });
    });
  });

  describe('hasIllegalCharacters common process', () => {
    it('should return false if string has no invalid characters', async () => {
      const stringToCheck = 'test';
      const result = await service.hasIllegalCharacters(stringToCheck);
      expect(result).toBe(false);
    });
    it('should return true if string has invalid characters', async () => {
      const stringToCheck = 'test&';
      const result = await service.hasIllegalCharacters(stringToCheck);
      expect(result).toBe(true);
    });
    it('should return false if i pass japanese word', async () => {
      const stringToCheck = 'ありがとう';
      const result = await service.hasIllegalCharacters(stringToCheck);
      expect(result).toBe(false);
    });
    it('should return true if i pass korean word', async () => {
      const stringToCheck = '감사합니다';
      const result = await service.hasIllegalCharacters(stringToCheck);
      expect(result).toBe(true);
    });
  });
});
