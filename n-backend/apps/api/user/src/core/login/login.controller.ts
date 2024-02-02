import { Request } from 'express';
import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommonService } from '@cainz-next-gen/common';
import { Claims } from '@cainz-next-gen/types';
import { SalesforceApiService } from '@cainz-next-gen/salesforce-api';
import { AuthGuard } from '@cainz-next-gen/guard';
import { CryptoUtilsService } from '../../utils/crypto.service';
import { LoginService } from './login.service';
import { TokenData } from './interface/login.interface';

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly crypto: CryptoUtilsService,
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

    const memberId = await this.loginService.getUserInfo(salesforceUserId);

    const encryptedMemberId = this.crypto.encryptAES256(memberId);
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
    );

    return {
      code: HttpStatus.CREATED,
      message: 'ok',
      data: { memberId },
    };
  }
}
