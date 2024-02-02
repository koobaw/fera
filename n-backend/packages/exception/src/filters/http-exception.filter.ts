import { Request, Response } from 'express';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { CainzAppError, ErrorMessage, GlobalErrorCode } from '../error-code';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  logger: LoggingService;

  commonService: CommonService;

  constructor(logger: LoggingService, commonService: CommonService) {
    this.logger = logger;
    this.commonService = commonService;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'];
    const correlationId = request.headers['x-correlation-id'];

    // TODO objectの場合はstringifyする
    this.logger.error(
      JSON.stringify({
        url: request.url,
        requestBody: request.body,
        requestId,
        correlationId,
      }),
    );
    this.logger.error('Exception', exception.toString());

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // 各サービスで定義しているエラー
      if (this.isCainzAppErrorCode(exceptionResponse)) {
        response.status(status).json({
          code: status,
          errorCode: exceptionResponse.errorCode,
          message:
            exceptionResponse.message ??
            ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
          requestId,
          timestamp: this.commonService.getDateTimeStringJST(),
        });
        // 全体で統一して定義しているエラー
      } else if (this.isGlobalErrorCode(exceptionResponse)) {
        response.status(status).json({
          code: status,
          errorCode: exceptionResponse,
          message: ErrorMessage[exceptionResponse],
          requestId,
          timestamp: this.commonService.getDateTimeStringJST(),
        });
        // class-validateやnestjsが投げるエラー
      } else if (this.hasMessage(exceptionResponse)) {
        response.status(status).json({
          code: status,
          errorCode:
            status === 400
              ? GlobalErrorCode.BAD_PARAMETER
              : GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: `${ErrorMessage[GlobalErrorCode.BAD_PARAMETER]},${
            typeof exceptionResponse.message === 'string'
              ? exceptionResponse.message
              : exceptionResponse.message.join()
          }`,
          requestId,
          timestamp: this.commonService.getDateTimeStringJST(),
        });
      } else if (typeof exceptionResponse === 'string') {
        response.status(status).json({
          code: status,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: exceptionResponse,
          requestId,
          timestamp: this.commonService.getDateTimeStringJST(),
        });
      } else {
        response.status(status).json({
          code: status,
          errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
          requestId,
          timestamp: this.commonService.getDateTimeStringJST(),
        });
      }
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: GlobalErrorCode.INTERNAL_SERVER_ERROR,
        message: ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
        requestId,
        timestamp: this.commonService.getDateTimeStringJST(),
      });
    }
  }

  private isGlobalErrorCode(code: string | object): code is GlobalErrorCode {
    if (typeof code === 'object') {
      return false;
    }
    if (Object.values(GlobalErrorCode).includes(code as GlobalErrorCode)) {
      return true;
    }
    return false;
  }

  private isCainzAppErrorCode(code: string | object): code is CainzAppError {
    if (typeof code === 'string') {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(code, 'errorCode')) {
      return true;
    }
    return false;
  }

  private hasMessage(
    code: string | object,
  ): code is { message: string[] | string } {
    if (typeof code === 'string') {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(code, 'message')) {
      return true;
    }
    return false;
  }
}
