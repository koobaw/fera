import { AuthGuard } from '@cainz-next-gen/guard';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { Claims } from '@cainz-next-gen/types';

import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { LogoutService } from '../logout/logout.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { UnregisterService } from './unregister.service';

@Controller('member/unregister')
export class UnregisterController {
  constructor(
    private readonly commonService: CommonService,
    private readonly logoutService: LogoutService,
    private readonly unregisterService: UnregisterService,
    private readonly logger: LoggingService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async unregister(@Req() req) {
    const claims = req.claims as Claims;
    this.logger.debug(claims);
    if (
      typeof claims.encryptedMemberId === 'undefined' ||
      claims.encryptedMemberId === ''
    ) {
      this.logger.error('claim is empty');
      this.commonService.createHttpException(
        ErrorCode.UNREGISTER_CLAIM_EMPTY,
        ErrorMessage[ErrorCode.UNREGISTER_CLAIM_EMPTY],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const { userId } = claims;
    const { encryptedMemberId } = claims;

    await this.logoutService.deleteFromFirebaseAuthClaims(userId);
    await this.unregisterService.deleteFromFirestore(encryptedMemberId);

    return { code: HttpStatus.OK, message: 'ok' };
  }
}
