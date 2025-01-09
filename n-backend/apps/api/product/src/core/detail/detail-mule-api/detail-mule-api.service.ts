import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

import { DetailDto } from '../dto/detail.dto';

@Injectable()
export class DetailMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  async getDetailFromMule(detailDto: DetailDto) {
    this.logger.debug('start get detail from mule');
    const productId = detailDto.productIds;
    // プラットフォーム側の準備ができたらこちらに切り替える想定;
    const muleFieldOption = [
      'department', // DPTコード
      'line', // ラインコード
      'class', // クラスコード
      'description', // 商品詳細説明
      'sc', // 販売制御フィールドセット
      'pi', // 商品特定フィールドセット
      'pd', // 商品説明フィールドセット
      'rp', // 関連商品フィールドセット
      'lm', // 物流管理フィールドセット
    ];
    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };
    const params = {
      codes: productId.join(','),
      fields: muleFieldOption.join(','),
    };
    const url = `${this.env.get<string>(
      'MULE_API_BASE_URL',
    )}${this.env.get<string>('MULE_API_DETAIL_ENDPOINT')}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException(`Mule API occurred Error`, error);
          throw new HttpException(
            {
              errorCode: ErrorCode.DETAIL_NG_MULE_DETAIL_API,
              message: ErrorMessage[ErrorCode.DETAIL_NG_MULE_DETAIL_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug('end get detail from mule');
    return data;
  }
}
