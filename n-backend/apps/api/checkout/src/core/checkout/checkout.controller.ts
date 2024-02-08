import {
  Body,
  Controller,
  Param,
  HttpStatus,
  HttpException,
  Post,
  Patch,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { Claims } from '@cainz-next-gen/types';
import { CheckoutService } from './checkout.service';
import { CheckoutCompleteDto } from './dto/checkoutComplete.dto';
import { CheckoutBeginDto } from './dto/checkoutbegin.dto';
import { CheckoutComplete2Dto } from './dto/checkoutComplete2.dto';
import { CustomValidationPipe } from '../../pipes/customValidationPipe.pipe';
import { CheckoutChangeDto } from './dto/patch.checkout-change-item-body.dto';

@Controller()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkoutBegin(@Req() req, @Body() checkoutBeginDto: CheckoutBeginDto) {
    const claims = req.claims as Claims;
    const { userId } = claims;
    const result = await this.checkoutService.checkoutBegin(checkoutBeginDto);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }

  @Patch('/:checkoutId')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkoutChange(
    @Req() req,
    @Param('checkoutId') checkoutId: string,
    @Body() checkoutChangedto: CheckoutChangeDto,
  ) {
    const claims = req.claims as Claims;
    const { userId } = claims;
    const result = await this.checkoutService.checkoutChange(
      userId,
      checkoutId,
      checkoutChangedto,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }

  @Post('/:checkoutId/complete')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkoutComplete(
    @Req() req,
    @Param('checkoutId') checkoutId: string,
    @Body() checkoutCompleteDto: CheckoutCompleteDto,
  ) {
    const claims = req.claims as Claims;
    // const { userId } = claims; present not using userId, we use it in future based on requirement
    const checkoutCompleteData = await this.checkoutService.checkoutComplete(
      checkoutId,
      checkoutCompleteDto,
    );
    try {
      return {
        code: HttpStatus.OK,
        message: 'OK',
        result: checkoutCompleteData,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: true,
          message: 'failed to complete the checkout',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':checkoutId/complete2')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async checkoutComplete2(
    @Param('checkoutId') checkoutId: string,
    @Body(new CustomValidationPipe())
    checkoutComplete2dto: CheckoutComplete2Dto,
  ) {
    const result = await this.checkoutService.checkoutComplete2(
      checkoutId,
      checkoutComplete2dto,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: result,
    };
  }
}
