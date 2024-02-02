import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from './error-code';

@Injectable()
export class SalesforceApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * get tokens from salesforce
   *
   * @param {string} authorizationCode
   * @throws {HttpException} Will throw an error if connection failed
   * @return {object} accessToken and refreshToken of salesforce
   */
  public async getUserToken(
    authorizationCode: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    this.logger.info('start getUserToken');
    const salesforceBaseUrl = this.env.get<string>('SALESFORCE_BASE_URL');
    const salesforceTokenEndpoint = this.env.get<string>(
      'SALESFORCE_TOKEN_ENDPOINT',
    );

    const queryParams = new URLSearchParams();
    queryParams.append('grant_type', 'authorization_code');
    queryParams.append(
      'client_id',
      this.env.get<string>('SALESFORCE_CLIENT_ID'),
    );
    queryParams.append(
      'client_secret',
      this.env.get<string>('SALESFORCE_CLIENT_SECRET'),
    );
    queryParams.append(
      'redirect_uri',
      this.env.get<string>('SALESFORCE_REDIRECT_URL'),
    );
    queryParams.append('code', authorizationCode);
    this.logger.debug(`queryParams:${queryParams.toString()}`);
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${salesforceBaseUrl}${salesforceTokenEndpoint}`,
          queryParams.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('getUserToken error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.SALESFORCE_FAILED_TO_FETCH_TOKEN,
                message:
                  ErrorMessage[ErrorCode.SALESFORCE_FAILED_TO_FETCH_TOKEN],
              },
              HttpStatus.BAD_REQUEST,
            );
          }),
        ),
    );
    this.logger.debug(`getUserToken response: ${JSON.stringify(data)}`);
    this.logger.info('end getUserToken');
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  }

  /**
   * refresh accessToken using refreshToken
   *
   * @param {string} refreshToken - salesforce refresh token
   * @throws {HttpException} Will throw an error if connection failed
   * @return {string} accessToken
   */
  public async refreshAccessToken(refreshToken: string): Promise<string> {
    this.logger.info('start refreshAccessToken');
    const salesforceBaseUrl = this.env.get<string>('SALESFORCE_BASE_URL');
    const salesforceTokenEndpoint = this.env.get<string>(
      'SALESFORCE_TOKEN_ENDPOINT',
    );

    const queryParams = new URLSearchParams();
    queryParams.append('grant_type', 'refresh_token');
    queryParams.append('refresh_token', refreshToken);
    queryParams.append(
      'client_id',
      this.env.get<string>('SALESFORCE_CLIENT_ID'),
    );
    queryParams.append(
      'client_secret',
      this.env.get<string>('SALESFORCE_CLIENT_SECRET'),
    );

    this.logger.debug(`queryParams:${queryParams.toString()}`);
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${salesforceBaseUrl}${salesforceTokenEndpoint}`,
          queryParams.toString(),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('refreshAccessToken error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.SALESFORCE_FAILED_TO_REFRESH_TOKEN,
                message:
                  ErrorMessage[ErrorCode.SALESFORCE_FAILED_TO_REFRESH_TOKEN],
              },
              HttpStatus.BAD_REQUEST,
            );
          }),
        ),
    );

    this.logger.debug(`refreshAccessToken response: ${JSON.stringify(data)}`);
    this.logger.info('end refreshAccessToken');

    return data.access_token;
  }

  /**
   * get salesforce userId from salesforce using accessToken.
   * @param {string} access_token - Salesforce access_token
   * @return {string} salesforce userId
   *
   * @throws {HttpException} Will throw an error if connection failed
   * @throws {HttpException} Will throw an error if env does't have param
   * @throws {HttpException} Will throw an error if response data doesn't have userId
   */
  public async getSalesforceUserId(accessToken: string): Promise<string> {
    this.logger.info('start getSalesforceUserId');
    const salesforceBaseUrl = this.env.get<string>('SALESFORCE_BASE_URL');
    const salesforceUserInfoEndpoint = this.env.get<string>(
      'SALESFORCE_USER_ENDPOINT',
    );
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${salesforceBaseUrl}${salesforceUserInfoEndpoint}`, undefined, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('getSalesforceUserId error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.SALESFORCE_FAILED_TO_FETCH_USER_ID,
                message:
                  ErrorMessage[ErrorCode.SALESFORCE_FAILED_TO_FETCH_USER_ID],
              },
              HttpStatus.BAD_REQUEST,
            );
          }),
        ),
    );

    this.logger.debug(`getSalesforceUserId response: ${JSON.stringify(data)}`);

    const userId: unknown = data?.user_id;
    if (!this.isUserId(userId)) {
      throw new HttpException(
        {
          errorCode: ErrorCode.SALESFORCE_PARAMS_NOT_FOUND,
          message: ErrorMessage[ErrorCode.SALESFORCE_PARAMS_NOT_FOUND],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    this.logger.info('end getSalesforceUserId');
    return userId;
  }

  private isUserId(userId): userId is string {
    return typeof userId === 'string';
  }
}
