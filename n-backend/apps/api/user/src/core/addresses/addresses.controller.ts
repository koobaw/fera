import { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Post,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MemberAuthGuard } from '@fera-next-gen/guard';
import { Claims } from '@fera-next-gen/types';
import { CommonService } from '@fera-next-gen/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@fera-next-gen/logging';
import { RegisterAddressesService } from './register.addresses/register.addresses.service';
import { RegisterAddressesBodyDto } from './dto/register.addresses-body.dto';
import { FindAddressesService } from './find.addresses/find.addresses.service';
import { FindAddressesQueryDto } from './dto/find.address-query.dto';
import { UpdateAddressesService } from './update.addresses/update.addresses.service';
import { UpdateAddressParamDto } from './dto/update.address-param.dto';
import { UpdateAddressBodyDto } from './dto/update.address-body.dto';

@Controller('/member/addresses')
export class AddressesController {
  constructor(
    private readonly registerAddressesService: RegisterAddressesService,
    private readonly updateAddressesService: UpdateAddressesService,
    private readonly findAddressesService: FindAddressesService,
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
  ) {}

  @Get('/')
  @UseGuards(MemberAuthGuard)
  public async getAddresses(
    @Req() req: Request & { claims?: Claims },
    @Query() queryDto: FindAddressesQueryDto,
  ) {
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;

    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');
    const memberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );

    const data = await this.findAddressesService.getAddresses(
      memberId,
      queryDto.isFavorite,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
      data,
    };
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MemberAuthGuard)
  public async registerAddress(
    @Req() req: Request & { claims?: Claims },
    @Body() registerAddressRequestBody: RegisterAddressesBodyDto,
  ) {
    if (!registerAddressRequestBody) {
      this.logger.warn('request body is empty!');
      return {
        code: HttpStatus.BAD_REQUEST,
        message: 'request body must be not empty',
      };
    }
    const { encryptedMemberId } = req.claims;
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');
    const memberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    await this.registerAddressesService.registerAddressees(
      memberId,
      registerAddressRequestBody,
    );
    return {
      code: HttpStatus.CREATED,
      message: 'ok',
    };
  }

  @Put(':addressId')
  @UseGuards(MemberAuthGuard)
  public async updateAddress(
    @Param() updateAddressParamDto: UpdateAddressParamDto,
    @Body() updateAddressBodyDto: UpdateAddressBodyDto,
  ) {
    this.updateAddressesService.updateAddress(
      updateAddressParamDto,
      updateAddressBodyDto,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }
}
