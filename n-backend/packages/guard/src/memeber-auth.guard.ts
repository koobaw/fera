import { CommonService } from '@fera-next-gen/common';
import { Claims } from '@fera-next-gen/types';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { ErrorCode, ErrorMessage } from './error-code';

@Injectable()
export class MemberAuthGuard implements CanActivate {
  constructor(private readonly commonService: CommonService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers?.authorization;
    const [, token] = authorizationHeader?.split(' ') || [];
    if (token && typeof token === 'string') {
      request.claims = await this.authenticateMemberLogin(token);
      return true;
    }
    throw new HttpException(
      {
        errorCode: ErrorCode.INVALID_USER,
        message: ErrorMessage[ErrorCode.INVALID_USER],
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * カインズメンバーとしてログインしているか確認
   * @param authorizationHeader
   * @returns {Claims} - firebaseAuth user claims
   */
  private async authenticateMemberLogin(token: string) {
    try {
      const decodedIdToken: DecodedIdToken = await getAuth().verifyIdToken(
        token,
      );
      const claims: Claims = {
        userId: decodedIdToken.user_id,
        encryptedMemberId: decodedIdToken.encryptedMemberId,
        accessToken: decodedIdToken.accessToken,
        refreshToken: decodedIdToken.refreshToken,
      };
      if (
        !claims.refreshToken ||
        !claims.accessToken ||
        !claims.encryptedMemberId
      ) {
        throw Error(ErrorMessage[ErrorCode.NOT_COMPLETED_MEMBER_LOGIN]);
      }
      return claims;
    } catch (e: unknown) {
      this.commonService.logException('Failed to verify idToken', e);
      throw new HttpException(
        {
          errorCode: ErrorCode.INVALID_MEMBER_USER,
          message: ErrorMessage[ErrorCode.INVALID_MEMBER_USER],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
