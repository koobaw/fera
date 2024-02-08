import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ErrorMessage } from './error-code';

@Injectable()
export class SalesforceAuthGuard implements CanActivate {
  constructor(private readonly env: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const clientId = request.headers?.client_id;
    const clientSecret = request.headers?.client_secret;

    if (
      clientId &&
      typeof clientId === 'string' &&
      clientSecret &&
      typeof clientSecret === 'string'
    ) {
      await this.authenticateSalesforceLogin(clientId, clientSecret);
      return true;
    }

    throw new HttpException(
      {
        errorCode: ErrorCode.INVALID_HEADER,
        message: ErrorMessage[ErrorCode.INVALID_HEADER],
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async authenticateSalesforceLogin(client_id: string, client_secret) {
    if (
      client_id === this.env.get<string>('POCKET_REGI_RETURN_CLIENT_ID') &&
      client_secret === this.env.get<string>('POCKET_REGI_RETURN_CLIENT_SECRET')
    ) {
      return true;
    }
    throw new HttpException(
      {
        errorCode: ErrorCode.UNAUTHORIZED_ACCESS,
        message: ErrorMessage[ErrorCode.UNAUTHORIZED_ACCESS],
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
