import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { FindInventoriesDto } from '../dto/find.inventories.dto';
import { MuleProductInventoryResponseSuccess } from '../interfaces/mule-api.interface';

@Injectable()
export class InventoriesMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchInventories(
    findInventoriesDto: FindInventoriesDto,
    coefficient: number,
  ): Promise<Array<MuleProductInventoryResponseSuccess>> {
    this.logger.debug('start fetchInventories');
    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };
    const url = `${this.env.get<string>(
      'MULE_API_BASE_URL',
    )}${this.env.get<string>('MULE_API_INVENTORY_ENDPOINT')}?stores=${
      findInventoriesDto.storeCodes
    }&products=${findInventoriesDto.productIds}&coefficient=${coefficient}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Mule API occurred Error', error);
          throw new HttpException(
            {
              errorCode: ErrorCode.INVENTORY_NG_MULE_INVENTORY_API,
              message: ErrorMessage[ErrorCode.INVENTORY_NG_MULE_INVENTORY_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const inventories = data as Array<MuleProductInventoryResponseSuccess>;
    this.logger.debug('end fetchInventories');

    return inventories;
  }
}
