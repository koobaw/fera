import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import {
  GetDiscountedPriceResponseMule,
  ProductIdsAndQuantity,
} from '../interfaces/getdiscountedPrice.interface';

@Injectable()
export class GetDiscountedPriceApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Get discounted price from Mule API /Mule API から割引価格を入手
   * @param storeCode: Storecode / ストアコード
   * @param productIdsAndQuantity Array of object where each object has productId and quantity /
   * 各オブジェクトに productId と数量が含まれるオブジェクトの配列
   * @param membershipRank: membership rank of user / ユーザーの会員ランク
   * @returns discounted price of of product / 商品の割引価格
   */
  public async getDiscountedPriceFromMule(
    storeCode: string,
    productIdsAndQuantity: ProductIdsAndQuantity[],
    membershipRank: string,
  ) {
    this.logger.info('start get discounted price from mule');

    if (!this.isProductIdsAndQuantityValid(productIdsAndQuantity)) {
      this.commonService.createHttpException(
        ErrorCode.MULE_API_BAD_REQUEST,
        ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST],
        HttpStatus.BAD_REQUEST,
      );
    }
    const url = this.getDiscountPriceApiUrl(storeCode);
    const headers = {
      client_id: this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_POCKET_REGI_CLIENT_SECRET'),
    };

    const queryParamsForDiscountPriceApi = this.getFormattedProducts(
      productIdsAndQuantity,
    );

    const params = {
      products: queryParamsForDiscountPriceApi,
      rank: membershipRank,
    };

    const { data } = await firstValueFrom(
      this.httpService.get(url, { params, headers }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException(`Mule API occurred Error`, error);
          this.commonService.createHttpException(
            ErrorCode.CARTPRODUCTS_FETCH_FROM_DB,
            ErrorMessage[ErrorCode.CARTPRODUCTS_FETCH_FROM_DB],
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    this.logger.info(`Mule api url: ${url}`);
    this.logger.info(`Mule api response: ${JSON.stringify(data)}`);

    const discountedPrice = data as GetDiscountedPriceResponseMule;

    this.logger.info('end get detail from mule');

    return discountedPrice;
  }

  /**
   * Determines whether productIds and quantity is valid / productId と数量が有効かどうかを判断します
   * @param productIdsAndQuantity Array of object where each object has productId and quantity / 各オブジェクトに productId と数量が含まれるオブジェクトの配列
   * @returns true if product ids and quantity are valid / 製品IDと数量が有効な場合はtrue
   */
  private isProductIdsAndQuantityValid(
    productIdsAndQuantity: ProductIdsAndQuantity[],
  ): boolean {
    if (
      !Array.isArray(productIdsAndQuantity) ||
      productIdsAndQuantity.length === 0
    ) {
      return false;
    }
    return true;
  }

  /**
   * Gets discount price api url / 割引価格のAPI URLを取得します
   * @param storeCode StoreCode convert to 4 digit string / StoreCodeを4桁の文字列に変換
   * @returns discount price api url / 割引価格API URL
   */
  private getDiscountPriceApiUrl(storeCode: string): string {
    const baseUrl = this.env.get<string>('DISCOUNT_PRICE_API_MULE_BASE_URL');
    const formattedStoreCode = storeCode.padStart(4, '0');
    const endPoint = `${this.env.get<string>(
      'DISCOUNT_PRICE_API_PATH_PARM_STORES',
    )}/${formattedStoreCode}${this.env.get<string>(
      'DISCOUNT_PRICE_API_MULE_END_POINT',
    )}`;
    const discountPriceApiUrl = baseUrl + endPoint;
    return discountPriceApiUrl;
  }

  /**
   * Create a format of type productId:quantity / productId:quantity タイプの形式を作成します
   * @param productsInfoList Object containing productid and quantity / productid と数量を含むオブジェクト
   * @returns formatted products into productId:quantity / 製品を productId:quantity にフォーマットしました
   */
  private getFormattedProducts(
    productsInfoList: ProductIdsAndQuantity[],
  ): string {
    let requestString = '';
    productsInfoList.forEach((el, index) => {
      requestString += `${el.productId}:${el.quantity}`;
      if (index !== productsInfoList.length - 1) {
        requestString += ',';
      }
    });
    return requestString;
  }
}
