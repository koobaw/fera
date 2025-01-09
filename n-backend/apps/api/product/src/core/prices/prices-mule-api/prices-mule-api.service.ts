import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { FindPricesDto } from '../dto/find.prices.dto';
import {
  MuleProductPriceServerErrorResponse,
  MuleProductPriceSuccessResponse,
} from '../interfaces/price.interface';

@Injectable()
export class PricesMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchPrices(
    findPricesDto: FindPricesDto,
  ): Promise<MuleProductPriceSuccessResponse[]> {
    this.logger.debug('start fetchPrices');
    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };
    const params = {
      products: findPricesDto.productIds.join(','),
      stores: findPricesDto.storeCodes.join(','),
      rank: findPricesDto.membershipRank,
    };
    const url = `${this.env.get<string>(
      'MULE_API_BASE_URL',
    )}${this.env.get<string>('MULE_API_PRICE_ENDPOINT')}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError<MuleProductPriceServerErrorResponse>) => {
          this.commonService.logException('Mule API occurred Error', error);
          throw new HttpException(
            {
              errorCode: ErrorCode.PRICE_GET_MULE_PRICE_API,
              message: ErrorMessage[ErrorCode.PRICE_GET_MULE_PRICE_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api param: ${JSON.stringify(params)}`);

    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const products = data as MuleProductPriceSuccessResponse[];
    this.logger.debug('end fetchPrices');
    return products;
  }
}
