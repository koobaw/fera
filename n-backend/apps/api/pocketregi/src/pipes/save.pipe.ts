import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ErrorCode, ErrorMessage } from '../types/constants/error-code';

const SAVE = {
  TRUE: 'true',
  FALSE: 'false',
} as const;

@Injectable()
export class TransformSavePipe implements PipeTransform<string, boolean> {
  transform(value: string | undefined): boolean {
    if (typeof value === 'undefined') {
      // 値省略時はfalseとみなす
      return false;
    }
    switch (value) {
      case SAVE.TRUE:
        return true;
      case SAVE.FALSE:
        return false;
      default:
        throw new HttpException(
          {
            errorCode: ErrorCode.PARAM_BAD_PARAMETER_UPDATE_MEMBERSHIPRANK,
            message:
              ErrorMessage[ErrorCode.PARAM_BAD_PARAMETER_UPDATE_MEMBERSHIPRANK],
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
