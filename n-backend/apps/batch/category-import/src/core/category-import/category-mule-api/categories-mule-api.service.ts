import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { MuleCategoryResponse } from '../interfaces/mule-api.interface';

@Injectable()
export class CategoriesMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchCategories(
    codes: string,
  ): Promise<Array<MuleCategoryResponse>> {
    this.logger.debug('start fetchCategories');

    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };

    const url = `${this.env.get<string>(
      'MULE_API_BASE_URL',
    )}${this.env.get<string>(
      'MULE_API_CATEGORY_ENDPOINT',
    )}?categories=${codes}&fields=pctg,level,pstatus,imgurl,description,dsporder,children`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Mule API occurred Error', error);

          throw new HttpException(
            {
              errorCode: ErrorCode.CATEGORY_NG_MULE_CATEGORY_API,
              message: ErrorMessage[ErrorCode.CATEGORY_NG_MULE_CATEGORY_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const categories = data as Array<MuleCategoryResponse>;
    this.logger.debug('end fetchCategories');

    return categories;
  }
}
