import { AuthGuard } from '@fera-next-gen/guard';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { GlobalErrorCode } from '@fera-next-gen/exception';
import { LoggingService } from '@fera-next-gen/logging';
import { CheckoutCommonService } from '../checkout-common/checkout-common.service';
import { getCartData } from '../checkout/data_json/data';

@Controller('checkout-service-test')
export class CheckoutServiceTestController {
  constructor(
    private readonly checkoutCommonService: CheckoutCommonService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {}

  @Post('/getAmazonPayBillingDestination')
  @UseGuards(AuthGuard)
  async getAmazonPayBillingDestination(@Body() body: any) {
    const result =
      await this.checkoutCommonService.getAmazonPayBillingDestination(
        body.amazonCheckoutSessionId,
      );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/checkoutCanBeStarted')
  @UseGuards(AuthGuard)
  async checkoutCanBeStarted(@Body() checkoutCanBeStartedBody: any) {
    const result = await this.checkoutCommonService.checkoutCanBeStarted(
      checkoutCanBeStartedBody.cartData,
      checkoutCanBeStartedBody.selectedItems,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/getSelectablePickUpLocation')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getPickUpLocation(@Body() pickUpLocationParams: any) {
    try {
      const result = this.checkoutCommonService.getSelectablePickUpLocation(
        pickUpLocationParams.storeInfo,
        pickUpLocationParams.isMember,
        pickUpLocationParams.isStorePaymentSelected,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        result,
      };
    } catch (error) {
      this.commonService.logException('method getPickUpLocation error', error);
      return { status: 0, error: [] };
    }
  }

  @Post('create-customer-info')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async createCustomerInfo(@Body() createCustomerInfoParams: any) {
    try {
      this.logger.info('createCustomerInfo Controller: started');
      const result = this.checkoutCommonService.createCustomerInfo(
        createCustomerInfoParams.isMember,
        createCustomerInfoParams.member
          ? createCustomerInfoParams.member
          : null,
        createCustomerInfoParams.selectedAddressBookId
          ? createCustomerInfoParams.selectedAddressBookId
          : null,
        createCustomerInfoParams.amazonInfo
          ? createCustomerInfoParams.amazonInfo
          : null,
        createCustomerInfoParams.customerInfoEnteredByGuest
          ? createCustomerInfoParams.customerInfoEnteredByGuest
          : null,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-shipping-info')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async createShippingInfo(@Body() createShippingInfoParams: any) {
    try {
      this.logger.info('createCustomerInfo Controller: started');
      const result = this.checkoutCommonService.createShippingInfo(
        createShippingInfoParams.isMember,
        createShippingInfoParams.member
          ? createShippingInfoParams.member
          : null,
        createShippingInfoParams.selectedAddressBookId
          ? createShippingInfoParams.selectedAddressBookId
          : null,
        createShippingInfoParams.amazonInfo
          ? createShippingInfoParams.amazonInfo
          : null,
        createShippingInfoParams.addressBook
          ? createShippingInfoParams.addressBook
          : null,
        createShippingInfoParams.guestInputInfo
          ? createShippingInfoParams.guestInputInfo
          : null,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Something went wrong',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/confirmPurchaseProductType')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async confirmProductPurchase(@Body() productItemsParamsDto: any) {
    try {
      const productItems = getCartData.productItems[0];
      const setProductItems = [];
      for (let i = 0; i < productItemsParamsDto.productItems.length; i++) {
        const productItemsParamsDtoData = productItemsParamsDto.productItems[i];
        const productItem = JSON.parse(JSON.stringify(productItems));

        productItem.product.customizedProductCategory =
          productItemsParamsDtoData.product.customizedProductCategory;
        productItem.isWebBackOrder = productItemsParamsDtoData.isWebBackOrder;
        setProductItems.push(productItem);
      }
      const result =
        this.checkoutCommonService.confirmPurchaseProductType(setProductItems);
      return {
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      };
    } catch (error) {
      this.commonService.logException(
        'method confirmPurchaseProductType error',
        error,
      );
      return { status: 0 };
    }
  }

  @Post('/checkIllegalCharacters')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkIllegalCharacters(@Body() IllegalCharactersParams: any) {
    const result = await this.checkoutCommonService.hasIllegalCharacters(
      IllegalCharactersParams.stringToCheck,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }
}
