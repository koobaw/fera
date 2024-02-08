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
import { MemberAuthGuard } from '@cainz-next-gen/guard';
import { PrivateProfileService } from './private-profile.service';

@Controller('member/private-profile')
export class PrivateProfileController {
  constructor(
    private readonly privateProfileService: PrivateProfileService,
    private readonly salesforceApiService: SalesforceApiService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/')
  @UseGuards(MemberAuthGuard)
  async getPrivateProfile(
    @Req() req: Request & { claims?: Claims },
    @Query('select') select?: string,
  ) {
    const targets = select == null ? [] : select.split(',');
    const userClaims: Claims = req.claims;

    // get user id from saleseforce
    let salesforceUserId: string;
    try {
      salesforceUserId = await this.salesforceApiService.getSalesforceUserId(
        userClaims.accessToken,
      );
    } catch (_error) {
      // NOTE: can't judge http error or access token expired, so refresh token and retry if failed
      userClaims.accessToken =
        await this.salesforceApiService.refreshAccessToken(
          userClaims.refreshToken,
        );
      await this.commonService.saveToFirebaseAuthClaims(
        userClaims.userId,
        userClaims.encryptedMemberId,
        userClaims.accessToken,
        userClaims.refreshToken,
      );
      salesforceUserId = await this.salesforceApiService.getSalesforceUserId(
        userClaims.accessToken,
      );
    }

    // get user data and insert latest user data to firestore
    const membershipRecord =
      await this.privateProfileService.getMuleMembershipRecord(
        salesforceUserId,
      );
    const privateProfile =
      this.privateProfileService.convertProfileFromUMembershipRecord(
        membershipRecord,
        targets,
      );
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    await this.privateProfileService.updateUserSchema(
      membershipRecord.membershipLevel,
      userClaims.encryptedMemberId,
      operatorName,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: privateProfile,
    };
  }
}
