import { Request } from 'express';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { Claims } from '@fera-next-gen/types';

import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';
import { LogoutService } from './logout.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('member/logout')
export class LogoutController {
  constructor(
    private readonly commonService: CommonService,
    private readonly logoutService: LogoutService,
    private readonly logger: LoggingService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(@Req() req: Request & { claims?: Claims }) {
    const userClaims: Claims = req.claims;
    const { userId } = userClaims;
    this.logger.debug(`userId: ${userId}`);

    if (
      typeof userClaims.encryptedMemberId === 'undefined' ||
      userClaims.encryptedMemberId === ''
    ) {
      this.logger.error('claim is empty');
      throw new HttpException(
        {
          errorCode: ErrorCode.LOGOUT_CLAIM_EMPTY,
          message: ErrorMessage[ErrorCode.LOGOUT_CLAIM_EMPTY],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.logoutService.deleteFromFirebaseAuthClaims(userId);

    return { code: HttpStatus.OK, message: 'ok' };
  }
}
