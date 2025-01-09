import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import crypto from 'crypto';
import {
  MuleFavoriteProductDeleteErrorResponse,
  MuleFavoriteProductDeleteResponse,
  MuleFavoriteProductDeleteServerErrorResponse,
  MuleFavoriteProductDeleteSuccessResponse,
  MuleFavoriteProductRegisterErrorResponse,
  MuleFavoriteProductRegisterResponse,
  MuleFavoriteProductRegisterServerErrorResponse,
  MuleFavoriteProductRegisterSuccessResponse,
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

  public async deleteFavoriteProducts(
    decryptedMemberId: string,
    ...objectIds: string[]
  ): Promise<MuleFavoriteProductDeleteSuccessResponse[]> {
    this.logger.debug('start deleteFavoriteProducts');
    return this.dummyDeleteFavoriteProducts(objectIds);

    // const headers = {
    //   client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
    //   client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    //   'content-type': 'application/json',
    // };

    // const params = {
    //   entries: objectIds,
    // };

    // const url = `${this.env.get<string>(
    //   'MULE_CRM_API_BASE_URL',
    // )}${this.env.get<string>('MULE_CRM_API_MY_PRODUCTS_ENDPOINT')}`;

    // const { data } = await firstValueFrom<
    //   AxiosResponse<MuleFavoriteProductDeleteResponse>
    // >(
    //   this.httpService.get(url, { headers, params }).pipe(
    //     catchError(
    //       (error: AxiosError<MuleFavoriteProductDeleteServerErrorResponse>) => {
    //         this.commonService.logException('Mule API occurred Error', error);
    //         this.commonService.createHttpException(
    //           ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
    //           ErrorMessage[
    //             ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED
    //           ],
    //           HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //       },
    //     ),
    //   ),
    // );

    // this.logger.debug(`Mule api url: ${url}`);
    // this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    // const isFailure = (
    //   resData: MuleFavoriteProductDeleteResponse,
    // ): resData is MuleFavoriteProductDeleteErrorResponse =>
    //   resData.successful === false;

    // if (isFailure(data)) {
    //   this.commonService.createHttpException(
    //     ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED,
    //     data.message,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    // this.logger.debug('end deleteFavoriteProducts');
    // return data;
  }

  public async registerFavoriteProducts(
    decryptedMemberId: string,
    productId: string,
    mylistId?: string,
  ): Promise<MuleFavoriteProductRegisterSuccessResponse> {
    this.logger.debug('start registerFavoriteProducts');
    return this.dummyRegisterFavoriteProduct();

    // const headers = {
    //   client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
    //   client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    //   'content-type': 'application/json',
    // };

    // let requestBody;
    // if (mylistId) {
    //   requestBody = {
    //     decryptedMemberId,
    //     productId,
    //     mylistId,
    //   };
    // } else {
    //   requestBody = {
    //     decryptedMemberId,
    //     productId,
    //   };
    // }

    // const url = `${this.env.get<string>(
    //   'MULE_CRM_API_BASE_URL',
    // )}${this.env.get<string>('MULE_CRM_API_MY_PRODUCTS_ENDPOINT')}`;

    // const { data } = await firstValueFrom<
    //   AxiosResponse<MuleFavoriteProductRegisterResponse>
    // >(
    //   this.httpService.post(url, requestBody, { headers }).pipe(
    //     catchError(
    //       (
    //         error: AxiosError<MuleFavoriteProductRegisterServerErrorResponse>,
    //       ) => {
    //         this.commonService.logException('Mule API occurred Error', error);
    //         this.commonService.createHttpException(
    //           ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_REGISTER_FAILED,
    //           ErrorMessage[
    //             ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_REGISTER_FAILED
    //           ],
    //           HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //       },
    //     ),
    //   ),
    // );

    // this.logger.debug(`Mule api url: ${url}`);
    // this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    // const isFailure = (
    //   resData: MuleFavoriteProductRegisterResponse,
    // ): resData is MuleFavoriteProductRegisterErrorResponse =>
    //   resData.successful === false;

    // if (isFailure(data)) {
    //   this.commonService.createHttpException(
    //     ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_REGISTER_FAILED,
    //     data.message,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    // this.logger.debug('end registerFavoriteProducts');
    // return data;
  }

  private async dummyDeleteFavoriteProducts(
    objectIds: string[],
  ): Promise<MuleFavoriteProductDeleteSuccessResponse[]> {
    return objectIds.map((objectId) => {
      const muleFavoriteProductDeleteSuccessResponse: MuleFavoriteProductDeleteSuccessResponse =
        {
          status: 200,
          cid: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          successful: true,
          items: [
            {
              successful: true,
              id: objectId,
            },
          ],
        };
      return muleFavoriteProductDeleteSuccessResponse;
    });
  }

  private async dummyRegisterFavoriteProduct(): Promise<MuleFavoriteProductRegisterSuccessResponse> {
    return {
      status: 200,
      cid: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      successful: true,
      item: {
        successful: true,
        id: 'dummyId',
      },
    };
  }
}
