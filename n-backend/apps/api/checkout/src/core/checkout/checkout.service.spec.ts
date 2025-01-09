import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalErrorCode } from '@fera-next-gen/exception';
import {
  MockcheckoutId,
  MockcheckoutCompleteServiceOtherPaymentsData,
  MockcheckoutCompleteServiceData,
  MockcheckoutCompleteBodyData,
  MockcheckoutCompleteServiceStoreData,
  mockCheckoutBeginResponse,
  mockCheckoutBeginDto,
  mockCheckOutComplete2Dto,
  mockCheckOutChangeData,
} from '../../../test/mock';
import { GlobalsModule } from '../../globals.module';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [CheckoutService],
    }).compile();
    service = module.get<CheckoutService>(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('service method should be defined', () => {
    expect(service.checkoutComplete).toBeDefined();
    expect(service.checkoutBegin).toBeDefined();
    expect(service.checkoutComplete2).toBeDefined();
  });

  describe('Checkout begin', () => {
    it('should return expected response data', async () => {
      jest
        .spyOn(service, 'checkoutBegin')
        .mockImplementation(async () => mockCheckoutBeginResponse);
      const result = await service.checkoutBegin(mockCheckoutBeginDto);
      expect(result.checkoutId).toBe('74234354598');
      expect(result.storeInfo.zipCode).toBe('3720999');
    });
  });

  describe('Checkout change', () => {
    it('should return update expected response data', async () => {
      jest
        .spyOn(service, 'checkoutChange')
        .mockImplementation(async () => mockCheckoutBeginResponse);
      const result = await service.checkoutChange(
        'XeC4T6BoCmP2rtpRlZ733F1zPM92',
        MockcheckoutId,
        mockCheckOutChangeData,
      );
      expect(result.customerInfo.customerPrefecture).toBe('埼玉県');
    });
  });

  describe('Cart Checkout Complete', () => {
    it('should call these function when doing cart checkout complete through amazonpay or d-payment', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(() => MockcheckoutCompleteServiceData);
      const result: any = await service.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(result.orderId).toBe('4772713525');
      expect(result.receptionId).toBe('7573536222410');
      expect(result.paymentStartUrl).toEqual(
        'https://xxxx.mul-pay.jp/payment/DocomoStart.idPass',
      );
    });

    it('should be able to return response of order payment Information for Convenience store Payments', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(async () => MockcheckoutCompleteServiceStoreData);
      const output: any = await service.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(output.orderCompleteInfo[0].receivingMethod).toEqual('1');
      expect(output.orderCompleteInfo[0].paymentMethodId).toEqual('2');
      expect(output.orderCompleteInfo[0].purchaseAmount).toEqual(3233);
      expect(output.orderCompleteInfo[0].receiptNumber).toEqual(
        'LW233053476653',
      );
      expect(output.orderCompleteInfo[0].slipUrl).toEqual(
        'https://xxxxx.mul-pay.jp/seven/sample.html',
      );
      expect(output.orderCompleteInfo[0].isMember).toBe(true);
    });

    it('should be able to return response of order payment Information for Other Payments', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(
          async () => MockcheckoutCompleteServiceOtherPaymentsData,
        );
      const output: any = await service.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(output.orderCompleteInfo[0].convenienceCode).toEqual('10001');
      expect(output.orderCompleteInfo[0].receivingMethod).toEqual('1');
      expect(output.orderCompleteInfo[0].paymentMethodId).toEqual('3');
      expect(output.orderCompleteInfo[0].isMember).toBe(true);
    });

    it('should get error when failed to get data from collection by assuming that wrong checkoutId passed', async () => {
      try {
        await service.checkoutComplete(
          MockcheckoutId,
          MockcheckoutCompleteBodyData,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getResponse().code).toBe(GlobalErrorCode.BAD_PARAMETER);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          `Checkout ID Not Found : ${MockcheckoutId}`,
        );
      }
    });
  });

  describe('CheckOut Complete 2', () => {
    it('should return correct data', async () => {
      const CheckOutComplete2Id = '74234354598';
      const result = await service.checkoutComplete2(
        CheckOutComplete2Id,
        mockCheckOutComplete2Dto,
      );
      expect(result.orderId).toBe('19287341');
    });
    it('should throw error when checkoutId not Found', async () => {
      try {
        await service.checkoutComplete2('123', mockCheckOutComplete2Dto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getResponse().code).toBe(GlobalErrorCode.BAD_PARAMETER);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });
});
