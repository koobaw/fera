import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import crypto from 'crypto';
import {
  MuleFavoritesCreateErrorResponse,
  MuleFavoritesCreateResponseItem,
  MuleFavoritesCreateErrorResponseItem,
  MuleFavoritesCreateSuccessResponse,
  MuleFavoritesReadSuccessResponse,
  MuleFavoritesReadErrorResponse,
} from '../interfaces/favorites-mule-api.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class FavoritesMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchFavorites(
    memberId: string,
  ): Promise<MuleFavoritesReadSuccessResponse[]> {
    // ToDo: mule未実装のためmockDataを返すようにしている。mule実装後に次の行を削除する必要あり
    return this.dummyFetchFavorites(memberId);

    this.logger.debug('start fetchFavoriteProducts');
    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
    };
    const params = {
      account: memberId,
    };
    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_LIST_ENDPOINT')}`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Mule API occurred Error', error);
          this.commonService.createHttpException(
            ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED,
            ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED],
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const isFailure = (resData): resData is MuleFavoritesReadErrorResponse =>
      resData.stasus === HttpStatus.BAD_REQUEST ||
      resData.status === HttpStatus.NOT_FOUND ||
      resData.status === HttpStatus.INTERNAL_SERVER_ERROR;

    if (isFailure(data)) {
      this.commonService.createHttpException(
        ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED,
        ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const favoriteProductLists = data as MuleFavoritesReadSuccessResponse[];
    this.logger.debug('end fetchFavoriteProducts');
    return favoriteProductLists;
  }

  public async createFavorites(
    accountId: string,
    comment?: string,
    title?: string,
    isPublish?: boolean,
    ownerId?: string,
  ): Promise<MuleFavoritesCreateSuccessResponse> {
    return this.dummyCreateFavorites();

    const headers = {
      client_id: this.env.get<string>('MULE_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_API_CLIENT_SECRET'),
      content_type: 'application/json',
    };
    const params = {
      entry: {
        accountId,
        comment,
        title,
        isPublish,
        ownerId,
      },
    };
    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_LIST_ENDPOINT')}`;

    const { data }: AxiosResponse<MuleFavoritesCreateSuccessResponse> =
      await firstValueFrom(
        this.httpService.post(url, { headers, params }).pipe(
          catchError((error: AxiosError<MuleFavoritesCreateErrorResponse>) => {
            this.commonService.logException('Mule API occurred Error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED,
                message:
                  ErrorMessage[
                    ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED
                  ],
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const isFailure = (
      item: MuleFavoritesCreateResponseItem,
    ): item is MuleFavoritesCreateErrorResponseItem => !item.successful;

    if (isFailure(data.item)) {
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED,
          ErrorMessage:
            ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end createFavoriteProducts');
    return data;
  }

  private dummyFetchFavorites(
    memberId: string,
  ): MuleFavoritesReadSuccessResponse[] {
    const ownerId = crypto.randomUUID();
    const defaultDummy: MuleFavoritesReadSuccessResponse[] = [
      {
        id: crypto.randomUUID(),
        name: 'name',
        accountId: memberId,
        comment: 'comment',
        title: 'title',
        isPublish: false,
        isDefault: true,
        ownerId,
        createdBy: ownerId,
        lastModifiedBy: ownerId,
      },
    ];
    return defaultDummy;
  }

  private dummyCreateFavorites(): MuleFavoritesCreateSuccessResponse {
    const defaultDummy: MuleFavoritesCreateSuccessResponse = {
      status: 200,
      cid: crypto.randomUUID(),
      timestamp: '2021-08-31T07:00:00.000Z',
      successful: true,
      item: {
        id: crypto.randomUUID(),
        successful: true,
      },
    };
    return defaultDummy;
  }
}
