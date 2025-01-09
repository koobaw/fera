import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { Claims } from '@fera-next-gen/types';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ErrorMessage } from './error-code';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const feraappApiKey = request.headers?.['feraapp-api-key'];
    if (feraappApiKey && typeof feraappApiKey === 'string') {
      this.authenticateWebUser(feraappApiKey);
      return true;
    }

    const authorizationHeader = request.headers?.authorization;
    if (authorizationHeader && typeof authorizationHeader === 'string') {
      request.claims = await this.authenticateMobileUser(authorizationHeader);
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
   *  webからのアクセスの場合、feraapp-api-keyをチェックしてユーザーを認証する
   * @param feraappApiKey
   * @returns
   */
  private authenticateWebUser(feraappApiKey: string) {
    if (feraappApiKey === this.env.get<string>('feraAPP_API_KEY')) {
      return;
    }
    throw new HttpException(
      {
        errorCode: ErrorCode.INVALID_WEB_USER,
        message: ErrorMessage[ErrorCode.INVALID_WEB_USER],
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  /**
   * アプリからのアクセスの場合、idTokenをチェックしてユーザーを認証する
   * @param authorizationHeader
   * @returns {Claims} - firebaseAuth user claims
   */
  private async authenticateMobileUser(authorizationHeader: string) {
    const [, token] = authorizationHeader.split(' ') ?? [];
    try {
      const decodedIdToken = await getAuth().verifyIdToken(token);
      const claims: Claims = {
        userId: decodedIdToken.user_id,
        encryptedMemberId: decodedIdToken.encryptedMemberId,
        accessToken: decodedIdToken.accessToken,
        refreshToken: decodedIdToken.refreshToken,
      };
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
