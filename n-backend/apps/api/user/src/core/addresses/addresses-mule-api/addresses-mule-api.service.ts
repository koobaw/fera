import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { CommonService } from '@cainz-next-gen/common';
import {
  MuleAddressesCreateSuccessResponse,
  MuleAddressesServerErrorResponse,
} from '../interface/addresses-mule-api.interface';
import { RegisterAddressesBodyDto } from '../dto/register.addresses-body.dto';
import {
  MuleAddressesFindErrorResponse,
  MuleAddressesFindResponseSuccess,
} from '../interfaces/addresses-mule-api.interface';
import { UpdateAddressBodyDto } from '../dto/update.address-body.dto';
import { UpdateAddressParamDto } from '../dto/update.address-param.dto';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import {
  MuleAddressUpdateServerErrorResponse,
  MuleAddressUpdateSuccessResponse,
} from '../interface/update.mule-api.interface';

@Injectable()
export class AddressesMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  public async createAddresses(
    createRequest: RegisterAddressesBodyDto & { accountId: string },
  ) {
    const headers = {
      client_id: this.env.get<string>('MULE_CRM_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_CRM_API_CLIENT_SECRET'),
      content_type: 'application/json',
    };
    const params = {
      entry: createRequest,
    };
    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_ADDRESSES_ENDPOINT')}`;

    this.logger.debug(`start fetch Mule api url:${url}`);
    const { data } = await firstValueFrom(
      this.httpService
        .post<MuleAddressesCreateSuccessResponse>(url, { headers, params })
        .pipe(
          catchError((error: AxiosError<MuleAddressesServerErrorResponse>) => {
            this.commonService.logException('Mule API occurred Error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.ADDRESSES_CREATE_MULE_API_FAILED,
                message:
                  ErrorMessage[ErrorCode.ADDRESSES_CREATE_MULE_API_FAILED],
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    if (!data.successful) {
      throw new HttpException(
        {
          errorCode: ErrorCode.ADDRESSES_CREATE_MULE_API_FAILED,
          message: ErrorMessage[ErrorCode.ADDRESSES_CREATE_MULE_API_FAILED],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.debug(`end fetch Mule api url:${url}`);
  }

  public async fetchAddresses(
    memberId: string,
    isFavorite?: boolean,
  ): Promise<MuleAddressesFindResponseSuccess[]> {
    this.logger.debug('start fetchAddresses');

    const headers = {
      client_id: this.env.get<string>('MULE_CRM_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_CRM_API_CLIENT_SECRET'),
    };

    let url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>(
      'MULE_CRM_API_MY_ADDRESSES_ENDPOINT',
    )}?account=${memberId}`;

    if (isFavorite !== undefined) {
      url += `&favorite=${isFavorite}`;
    }

    return this.tempData(memberId, isFavorite);
    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Mule API occurred Error', error);
          this.commonService.createHttpException(
            ErrorCode.ADDRESSES_MULE_FIND_API_FAILED,
            ErrorMessage[ErrorCode.ADDRESSES_MULE_FIND_API_FAILED],
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);

    const isFailure = (resData): resData is MuleAddressesFindErrorResponse =>
      resData.status === HttpStatus.BAD_REQUEST ||
      resData.status === HttpStatus.NOT_FOUND ||
      resData.status === HttpStatus.INTERNAL_SERVER_ERROR;

    if (isFailure(data)) {
      this.commonService.createHttpException(
        ErrorCode.ADDRESSES_MULE_FIND_API_FAILED,
        ErrorMessage[ErrorCode.ADDRESSES_MULE_FIND_API_FAILED],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const addresses = data as [];
    this.logger.debug('end fetchAddresses');
    return addresses;
  }

  public async updateAddress(
    updateAddressParamDto: UpdateAddressParamDto,
    updateAddressBodyDto: UpdateAddressBodyDto,
  ) {
    this.logger.debug('start fetchPrices');
    const headers = {
      client_id: this.env.get<string>('MULE_CRM_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_CRM_API_CLIENT_SECRET'),
    };
    const params = {
      ...updateAddressBodyDto,
    };
    const url = `${this.env.get<string>(
      'MULE_CRM_API_BASE_URL',
    )}${this.env.get<string>('MULE_CRM_API_MY_ADDRESSES_ENDPOINT')}/${
      updateAddressParamDto.addressId
    }`;
    const { data } = await firstValueFrom<
      AxiosResponse<MuleAddressUpdateSuccessResponse>
    >(
      this.httpService.get(url, { headers, params }).pipe(
        catchError(
          (error: AxiosError<MuleAddressUpdateServerErrorResponse>) => {
            this.commonService.logException('Mule API connection Error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.ADDRESSES_UPDATE_API_CONNECTION_ERROR,
                message:
                  ErrorMessage[ErrorCode.ADDRESSES_UPDATE_API_CONNECTION_ERROR],
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          },
        ),
      ),
    );

    if (!data.successful) {
      this.logger.debug(`Mule api update failed: ${JSON.stringify(data)}`);
      throw new HttpException(
        {
          errorCode: ErrorCode.ADDRESSES_UPDATE_API_UPDATE_ERROR,
          message: ErrorMessage[ErrorCode.ADDRESSES_UPDATE_API_UPDATE_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug(`Mule api url: ${url}`);
    this.logger.debug(`Mule api param: ${JSON.stringify(params)}`);
    this.logger.debug(`Mule api response: ${JSON.stringify(data)}`);
    this.logger.debug('end fetchPrices');

    return data;
  }

  private tempData(
    memberId: string,
    isFavorite?: boolean,
  ): MuleAddressesFindResponseSuccess[] {
    const addresses = [
      {
        id: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
        name: 'address name',
        accountId: memberId,
        isFavorite: true,
        title: '自宅',
        firstName: '太郎',
        lastName: '山田',
        firstNameKana: 'タロウ',
        lastNameKana: 'ヤマダ',
        zipCode: '3670030',
        prefecture: '埼玉県',
        address1: '本庄市早稲田の杜',
        address2: '一丁目2番1号',
        address3: 'カインズマンション100号室',
        phone: '09099999999',
        phone2: '08099999999',
        email: 'test@example.com',
        companyName: 'テスト会社',
        departmentName: 'テスト部',
        memo: 'サンプルメモ',
      },
      {
        id: 'a8g091bb-03e4-53ec-bf04-9027d8d82828',
        name: 'address name2',
        accountId: memberId,
        isFavorite: false,
        title: 'オフィス',
        firstName: '花子',
        lastName: '佐藤',
        firstNameKana: 'ハナコ',
        lastNameKana: 'サトウ',
        zipCode: '1010021',
        prefecture: '東京都',
        address1: '千代田区外神田',
        address2: '四丁目5番2号',
        address3: 'カインズビル500号室',
        phone: '03088888888',
        phone2: '04088888888',
        email: 'hanako@example.com',
        companyName: 'テスト企業',
        departmentName: 'デザイン部',
        memo: 'メモ内容',
      },
    ];

    if (typeof isFavorite === 'boolean') {
      return addresses.filter((address) => address.isFavorite === isFavorite);
    }

    return addresses;
  }
}
