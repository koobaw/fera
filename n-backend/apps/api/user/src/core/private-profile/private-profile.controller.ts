import { Request } from 'express';
import { CommonService } from '@cainz-next-gen/common';
import { SalesforceApiService } from '@cainz-next-gen/salesforce-api';
import { Claims } from '@cainz-next-gen/types';
import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@cainz-next-gen/guard';
import { PrivateProfileService } from './private-profile.service';

@Controller('member/private-profile')
export class PrivateProfileController {
  constructor(
    private readonly privateProfile: PrivateProfileService,
    private readonly salesforceApi: SalesforceApiService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async getPrivateProfile(
    @Req() req: Request & { claims?: Claims },
    @Query('select') select?: string,
  ) {
    const targets = select == null ? [] : select.split(',');
    const userClaims: Claims = req.claims;

    let salesforceUserId: string;
    try {
      salesforceUserId = await this.salesforceApi.getSalesforceUserId(
        userClaims.accessToken,
      );
    } catch (_error) {
      // NOTE: can't judge http error or access token expired, so refresh token and retry if failed
      userClaims.accessToken = await this.salesforceApi.refreshAccessToken(
        userClaims.refreshToken,
      );
      await this.commonService.saveToFirebaseAuthClaims(
        userClaims.userId,
        userClaims.encryptedMemberId,
        userClaims.accessToken,
        userClaims.refreshToken,
      );
      salesforceUserId = await this.salesforceApi.getSalesforceUserId(
        userClaims.accessToken,
      );
    }

    const privateProfile = await this.privateProfile.getPrivateProfile(
      salesforceUserId,
    );

    if (targets.length !== 0) {
      Object.keys(privateProfile)
        .filter((key) => !targets.includes(key))
        .forEach((target) => {
          delete privateProfile[target];
        });
    }

    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: privateProfile,
    };
  }
}
