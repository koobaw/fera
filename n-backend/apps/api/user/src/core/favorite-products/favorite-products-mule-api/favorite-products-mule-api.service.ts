import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import crypto from 'crypto';
import {
  MuleFavoriteProductCreateResponseFailure,
  MuleFavoriteProductCreateResponseItemFailure,
  MuleFavoriteProductCreateResponseSuccess,
  MuleFavoriteProductReadResponseFailure,
  MuleFavoriteProductReadResponseSuccess,
} from '../interfaces/favorite-products-mule-api.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class FavoriteProductsMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchFavoriteProducts(
    favoriteProductListId: string,
  ): Promise<MuleFavoriteProductReadResponseSuccess[]> {
    // ToDo: mule未実装のため空の[]を返すようにしている。mule実装後に修正する必要あり
    return [];

    this.logger.debug('start fetchFavoriteProducts');

    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };

    const params = {
      entry: {
        mylist: favoriteProductListId,
      },
    };

    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_PRODUCTS_ENDPOINT')}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Mule API occurred Error', error);
          this.commonService.createHttpException(
            ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
            ErrorMessage[
              ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED
            ],
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const isFailure = (
      resData,
    ): resData is MuleFavoriteProductReadResponseFailure =>
      resData.stasus === HttpStatus.BAD_REQUEST ||
      resData.status === HttpStatus.NOT_FOUND ||
      resData.status === HttpStatus.INTERNAL_SERVER_ERROR;

    if (isFailure(data)) {
      this.commonService.createHttpException(
        ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
        ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const favoriteProducts = data as [];
    this.logger.debug('end fetchFavoriteProducts');
    return favoriteProducts;
  }

  public async registerFavoriteProducts(
    accountId: string,
    myListId: string,
    productIds: string[],
  ): Promise<{ productId: string; objectId: string }[]> {
    this.logger.debug('start registerFavoriteProducts');

    // This is dummy return
    return productIds.map((productId) => ({
      productId,
      objectId: crypto.randomUUID(),
    }));

    const registeredProducts = await Promise.all(
      productIds.map(async (janCode) =>
        this.registerFavoriteProduct(accountId, myListId, janCode),
      ),
    );

    this.logger.debug('end registerFavoriteProducts');

    return registeredProducts;
  }

  private async registerFavoriteProduct(
    accountId: string,
    myListId: string,
    jan: string,
  ): Promise<{ productId: string; objectId: string }> {
    this.logger.debug('start registerFavoriteProduct');

    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
      'content-type': 'application/json',
    };

    const params = {
      entry: {
        accountId,
        myListId,
        jan,
      },
    };

    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_PRODUCTS_ENDPOINT')}`;

    const { data } = await firstValueFrom<
      AxiosResponse<MuleFavoriteProductCreateResponseSuccess>
    >(
      this.httpService.get(url, { headers, params }).pipe(
        catchError(
          (error: AxiosError<MuleFavoriteProductCreateResponseFailure>) => {
            this.commonService.logException('Mule API occurred Error', error);
            this.commonService.createHttpException(
              ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
              ErrorMessage[
                ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED
              ],
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          },
        ),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const isFailure = (
      item,
    ): item is MuleFavoriteProductCreateResponseItemFailure => item.successful;

    if (isFailure(data.item)) {
      this.logger.error(data.item.message);
      this.commonService.createHttpException(
        ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
        ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end registerFavoriteProduct');

    return { productId: jan, objectId: data.item.id };
  }
}
