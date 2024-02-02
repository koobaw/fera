import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ErrorCode, CartErrorMessage } from '../types/constants/error-code';

const IS_WEB = {
  TRUE: '1',
  FALSE: '0',
} as const;

@Injectable()
export class TransformIsWebPipe implements PipeTransform<string, boolean> {
  transform(value: string | undefined): boolean {
    switch (value) {
      case IS_WEB.TRUE:
        return false;
      case IS_WEB.FALSE:
        return true;
      default:
        throw new HttpException(
          {
            errorCode: ErrorCode.PARAM_BAD_PARAMETER_IS_WEB,
            message: CartErrorMessage[ErrorCode.PARAM_BAD_PARAMETER_IS_WEB],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
