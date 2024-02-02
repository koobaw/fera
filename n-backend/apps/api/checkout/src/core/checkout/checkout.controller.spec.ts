import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import {
  MockcheckoutCompleteServiceOtherPaymentsData,
  MockcheckoutCompleteServiceData,
  MockcheckoutId,
  MockcheckoutCompleteBodyData,
  mockCheckoutBeginResponse,
  mockCheckoutBeginDto,
  userIdValidationError,
  mockCheckOutChangeData,
  mockCheckoutChangeWithoutUserIdData,
  mockCheckoutComplete2Error,
  mockCheckOutComplete2Dto,
  mockCheckoutComplete2Response,
  mockCheckOutComplete2Id,
  MockcheckoutCompleteServiceStoreData,
} from '../../../test/mock';
import { GlobalsModule } from '../../globals.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

import {
  CheckoutErrorMessage,
  ErrorCode,
} from '../../types/constants/error-code';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;
  const apiKey = 'VALID_API_KEY';
  process.env.CAINZAPP_API_KEY = apiKey;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: {
            checkoutBegin: jest.fn(),
            checkoutComplete: jest.fn(),
            checkoutChange: jest.fn(),
            checkoutComplete2: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.checkoutComplete).toBeDefined();
    expect(controller.checkoutComplete).toBeDefined();
    expect(controller.checkoutComplete2).toBeDefined();
  });
  it('should be defined', () => {
    expect(controller.checkoutChange).toBeDefined();
  });

  describe('Checkout begin', () => {
    it('should return checkout begin response data', async () => {
      jest
        .spyOn(service, 'checkoutBegin')
        .mockImplementation(async () => mockCheckoutBeginResponse);
      const result = await controller.checkoutBegin(mockCheckoutBeginDto);
      expect(result.code).toEqual(HttpStatus.OK);
      expect(service.checkoutBegin).toBeCalled();
    });
    it('should throw an bad parameters exception when userId is null', async () => {
      jest
        .spyOn(service, 'checkoutBegin')
        .mockImplementation(async () => Promise.reject(userIdValidationError));
      try {
        await controller.checkoutBegin({ ...mockCheckoutBeginDto, userId: '' });
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          `parameter validation error:userId`,
        );
      }
    });
    it('should throw an exception when service fails', async () => {
      const errorData: HttpException = new HttpException(
        {
          code: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: GlobalErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'checkoutBegin')
        .mockImplementation(async () => Promise.reject(errorData));
      try {
        await controller.checkoutBegin(mockCheckoutBeginDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          GlobalErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
        expect(error.getResponse().errorCode).toBe(
          GlobalErrorCode.INTERNAL_SERVER_ERROR,
        );
      }
    });
  });

  describe('Checkout change', () => {
    it('should update return checkout update response data', async () => {
      jest
        .spyOn(service, 'checkoutChange')
        .mockImplementation(async () => mockCheckoutBeginResponse);
      const result = await controller.checkoutChange(
        MockcheckoutId,
        mockCheckOutChangeData,
      );
      expect(result.code).toEqual(HttpStatus.OK);
    });
    it('should throw an bad parameters exception when userId is null', async () => {
      jest
        .spyOn(service, 'checkoutBegin')
        .mockImplementation(async () => Promise.reject(userIdValidationError));
      try {
        await controller.checkoutChange(
          MockcheckoutId,
          mockCheckoutChangeWithoutUserIdData,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          `parameter validation error:userId`,
        );
      }
    });
    it('should throw an exception when service fails', async () => {
      const errorData: HttpException = new HttpException(
        {
          code: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: GlobalErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'checkoutChange')
        .mockImplementation(async () => Promise.reject(errorData));
      try {
        await controller.checkoutBegin(mockCheckoutBeginDto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          GlobalErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
        expect(error.getResponse().errorCode).toBe(
          GlobalErrorCode.INTERNAL_SERVER_ERROR,
        );
      }
    });
  });

  describe('Checkout Complete', () => {
    it('should be able to return response of order payment Information for Amazon payment gateway', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(async () => MockcheckoutCompleteServiceData);
      const output: any = await controller.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(service.checkoutComplete).toBeCalled();
      expect(output.code).toEqual(HttpStatus.OK);
      expect(output.result.paymentStartUrl).toEqual(
        'https://xxxx.mul-pay.jp/payment/DocomoStart.idPass',
      );
    });

    it('should be able to return response of order payment Information for Convenience store Payments', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(async () => MockcheckoutCompleteServiceStoreData);
      const output: any = await controller.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(output.code).toEqual(HttpStatus.OK);
      expect(output.result.orderCompleteInfo[0].convenienceCode).toEqual(
        '00007',
      );
    });

    it('should be able to return response of order payment Information for Other Payments', async () => {
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(
          async () => MockcheckoutCompleteServiceOtherPaymentsData,
        );
      const output: any = await controller.checkoutComplete(
        MockcheckoutId,
        MockcheckoutCompleteBodyData,
      );
      expect(output.code).toEqual(HttpStatus.OK);
      expect(output.result.orderCompleteInfo[0].convenienceCode).toEqual(
        '10001',
      );
    });

    it('should throw error when checkoutId is wrong', async () => {
      const errorData: HttpException = new HttpException(
        {
          code: GlobalErrorCode.BAD_PARAMETER,
          message: `Checkout ID Not Found : ${MockcheckoutId}`,
          errorCode: GlobalErrorCode.BAD_PARAMETER,
        },
        HttpStatus.BAD_REQUEST,
      );
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(async () => Promise.reject(errorData));
      try {
        await controller.checkoutComplete(
          MockcheckoutId,
          MockcheckoutCompleteBodyData,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          `Checkout ID Not Found : ${MockcheckoutId}`,
        );
      }
    });

    it('should throw error when service fails', async () => {
      const errorData: HttpException = new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: ErrorCode.CHECKOUT_FIRE_STORE_ERROR,
          message: CheckoutErrorMessage[ErrorCode.CHECKOUT_FIRE_STORE_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'checkoutComplete')
        .mockImplementation(async () => Promise.reject(errorData));
      try {
        await controller.checkoutComplete(
          MockcheckoutId,
          MockcheckoutCompleteBodyData,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          CheckoutErrorMessage[ErrorCode.CHECKOUT_FIRE_STORE_ERROR],
        );
        expect(error.getResponse().errorCode).toBe(
          ErrorCode.CHECKOUT_FIRE_STORE_ERROR,
        );
      }
    });
  });

  describe('checkOut Complete 2', () => {
    it('should return response when completing checkout 2', async () => {
      jest
        .spyOn(service, 'checkoutComplete2')
        .mockImplementation(async () => mockCheckoutComplete2Response);
      const result = await controller.checkoutComplete2(
        mockCheckOutComplete2Id,
        mockCheckOutComplete2Dto,
      );
      expect(result.code).toBe(HttpStatus.OK);
    });
    it('should throw an exception when checkout id is not defined', async () => {
      jest
        .spyOn(service, 'checkoutComplete2')
        .mockImplementation(async () =>
          Promise.reject(mockCheckoutComplete2Error),
        );
      try {
        await controller.checkoutComplete2('', mockCheckOutComplete2Dto);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe('Checkout ID Not Found');
      }
    });
  });
});
