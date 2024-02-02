import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { getAuth } from 'firebase-admin/auth';

import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class LogoutService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async deleteFromFirebaseAuthClaims(userId: string) {
    this.logger.info('start deleteFromFirebaseAuthClaims');
    try {
      // firebase authのclaimを削除
      await getAuth().setCustomUserClaims(userId, null);
      this.logger.info(
        `user:${userId} auth claim is successfully deleted from firebase`,
      );
    } catch (e: unknown) {
      this.commonService.logException(
        'delete auth claim from firebase is failed',
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.LOGOUT_DELETE_FROM_CLAIM,
          message: ErrorMessage[ErrorCode.LOGOUT_DELETE_FROM_CLAIM],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end deleteFromFirebaseAuthClaims');
  }
}
