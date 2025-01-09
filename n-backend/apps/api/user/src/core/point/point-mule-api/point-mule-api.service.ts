import { LoggingService } from '@fera-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { CommonService } from '@fera-next-gen/common';
import {
  MulePointServerErrorResponse,
  MulePointSuccessResponse,
} from '../interface/mule-api.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class PointMuleApiService {
  constructor(
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly httpService: HttpService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchPoint(memberId: string): Promise<MulePointSuccessResponse> {
    this.logger.info('start fetchPoint');

    const headers = {
      client_id: this.env.get<string>('MULE_YAP_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_YAP_API_CLIENT_SECRET'),
    };
    const params = {
      id: memberId,
    };

    const baseUrl = this.env.get<string>('MULE_EXP_YAP_API_BASE_URL');
    const endPoint = this.env.get<string>(
      'MULE_EXP_YAP_API_MEMBER_POINT_ENDPOINT',
    );

    const url = `${baseUrl}${endPoint}/${memberId}`;

    const { data } = await firstValueFrom<
      AxiosResponse<MulePointSuccessResponse>
    >(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError<MulePointServerErrorResponse>) => {
          this.commonService.logException('Mule API occurred Error', error);
          throw new HttpException(
            {
              errorCode: ErrorCode.MEMBER_POINT_GET_GET_POINT_FAILED,
              message:
                ErrorMessage[ErrorCode.MEMBER_POINT_GET_GET_POINT_FAILED],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.info('end fetchPoint');

    return data;
  }
}
