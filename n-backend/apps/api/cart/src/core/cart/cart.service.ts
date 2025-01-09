import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GlobalErrorCode } from '@fera-next-gen/exception';
import { ErrorMessage } from '@fera-next-gen/exception/dist/error-code';
import {
  getCartData,
  anonymousUserdata,
  membersData,
  updateCartChangeData,
} from '../../data_json/data';
import { CartAddItemDto } from './dto/post.cart-add-item-body.dto';
import { CartChangeDto } from './dto/patch.cart-change-item-body.dto';
import { ErrorCode, CartErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class CartService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  async getCart(userId: string): Promise<any> {
    this.logger.info('start method getCart');
    try {
      this.logger.info(`fetching get cart data for ${userId}`);
      return getCartData;
    } catch (error: unknown) {
      this.commonService.logException('method getCart error', error);
      this.logger.info(`end method getCart`);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async mergeCarts(toUserId, fromUserId): Promise<any> {
    this.logger.info('start method MergeCart service');
    const fromUserExists = anonymousUserdata.find(
      (user) => user.userId === fromUserId,
    );
    const toUserExists = membersData.find((user) => user.userId === toUserId);
    if (!(fromUserExists && toUserExists)) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: `${CartErrorMessage[ErrorCode.USER_NOT_FOUND]}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const finalData = membersData.map((member) => {
        const memberData = { ...member };
        if (memberData.userId === toUserExists.userId) {
          memberData.productItems = [...fromUserExists.productItems];
          this.logger.info('Carts merged Successfully');
        }
        return memberData;
      });
      // console.log(finalData[0].productItems);
    } catch (error) {
      this.commonService.logException('failed to merge carts', error);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCartItem(userId: string, deleteId: string): Promise<any> {
    this.logger.info(` Start deleteCartItem`);
    const { productItems } = getCartData;
    const product = productItems.find((item) => item.itemId === deleteId);
    if (!product) {
      this.logger.info(
        `ProductItem  is not present for userId  ${userId} and itemId Id ${deleteId}`,
      );
      throw new HttpException(
        {
          code: GlobalErrorCode.BAD_PARAMETER,
          message: `ProductItem is not present for itemId Id ${deleteId}`,
          errorCode: GlobalErrorCode.BAD_PARAMETER,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      this.logger.info(
        `ProductItem is present for userId  ${userId} and itemId Id ${deleteId}`,
      );
      getCartData.productItems.splice(productItems.indexOf(product), 1);
      return getCartData;
    } catch (e: unknown) {
      this.commonService.logException(
        'method deleteCartItem error catch block',
        e,
      );
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cartAddItem(userId: string, cartAddItem: CartAddItemDto): Promise<any> {
    this.logger.info(`start cartAddItem`);

    try {
      this.logger.info(`End cartAddItem`);
      // push or update product Item
      const isProductAlreadyExist = getCartData.productItems.findIndex(
        (product) => product.productId === cartAddItem.productId,
      );
      if (isProductAlreadyExist === -1) {
        this.logger.info(`push product Item`);
        const cartItem = getCartData.productItems[0];
        cartItem.productId = cartAddItem.productId;
        cartItem.itemId = this.commonService.generateRequestId();
        if (cartAddItem.orderSpecification) {
          cartItem.orderSpecification = cartAddItem.orderSpecification
            .simulationNumber
            ? cartAddItem.orderSpecification
            : cartItem.orderSpecification;
        }

        cartItem.quantity = cartAddItem.quantity;
        cartItem.receivingMethod = cartAddItem.receivingMethod;
        getCartData.productItems.push(cartItem);
      } else {
        this.logger.info(`update product Item ${isProductAlreadyExist}`);
        if (cartAddItem.orderSpecification) {
          getCartData.productItems[isProductAlreadyExist].orderSpecification =
            cartAddItem.orderSpecification.simulationNumber
              ? cartAddItem.orderSpecification
              : getCartData.productItems[isProductAlreadyExist]
                  .orderSpecification;
        }
        getCartData.productItems[isProductAlreadyExist].quantity =
          cartAddItem.quantity;
        getCartData.productItems[isProductAlreadyExist].receivingMethod =
          cartAddItem.receivingMethod;
        getCartData.productItems[isProductAlreadyExist].isWebBackOrder =
          cartAddItem.isWebBackOrder;
      }
      this.logger.info(`return  product Item`);

      return {
        itemCount: getCartData.productItems.length,
        productItem:
          isProductAlreadyExist !== -1
            ? getCartData.productItems[isProductAlreadyExist]
            : getCartData.productItems[getCartData.productItems.length - 1],
      };
    } catch (e) {
      this.commonService.logException(`Error while storing`, e);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cartChange(userId: string, cartChangeDto: CartChangeDto) {
    this.logger.info('start method changeCart');
    if (cartChangeDto) {
      this.mergeCartChangeData(
        { ...updateCartChangeData },
        { ...cartChangeDto },
      );
      this.logger.info('update cart change data');
      if (updateCartChangeData) {
        try {
          return updateCartChangeData;
        } catch (error: unknown) {
          this.commonService.logException(`update to data is failed`, error);
          throw new HttpException(
            {
              code: HttpStatus.INTERNAL_SERVER_ERROR,
              errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
              message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }
    throw new HttpException(
      {
        code: HttpStatus.BAD_REQUEST,
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: `${CartErrorMessage[ErrorCode.USER_NOT_FOUND]}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async mergeCartChangeData(target, source) {
    const result = target;
    Object.entries(JSON.parse(JSON.stringify(source))).forEach(
      ([key, value]) => {
        if (value instanceof Object) {
          if (result[key] === undefined || !(result[key] instanceof Object)) {
            result[key] = {};
          }
          this.mergeCartChangeData(target[key], value);
        } else {
          result[key] = value;
        }
      },
    );
    return result;
  }
}
