import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { CommonService } from '@cainz-next-gen/common';
import {
  mockCheckoutBeginResponse,
  MockcheckoutId,
  MockPayments,
} from '../../../test/mock';
import {
  ErrorCode,
  OrderCreationErrorMessage,
  CheckoutErrorMessage,
} from '../../types/constants/error-code';
import {
  CheckoutCompleteInterface,
  AmazonInterface,
  OtherPaymentDataInterface,
  CompleteInfoInterface,
} from './Interface/checkout-complete.interface';
import { CheckoutCompleteDto } from './dto/checkoutComplete.dto';
import { checkoutBeginResponse, productItem } from './data_json/data';
import { CheckoutChangeDto } from './dto/patch.cart-change-item-body.dto';
import { CheckoutBeginDto } from './dto/checkoutbegin.dto';

import { CheckoutComplete2Dto } from './dto/checkoutComplete2.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {}

  public async checkoutBegin(checkoutBeginDto: CheckoutBeginDto) {
    this.logger.info('start method checkoutBegin');
    try {
      const { storeReceiveProducts } = checkoutBeginResponse;
      checkoutBeginDto.selectedItems.forEach(async (itemId, index) =>
        storeReceiveProducts[0].productItems.push({
          ...productItem,
          itemId,
          productId: await this.generateRandomNumber(13),
        }),
      );
      this.logger.info('fetching checkoutBegin response');
      return checkoutBeginResponse;
    } catch (error: unknown) {
      this.commonService.logException(`method checkoutBegin error`, error);
      this.logger.info('end method checkoutBegin');
      throw new HttpException(
        {
          code: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: GlobalErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async checkoutComplete(
    checkoutId: string,
    CheckOutDto: CheckoutCompleteDto,
  ): Promise<CheckoutCompleteInterface> {
    this.logger.info('start method checkoutComplete');

    if (checkoutId === MockcheckoutId) {
      const paymentChoosen = MockPayments.data.paymentMethodInfoList
        .map((res) => res.paymentMethodId)
        .toString()
        .trim();

      // check order information and create the orderId to confirm order
      const order = {
        orderId: '4772713525',
        products: ['Tv', 'Mobile'],
        price: 20000,
        shippingAddress: 'Hyderabad,India.',
      };
      if (order.orderId != null) {
        this.logger.info(`Order created successfully with id ${order.orderId}`);
        // order created successfully now go for payment
        if (paymentChoosen === '8' || paymentChoosen === '7') {
          this.logger.info(`payment choosen is ${paymentChoosen}`);

          const amazonPayobj: AmazonInterface = {
            receptionId: this.generateRandomNumber(13),
            orderId: order.orderId,
            accessId: this.generateRandomString(28),
            token: this.generateRandomString(35),
            paymentStartUrl:
              'https://xxxx.mul-pay.jp/payment/DocomoStart.idPass',
            paymentStartBy: '2023-10-30T16:50:24.367Z',
          };

          // assuming that GMOPaymentProcess is success if payment Id not equal to null
          if (amazonPayobj.receptionId != null) {
            this.logger.info(
              `receptionId generated is ${amazonPayobj.receptionId}`,
            );
            return amazonPayobj;
          }
          this.logger.info(
            'error occurred while processing the payment try again',
          );
          return {
            error: 'Failed to finish the payment for order please try again!!',
            data: { ...mockCheckoutBeginResponse },
          };
        }
        if (paymentChoosen === '1') {
          this.logger.info(`payment choosen is ${paymentChoosen}`);
          let { creditCardTokenList } = CheckOutDto;
          creditCardTokenList = [
            {
              creditCardToken:
                '2a031a7d7ecb674c866148970bc2febf72e5e1773b60bc5a08a0a9e5ecc6e9fd',
            },
          ];
          return this.paymentResponse();
        }
        if (paymentChoosen === '3' || paymentChoosen === '6') {
          this.logger.info(`payment choosen is ${paymentChoosen}`);
          let { httpHeader } = CheckOutDto;
          const headerdata = {
            accept:
              'text/html, application/xhtml+xml, application/xml;q=0.9, image/webp, / ;q=0.8',
            acceptCharset: 'utf-8, iso-8859-1;q=0.5',
            acceptEncoding: 'gzip,deflate,sdch',
            acceptLanguage: 'ja,en-US;q=0.8,en;q=0.6',
            clientIp: '999.999.99.999',
            connection: 'keep-alive',
            dnt: '1',
            host: '99.9.99.999:99999',
            referrer: null,
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0Safari/537.36',
            keepAlive: '333',
            uaCpu: null,
            via: null,
            xForwardedFor:
              '203.0.113.195, 2001:db8:85a3:8d3:1319:8a2e:370:7348',
            endUserIp: '999.999.99.999',
            imei: '99 999999 999999 9',
          };
          httpHeader = headerdata;
          return this.paymentResponse();
        }
        // Other payments like convenience store,Cash on delivery,Full amount points,Store payment(2,0,4,5)
        this.logger.info(`payment choosen is ${paymentChoosen}`);
        return this.paymentResponse();
      }
      // order not created
      this.logger.info(
        `Failed to create the orderId ,order confirmation failed please try again!!`,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.ORDER_CREATION_FAILED,
          message: OrderCreationErrorMessage[ErrorCode.ORDER_CREATION_FAILED],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.logger.info(`checkout Id ${checkoutId} is not a valid one`);
    this.logger.info('end method checkoutComplete');
    throw new HttpException(
      {
        code: GlobalErrorCode.BAD_PARAMETER,
        message: `Checkout ID Not Found : ${checkoutId}`,
        errorCode: GlobalErrorCode.BAD_PARAMETER,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  generateRandomString(length) {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/*-_.';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }
    this.logger.info(`Random String is generated${result}`);
    return result;
  }

  generateRandomNumber(length) {
    const charset = '0123456789';
    let count = 0;
    let res = '';
    while (count < length) {
      res += charset[Math.floor(Math.random() * charset.length)];
      count += 1;
    }
    this.logger.info(`Random Number is generated${res}`);
    return res;
  }

  public paymentResponse(): CompleteInfoInterface {
    const paymentIdChoosen = MockPayments.data.paymentMethodInfoList
      .map((res) => res.paymentMethodId)
      .toString()
      .trim();
    this.logger.info(`payment choosen is ${paymentIdChoosen}`);

    if (paymentIdChoosen === '2') {
      const conveniencePayment: OtherPaymentDataInterface = [
        {
          orderId: '4772713526',
          receptionId: this.generateRandomNumber(13),
          shortOrderId: this.generateRandomNumber(8),
          receivingMethod: '1',
          paymentMethodId: paymentIdChoosen,
          convenienceCode: '00007',
          purchaseAmount: 3233,
          payBy: '2023-10-30T16:50:24.367Z',
          confirmationNumber: '2024',
          receiptNumber: 'LW233053476653',
          slipUrl: 'https://xxxxx.mul-pay.jp/seven/sample.html',
          clientField1: 'Free item 1',
          clientField2: 'Free item 2',
          clientField3: 'Free item 3',
          customerEmail: 'xxxxxxx@test.co.jp',
          isMember: true,
        },
      ];
      if (conveniencePayment[0].receptionId != null) {
        this.logger.info(
          `receptionId for selected order is ${conveniencePayment[0].receptionId}`,
        );
        // const g=[];
        // g.push({...conveniencePayment})
        return {
          orderCompleteInfo: conveniencePayment,
        };
      }
      this.logger.info(
        'Failed to finish the payment for order please try again!!',
      );
      return {
        error: 'Failed to finish the payment for order please try again!!',
        data: { ...mockCheckoutBeginResponse },
      };
    }
    const otherPaymentsObj: OtherPaymentDataInterface = [
      {
        orderId: '4772713528',
        receptionId: this.generateRandomNumber(13),
        shortOrderId: this.generateRandomNumber(8),
        receivingMethod: '1',
        paymentMethodId: paymentIdChoosen,
        convenienceCode: '10001',
        customerEmail: 'xxxxxxx@test.co.jp',
        isMember: true,
      },
    ];

    if (otherPaymentsObj[0].receptionId != null) {
      this.logger.info(
        `receptionId for selected order is ${otherPaymentsObj[0].receptionId}`,
      );
      return {
        orderCompleteInfo: otherPaymentsObj,
      };
    }

    this.logger.info(
      'Failed to finish the payment for order please try again!!',
    );
    return {
      error: 'Failed to finish the payment for order please try again!!',
      data: { ...mockCheckoutBeginResponse },
    };
  }

  public async checkoutComplete2(
    checkoutId: string,
    checkoutComplete2dto: CheckoutComplete2Dto,
  ) {
    this.logger.info('start method checkoutComplete2');
    if (!(checkoutBeginResponse.checkoutId === checkoutId)) {
      this.logger.info('Checkout ID Not Found');
      throw new HttpException(
        {
          code: GlobalErrorCode.BAD_PARAMETER,
          message: `Checkout ID Not Found : ${checkoutId}`,
          errorCode: GlobalErrorCode.BAD_PARAMETER,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const { orderId } = checkoutComplete2dto;
    const date = new Date();
    try {
      const checkOutComplete2Response = {
        receptionId: '4772713525',
        orderId,
        accessId: await this.generateRandomString(28),
        token: await this.generateRandomString(35),
        paymentStartUrl: 'https://cainz.com/amazon/payments',
        paymentStartBy: date.toISOString(),
      };
      this.logger.info('end method checkoutComplete2');
      return checkOutComplete2Response;
    } catch (error) {
      throw new HttpException(
        {
          errorCode: ErrorCode.CHECKOUT_FIRE_STORE_ERROR,
          message: CheckoutErrorMessage[ErrorCode.CHECKOUT_FIRE_STORE_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkoutChange(
    checkoutId: string,
    checkoutChangeDto: CheckoutChangeDto,
  ) {
    this.logger.info('start method checkout change');
    if (checkoutChangeDto.userId) {
      this.mergeCheckoutChange(
        { ...checkoutBeginResponse },
        { ...checkoutChangeDto },
      );
      this.logger.info('update cart change data');
      if (checkoutBeginResponse) {
        try {
          delete checkoutBeginResponse.paymentMethodInfoList;
          return checkoutBeginResponse;
        } catch (e: unknown) {
          this.commonService.logException('update to data is failed', e);
          throw new HttpException(
            {
              code: HttpStatus.INTERNAL_SERVER_ERROR,
              errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
              message: ErrorCode[GlobalErrorCode.INTERNAL_SERVER_ERROR],
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
        message: `${CheckoutErrorMessage[ErrorCode.USER_NOT_FOUND]}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async mergeCheckoutChange(target, source) {
    const result = target;
    Object.entries(JSON.parse(JSON.stringify(source))).forEach(
      ([key, value]) => {
        if (value instanceof Object) {
          if (result[key] === undefined || !(result[key] instanceof Object)) {
            result[key] = {};
          }
          this.mergeCheckoutChange(target[key], value);
        } else {
          result[key] = value;
        }
      },
    );
    return result;
  }
}
