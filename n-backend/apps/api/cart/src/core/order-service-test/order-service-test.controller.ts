/* eslint-disable no-else-return */
import { OrderService } from '@cainz-next-gen/order';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { AuthGuard } from '@cainz-next-gen/guard';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { CommonService } from '@cainz-next-gen/common';
import { getCartData } from '../../data_json/data';
import { CartErrorMessage, ErrorCode } from '../../types/constants/error-code';
import { CartCommonService } from '../cart-common/cart-common.service';
import { CartService } from '../cart/cart.service';

@Controller('order-service-test')
export class OrderServiceTestController {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly cartCommonService: CartCommonService,
    private readonly httpService: HttpService,
  ) {}

  @Post('')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getInvalidWebBackOrderFlagValue(
    @Body() getInvalidWebBackOrderParams: any,
  ) {
    try {
      const result = this.orderService.getInvalidWebBackOrderFlagValue(
        getInvalidWebBackOrderParams.invalidWebBackOrderFlag,
        getInvalidWebBackOrderParams.onlineSalesCategory,
        getInvalidWebBackOrderParams.customizedProductCategory,
        getInvalidWebBackOrderParams.dropShippingCategory,
        getInvalidWebBackOrderParams.supportBackOrder,
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
          message:
            CartErrorMessage[ErrorCode.GET_INVALID_WEB_BACK_ORDER_FLAG_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('maximum-minimum-step-quantity-check')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getCheckMaximumAndMinimumAndStepQuantity(
    @Body() getcheckMaximumAndMinimumAndStepQuantityDto: any,
  ) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      const productItem = (await getProductItems).productItems[0];
      const setProductItems = [];
      for (
        let i = 0;
        i < getcheckMaximumAndMinimumAndStepQuantityDto.data.length;
        i++
      ) {
        const getcheckMaximumAndMinimumAndStepQuantityDtoData =
          getcheckMaximumAndMinimumAndStepQuantityDto.data[i];
        const dummyProductItem = JSON.parse(JSON.stringify(productItem));

        if (
          getcheckMaximumAndMinimumAndStepQuantityDtoData.receivingMethod ===
          '1'
        ) {
          dummyProductItem.product.minOrderQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.minOrderQuantity;
          dummyProductItem.product.maxOrderQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.maxOrderQuantity;
          dummyProductItem.product.stepQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.stepQuantity;
        }
        if (
          getcheckMaximumAndMinimumAndStepQuantityDtoData.receivingMethod ===
          '2'
        ) {
          dummyProductItem.product.storeMinOrderQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.storeMinOrderQuantity;
          dummyProductItem.product.storeMaxOrderQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.storeMaxOrderQuantity;
          dummyProductItem.product.storeStepOrderQuantity =
            getcheckMaximumAndMinimumAndStepQuantityDtoData.storeStepOrderQuantity;
        }
        dummyProductItem.receivingMethod =
          getcheckMaximumAndMinimumAndStepQuantityDtoData.receivingMethod;
        dummyProductItem.quantity =
          getcheckMaximumAndMinimumAndStepQuantityDtoData.quantity;
        setProductItems.push(dummyProductItem);
      }
      const result =
        this.cartCommonService.checkMaximumAndMinimumAndStepQuantity(
          setProductItems,
        );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      };
    } catch (error) {
      this.commonService.logException(
        'method checkMaximumAndMinimumAndStepQuantity error',
        error,
      );
      return { status: 0, error: [] };
    }
  }

  @Post('/getProduct')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getProduct(@Body() getProductParams: any) {
    const result = this.orderService.getProduct(
      getProductParams.productIds,
      getProductParams.storeCodes,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/getStore')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getStore(@Body() getStoreParams: any) {
    const result = this.orderService.getStore(getStoreParams.storeCodes);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/checkPurchaseAtSameTime')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkPurchaseAtSameTime(@Body() canBePurchaseAtSameTimeParamsDto: any) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      const productItems = (await getProductItems).productItems[0];
      const setProductItems = [];
      for (let i = 0; i < canBePurchaseAtSameTimeParamsDto.data.length; i++) {
        const canBePurchaseAtSameTimeParamsDtoData =
          canBePurchaseAtSameTimeParamsDto.data[i];
        const productItem = JSON.parse(JSON.stringify(productItems));

        productItem.checkoutStatus =
          canBePurchaseAtSameTimeParamsDtoData.checkoutStatus;
        productItem.isCheckoutTarget =
          canBePurchaseAtSameTimeParamsDtoData.isCheckoutTarget;
        productItem.receivingMethod =
          canBePurchaseAtSameTimeParamsDtoData.receivingMethod;
        productItem.product.dropShippingCategory =
          canBePurchaseAtSameTimeParamsDtoData.dropShippingCategory;
        productItem.product.customizedProductCategory =
          canBePurchaseAtSameTimeParamsDtoData.customizedProductCategory;
        setProductItems.push(productItem);
      }
      const result =
        this.cartCommonService.canBePurchasedAtTheSameTime(setProductItems);
      return {
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      };
    } catch (error) {
      this.commonService.logException(
        'method canBePurchasedAtTheSameTime error',
        error,
      );
      return { status: 0, error: [] };
    }
  }

  @Post('/getIndividualShippingFee')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async cart(@Body() getIndividualShippingFeeParams: any) {
    const result = this.orderService.getIndividualShippingFee(
      getIndividualShippingFeeParams.receivingMethod,
      getIndividualShippingFeeParams.deliveryChargeCategoryEc,
      getIndividualShippingFeeParams.individualDeliveryChargeEc,
      getIndividualShippingFeeParams.quantity,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }

  @Post('/selectProductPrice')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async selectProductPrice(@Body() selectProductPriceParams: any) {
    const result = this.orderService.selectProductPrice(
      selectProductPriceParams?.productItem,
      selectProductPriceParams?.storeCode,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }

  @Post('/getMember')
  @UseGuards(AuthGuard)
  async getMember(@Body() getMemberParams: any) {
    const result = await this.orderService.getMember(getMemberParams.userId);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('calculate-cart-amount')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async calculateCartAmount(@Body() calculateCartAmountDto: any) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      const productItem = (await getProductItems).productItems[0];
      const setProductItems = [];
      for (
        let i = 0;
        i < calculateCartAmountDto.data.productItems.length;
        i++
      ) {
        const calculateCartAmountDtoProductItemData =
          calculateCartAmountDto.data.productItems[i];
        const dummyProductItem = JSON.parse(JSON.stringify(productItem));
        dummyProductItem.receivingMethod =
          calculateCartAmountDtoProductItemData.receivingMethod;
        dummyProductItem.subtotalProductAmount =
          calculateCartAmountDtoProductItemData.subtotalProductAmount;
        dummyProductItem.subtotalIndividualShippingCost =
          calculateCartAmountDtoProductItemData.subtotalIndividualShippingCost;
        setProductItems.push(dummyProductItem);
      }
      this.logger.info(
        `Data for user info ${JSON.stringify(
          calculateCartAmountDto.data.userinfo,
        )}`,
      );

      this.logger.info(
        `Data for product Items  ${JSON.stringify(setProductItems)}`,
      );
      const result = await this.cartCommonService.calculateCartAmount(
        setProductItems,
        calculateCartAmountDto.data.userinfo,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        result,
      };
    } catch (error) {
      this.commonService.logException(
        'method calculateCartAmount error',
        error,
      );
      return { status: 0, error: [] };
    }
  }

  @Post('/canBePurchased')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async canBePurchased(@Body() productItems: any) {
    const result = await this.orderService.canBePurchased(productItems);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/checkNonDelivery')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkNonDelivery(@Body() checkNonDeliveryProductItemsParams: any) {
    const result = await this.orderService.checkNonDelivery(
      checkNonDeliveryProductItemsParams.productItems,
      checkNonDeliveryProductItemsParams.deliveryInfo,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/renewProductItems')
  async renewProductItems(@Body() renewProductItemsParams: any) {
    const result = await this.orderService.renewProductItems(
      renewProductItemsParams.productItems,
      renewProductItemsParams.products,
      renewProductItemsParams.isMember,
      renewProductItemsParams.storeInfo,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/getUser')
  @UseGuards(AuthGuard)
  async getUser(@Body() getUserParams: any) {
    const result = await this.orderService.getUser(getUserParams.userId);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/getShippingCost')
  @UseGuards(AuthGuard)
  async getShippingCost(@Body() getShippingCostParams: any) {
    const result = await this.orderService.getShippingCost(
      getShippingCostParams.productItems,
      getShippingCostParams.userInfo,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('needs-item-creation')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async needsItemCreation(@Body() needsItemCreationDto: any) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      const productItem = (await getProductItems).productItems[0];
      let setProductItems = [];
      if (needsItemCreationDto.productItems !== null) {
        for (let i = 0; i < needsItemCreationDto.productItems.length; i++) {
          const needsItemCreationDtoProductItemData =
            needsItemCreationDto.productItems[i];
          const dummyProductItem = JSON.parse(JSON.stringify(productItem));
          dummyProductItem.productId =
            needsItemCreationDtoProductItemData.productId;
          dummyProductItem.orderSpecification =
            needsItemCreationDtoProductItemData.orderSpecification;
          setProductItems.push(dummyProductItem);
        }
      } else {
        setProductItems = null;
      }

      this.logger.info(
        `Data for product Items  ${JSON.stringify(setProductItems)}`,
      );
      const result = await this.cartCommonService.needsItemCreation(
        needsItemCreationDto.productId,
        needsItemCreationDto.orderSpecification,
        setProductItems,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        result,
      };
    } catch (error) {
      this.commonService.logException('method needsItemCreation error', error);
      return { status: 0, error: [] };
    }
  }

  @Post('/createCartsToDb')
  @UseGuards(AuthGuard)
  async createCartsToDb(@Body() getUserParams: any, @Req() req: Request) {
    const result = await this.orderService.createCartsToDb(
      getUserParams.userId,
      getUserParams.isMember,
      req,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/checkInventory')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkStockAvailability(
    @Body() checkInventoryParams: any,
    @Body() requestForWebBackOrderParam: any,
  ) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      if (
        getProductItems.productItems.length >= 1 &&
        checkInventoryParams.productItems.length >= 1
      ) {
        const finalProductItems = (await getProductItems).productItems[0];
        const setProductItems = [];
        let setWebBackOrder: boolean;

        for (let i = 0; i < checkInventoryParams.productItems.length; i++) {
          const checkInventoryParamsData = checkInventoryParams.productItems[i];
          const productItem = JSON.parse(JSON.stringify(finalProductItems));

          productItem.itemId = checkInventoryParamsData.itemId;
          productItem.receivingMethod =
            checkInventoryParamsData.receivingMethod;

          productItem.productId = checkInventoryParamsData.productId;

          productItem.quantity = checkInventoryParamsData.quantity;

          productItem.product.customizedProductCategory =
            checkInventoryParamsData.customizedProductCategory;

          productItem.invalidWebBackOrderFlagForDesignatedDelivery =
            checkInventoryParamsData.invalidWebBackOrderFlagForDesignatedDelivery;

          productItem.invalidWebBackOrderFlagForStorePickup =
            checkInventoryParamsData.invalidWebBackOrderFlagForStorePickup;

          productItem.product.inventories[0].quantityAvailable =
            checkInventoryParamsData.product.inventories[0].quantityAvailable;

          setProductItems.push(productItem);
          setWebBackOrder = requestForWebBackOrderParam.requestForWebBackOrder;
        }
        const result = this.orderService.checkInventory(
          setProductItems,
          setWebBackOrder,
        );
        return {
          code: HttpStatus.OK,
          message: 'ok',
          data: result,
        };
      } else {
        return { status: 0, error: [] };
      }
    } catch (error) {
      this.commonService.logException('method checkInventory error', error);
      return { status: 0, error: [] };
    }
  }

  @Post('/updateCartsToDb')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async updateCartsToDb(@Body() updateCartsToDbParams: any) {
    const result = await this.orderService.updateCartsToDb(
      updateCartsToDbParams.cartInUse,
      updateCartsToDbParams.productItems,
      updateCartsToDbParams.storeCode,
      updateCartsToDbParams.shippingAddress,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/createProductItem')
  @UseGuards(AuthGuard)
  async createProductItem(@Body() createProductItem: any) {
    const result = await this.cartCommonService.createProductItem(
      createProductItem.itemData,
      createProductItem.products,
      createProductItem.isMember,
      createProductItem.storeCode,
      createProductItem.storeInfo,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/setAmazonPayButtonConfig')
  @UseGuards(AuthGuard)
  async setAmazonPayButtonConfig(@Body() setAmazonPayButtonConfigBody: any) {
    const result = await this.orderService.setAmazonPayButtonConfig(
      setAmazonPayButtonConfigBody.amazonPayTotalAmount,
      setAmazonPayButtonConfigBody.placement,
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
    const result = await this.cartCommonService.checkoutCanBeStarted(
      checkoutCanBeStartedBody.cartData,
      checkoutCanBeStartedBody.selectedItems,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('get-receipt-method-pattern')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getReceiptMethodPattern(@Body() getReceiptMethodPatternDto: any) {
    try {
      const getProductItems = await this.cartService.getCart('123');
      const productItem = (await getProductItems).productItems[0];
      let setProductItems = [];
      if (getReceiptMethodPatternDto.productItems !== null) {
        for (
          let i = 0;
          i < getReceiptMethodPatternDto.productItems.length;
          i++
        ) {
          const getReceiptMethodPatternData =
            getReceiptMethodPatternDto.productItems[i];
          const dummyProductItem = JSON.parse(JSON.stringify(productItem));
          dummyProductItem.receivingMethod =
            getReceiptMethodPatternData.receivingMethod;
          dummyProductItem.isCheckoutTarget =
            getReceiptMethodPatternData.isCheckoutTarget;
          setProductItems.push(dummyProductItem);
        }
      } else {
        setProductItems = null;
      }
      const result = await this.orderService.getReceiptMethodPattern(
        setProductItems,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        result,
      };
    } catch (error) {
      this.commonService.logException(
        'method getReceiptMethodPattern error',
        error,
      );
      return { status: 0, error: [] };
    }
  }

  @Post('/getCartsFromDb')
  @UseGuards(AuthGuard)
  async getCartsFromDb(@Body() getCartsFromDbParams: any) {
    const result = await this.orderService.getCartsFromDb(
      getCartsFromDbParams.cartInUse,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      result,
    };
  }

  @Post('/getCreditCards')
  @UseGuards(AuthGuard)
  getCreditCards(@Body() getParams: any) {
    const result = this.orderService.getCreditCards(getParams.memberId);
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
      const result = this.cartCommonService.getSelectablePickUpLocation(
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

  @Post('/getEcTemplate')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getEcTemplateRecord(@Body() templateIdParams: any) {
    try {
      const result = this.orderService.getEcTemplate(
        templateIdParams.templateIds,
      );
      return {
        code: HttpStatus.OK,
        message: 'ok',
        result,
      };
    } catch (error) {
      this.commonService.logException(
        'method getEcTemplateRecord error',
        error,
      );
      return { status: 0, informations: null };
    }
  }
}
