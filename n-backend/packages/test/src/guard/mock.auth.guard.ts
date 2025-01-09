import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export class MockAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const feraappApiKey = req.headers?.['feraapp-api-key'];
    if (feraappApiKey && typeof feraappApiKey === 'string') {
      return true;
    }

    const authorizationHeader = req.headers?.authorization;
    if (authorizationHeader && typeof authorizationHeader === 'string') {
      req.claims = {
        userId: 'dummyUserId',
        encryptedMemberId: 'dummyEncryptedMemberId',
        accessToken: 'dummyAccessToken',
        refreshToken: 'dummyRefreshToken',
      };
      return true;
    }
    throw new HttpException(
      {
        message: 'invalid user',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
