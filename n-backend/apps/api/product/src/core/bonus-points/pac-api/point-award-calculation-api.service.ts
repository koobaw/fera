import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import {
  PACItemErrorResponse,
  PACItemResponseSuccess,
} from '../interfaces/pac-api.interface';

@Injectable()
export class PointAwardCalculationApiService {
  PAC_SUCCESS_CODE = '0000';

  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async getPoint(
    storeCodes: string[],
    productIds: string[],
    membershipRank: string,
  ): Promise<PACItemResponseSuccess> {
    this.logger.debug('start getPoint');

    const headers = {
      'x-api-key': this.env.get<string>('PAC_API_KEY'),
      'Content-Type': 'text/plain',
    };
    const url = `${this.env.get<string>('PAC_BASE_URL')}${this.env.get<string>(
      'PAC_PRODUCT_ENDPOINT',
    )}`;
    const body = {
      STORE_CODE: storeCodes.reduce(
        (acc, code, index) => ({ ...acc, [`STORE${index + 1}`]: code }),
        {},
      ),
      JAN_CODE: productIds.reduce(
        (acc, jan, index) => ({ ...acc, [`JAN${index + 1}`]: jan }),
        {},
      ),
      MEMBER_RANK: membershipRank,
    };

    const { data } = await firstValueFrom(
      this.httpService.post(url, body, { headers }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('PAC API occurred Error', error);
          throw new HttpException(
            {
              errorCode: ErrorCode.BONUS_POINT_NG_PAC_API,
              message: ErrorMessage[ErrorCode.BONUS_POINT_NG_PAC_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`PAC api url: ${url}`);
    this.logger.debug(`PAC api response: ${JSON.stringify(data)}`);

    // 結果コードが正常ではない場合、エラーにする
    const isFailure = (resData): resData is PACItemErrorResponse =>
      resData.RESULT_CODE !== this.PAC_SUCCESS_CODE;

    if (isFailure(data)) {
      this.commonService.logException('PAC API code Error', data);
      throw new HttpException(
        {
          errorCode: ErrorCode.BONUS_POINT_NG_PAC_API,
          message: ErrorMessage[ErrorCode.BONUS_POINT_NG_PAC_API],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const points = data as PACItemResponseSuccess;
    this.logger.debug('end getPoint');

    return points;
  }
}
