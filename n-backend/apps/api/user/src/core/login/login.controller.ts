import { Request } from 'express';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommonService } from '@fera-next-gen/common';
import { Claims } from '@fera-next-gen/types';
import { SalesforceApiService } from '@fera-next-gen/salesforce-api';
import { AuthGuard } from '@fera-next-gen/guard';
import { ConfigService } from '@nestjs/config';
import { LoginService } from './login.service';
import { TokenData } from './interface/login.interface';

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly salesforceApiService: SalesforceApiService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async login(
    @Req() req: Request & { claims?: Claims },
    @Body() body: { code: string },
  ) {
    const userClaims: Claims = req.claims;
    const { userId } = userClaims;

    const tokenData: TokenData = await this.salesforceApiService.getUserToken(
      body.code,
    );

    const salesforceUserId =
      await this.salesforceApiService.getSalesforceUserId(
        tokenData.accessToken,
      );

    const userInfo = await this.loginService.getUserInfo(salesforceUserId);

    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');
    const encryptedMemberId = this.commonService.encryptAES256(
      userInfo.cardNoContact,
      key,
      iv,
    );
    await this.loginService.saveToFirebaseAuthClaims(
      userId,
      encryptedMemberId,
      tokenData,
    );

    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    await this.loginService.transferToMember(
      userId,
      encryptedMemberId,
      operatorName,
      userInfo,
    );

    return {
      code: HttpStatus.CREATED,
      message: 'ok',
      data: {
        memberId: userInfo.cardNoContact,
        address1: userInfo.address1,
        address2: userInfo.address2,
        address3: userInfo.address3,
      },
    };
  }
}
