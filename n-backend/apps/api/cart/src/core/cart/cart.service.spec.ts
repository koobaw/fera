import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { ErrorMessage } from '@cainz-next-gen/exception/dist/error-code';
import { GlobalsModule } from '../../globals.module';
import { CartService } from './cart.service';
import { CartAddItemDto } from './dto/post.cart-add-item-body.dto';
import {
  mockFromUserId,
  mockCartChangeData,
  mockGetCartData,
} from '../../../test/mockData';
import { ErrorCode, CartErrorMessage } from '../../types/constants/error-code';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [CartService],
    }).compile();

    service = module.get<CartService>(CartService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('service method should be defined', () => {
    expect(service.getCart).toBeDefined();
    expect(service.deleteCartItem).toBeDefined();
    expect(service.mergeCarts).toBeDefined();
  });
  it('service method should be defined', () => {
    expect(service.cartChange).toBeDefined();
  });

  describe('Cart get', () => {
    it('should get all the cart items', async () => {
      const result = await service.getCart('12345');
      expect(result).toEqual(mockGetCartData);
    });
  });

  describe('Cart Add Item ', () => {
    it('cartAddItem method should be defined', () => {
      expect(service.cartAddItem).toBeDefined();
    });

    it('should be call cartAddItem method', async () => {
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
      const result = await service.cartAddItem('12345', bodyData);
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('delete cart', () => {
    it('should throw an exception when wrong itemId is passed', async () => {
      try {
        await service.deleteCartItem('123456', '123');
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

  describe('CartMerge', () => {
    it('should throw error with wrong userId', async () => {
      try {
        await service.mergeCarts('1234', mockFromUserId.fromUserId);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse().message).toBe(
          `${CartErrorMessage[ErrorCode.USER_NOT_FOUND]}`,
        );
      }
    });
  });
  describe('cart change', () => {
    it('should call these functions when changing the  cart', async () => {
      const result = await service.cartChange('12345', mockCartChangeData);
      expect(result.productItems[0].productId).toBe('4549509524318');
      expect(result.productItems[0].quantity).toBe(5);
    });
  });
});
