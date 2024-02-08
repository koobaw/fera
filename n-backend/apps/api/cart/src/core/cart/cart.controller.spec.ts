import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { HttpStatus, HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMessage } from '@cainz-next-gen/exception/dist/error-code';
import {
  mockGetCartData,
  mockCartChangeData,
  mockValidationCartChangeData,
  mockGetCartChangeData,
  mockFromUserId,
  mockToUserId,
} from '../../../test/mockData';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { GlobalsModule } from '../../globals.module';
import { CartAddItemDto } from './dto/post.cart-add-item-body.dto';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn(),
            deleteCartItem: jest.fn(),
            cartAddItem: jest.fn(),
            mergeCarts: jest.fn(),
            cartChange: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  }, 10000);

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('controller method should be defined', () => {
    expect(controller.getCart).toBeDefined();
    expect(controller.mergeCart).toBeDefined();
  });
  it('controller method should be defined', () => {
    expect(controller.cartChange).toBeDefined();
  });

  describe('Get cart', () => {
    it('should call the get cart items method', async () => {
      jest
        .spyOn(service, 'getCart')
        .mockImplementation(async () => mockGetCartData);
      const result = await controller.getCart('12345');
      expect(result.code).toEqual(HttpStatus.OK);
    });
    it('should throw an exception when service fails', async () => {
      const httpException = new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'getCart')
        .mockImplementation(async () => Promise.reject(httpException));
      try {
        await controller.getCart('12345');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
      }
    });
  });

  describe('Delete cart', () => {
    it('should call the delete cart items method', async () => {
      jest
        .spyOn(service, 'deleteCartItem')
        .mockImplementation(async () => mockGetCartData);
      const result = await controller.deleteCartItem(
        { claims: { userId: '12444' } },
        '87092821394372',
      );
      expect(result.code).toEqual(HttpStatus.OK);
    });

    it('should throw an exception when service fails', async () => {
      const httpException = new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'deleteCartItem')
        .mockImplementation(async () => Promise.reject(httpException));
      try {
        await controller.deleteCartItem(
          { claims: { userId: '12444' } },
          '87092821394372',
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
      }
    });
    it('should throw an exception when item id not found', async () => {
      const httpException = new HttpException(
        {
          code: GlobalErrorCode.BAD_PARAMETER,
          message: ErrorMessage[GlobalErrorCode.BAD_PARAMETER],
          errorCode: GlobalErrorCode.BAD_PARAMETER,
        },
        HttpStatus.BAD_REQUEST,
      );
      jest
        .spyOn(service, 'deleteCartItem')
        .mockImplementation(async () => Promise.reject(httpException));
      try {
        await controller.deleteCartItem(
          { claims: { userId: '12444' } },
          '4549509524317aa',
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          ErrorMessage[GlobalErrorCode.BAD_PARAMETER],
        );
      }
    });
  });

  describe('Cart Add Item ', () => {
    const bodyData: CartAddItemDto = {
      productId: '4549509352433',
      quantity: 20,
      storeCode: '2333',
      prefecture: '埼玉県',
      isWebBackOrder: false,
      receivingMethod: '2',
      orderSpecification: {
        simulationNumber: '01-12-123456',
        color: 'Red',
        width: 3,
        height: 4,
        hook: 'Testing',
      },
    };

    const mockData = {
      itemCount: 1,
      productItem: mockGetCartData.productItems[0],
    };

    it('should be call cartAddItem method', async () => {
      jest
        .spyOn(service, 'cartAddItem')
        .mockImplementation(async () => mockData);
      const result = await controller.cartAddItem(
        { claims: { userId: '12444' } },
        bodyData,
      );
      expect(result.code).toEqual(HttpStatus.OK);
    });

    it('item count should be GreaterThanOrEqual 1', async () => {
      jest
        .spyOn(service, 'cartAddItem')
        .mockImplementation(async () => mockData);
      const result = await controller.cartAddItem(
        { claims: { userId: '12444' } },
        bodyData,
      );
      expect(result.data.itemCount).toBeGreaterThanOrEqual(1);
    });

    it('should return Error', async () => {
      jest
        .spyOn(service, 'cartAddItem')
        .mockImplementation(async () => Promise.reject());
      try {
        await controller.cartAddItem({ claims: { userId: '12444' } }, bodyData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  });

  describe('mergeCart', () => {
    it('should return response OK', async () => {
      jest.spyOn(service, 'mergeCarts').mockImplementation(() => undefined);
      const result = await controller.mergeCart(
        { claims: { userId: '12444' } },
        mockFromUserId,
      );
      expect(result.code).toEqual(HttpStatus.OK);
    });
    it('should throw an exception when service fails', async () => {
      const httpException = new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'mergeCarts')
        .mockImplementation(async () => Promise.reject(httpException));
      try {
        await controller.mergeCart(
          { claims: { userId: '12444' } },
          mockFromUserId,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
      }
    });
  });
  describe('Change cart', () => {
    it('should update cart change items method', async () => {
      jest
        .spyOn(service, 'cartChange')
        .mockImplementation(async () => mockGetCartChangeData);
      const result = await controller.cartChange(
        { claims: { userId: '12444' } },
        mockCartChangeData,
      );
      expect(result.code).toEqual(HttpStatus.OK);
    });
    it('should throw an exception when validation fails', async () => {
      const httpException = new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest
        .spyOn(service, 'cartChange')
        .mockImplementation(async () => Promise.reject(httpException));
      try {
        await controller.cartChange(
          { claims: { userId: '12444' } },
          mockValidationCartChangeData,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(error.getResponse().message).toBe(
          ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        );
      }
    });
  });
});
