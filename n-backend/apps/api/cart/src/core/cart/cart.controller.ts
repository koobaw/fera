import {
  HttpStatus,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpCode,
  Patch,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { Claims } from '@cainz-next-gen/types';
import { LoggingService } from '@cainz-next-gen/logging';
import { CartService } from './cart.service';
import { FromUserDto, ToUserDto } from './dto/mergeCart.dto';
import { CartAddItemDto } from './dto/post.cart-add-item-body.dto';
import { CartErrorMessage, ErrorCode } from '../../types/constants/error-code';
import { CartChangeDto } from './dto/patch.cart-change-item-body.dto';

@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly logger: LoggingService,
  ) {}

  @Get(':userId')
  @UseGuards(AuthGuard)
  async getCart(@Param('userId') userId: string) {
    const result = await this.cartService.getCart(userId);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }

  @Post('/merge')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async mergeCart(@Req() req, @Body() { fromUserId }: FromUserDto) {
    const claims = req.claims as Claims;
    const { userId } = claims; // future we want use this one instead  of toUserId
    const toUserId = '07P1He8a0Ze4OlTCpWf3F3M469H1';
    await this.cartService.mergeCarts(toUserId, fromUserId);
    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }

  @Delete('items/:itemId')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async deleteCartItem(@Req() req, @Param('itemId') itemId: string) {
    const claims = req.claims as Claims;
    const { userId } = claims;
    const cartDeleteResponse = await this.cartService.deleteCartItem(
      userId,
      itemId,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: cartDeleteResponse,
    };
  }

  @Post('items')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async cartAddItem(@Req() req, @Body() cartAddItem: CartAddItemDto) {
    try {
      const claims = req.claims as Claims;
      const { userId } = claims;
      const cartData = await this.cartService.cartAddItem(userId, cartAddItem);
      return { code: HttpStatus.OK, message: 'ok', data: cartData };
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: CartErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch()
  @UseGuards(AuthGuard)
  async cartChange(@Req() req, @Body() cartChangeDto: CartChangeDto) {
    try {
      const claims = req.claims as Claims;
      const { userId } = claims;
      const cartChangeData = await this.cartService.cartChange(
        userId,
        cartChangeDto,
      );
      return { code: HttpStatus.OK, message: 'ok', data: cartChangeData };
    } catch (error) {
      this.logger.error(`error ${error}`);
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: CartErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
