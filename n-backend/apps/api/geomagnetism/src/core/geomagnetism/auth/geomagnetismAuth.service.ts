import { CommonService } from '@cainz-next-gen/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { LoggingService } from '@cainz-next-gen/logging';
import { GeoMagnetismService } from '../../../utils/geoMagnetic.service';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { RequestGeomagneticAuthResponse } from '../interfaces/geomagnetism.interface';

@Injectable()
export class GeomagnetismAuthService {
  userAuthToken: string[];

  userIdToken: string;

  userPassword: string;

  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    public readonly geomagneticUtls: GeoMagnetismService,
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
  ) {}

  /**
   * Authenticate a user by signing them in using a token and obtain an authentication token.
   * Using authentication token make a authorization request
   *
   * トークンを使用してサインインすることでユーザーを認証し、認証トークンを取得します。
   * 認証トークンを使用して認可リクエストを行う
   *
   * @param {string} token - The user's token used for authentication / 認証に使用されるユーザーのトークン。
   * @returns {Promise<RequestGeomagneticAuthResponse>} - Resolves with RequestGeomagneticAuthResponse object when the authentication is successful / 認証が成功した場合は、RequestGeomagneticAuthResponse オブジェクトで解決されます。
   */
  public async authGeomagneticUserService(
    token: string,
  ): Promise<RequestGeomagneticAuthResponse> {
    // Authentication check / 認証チェック
    if (!token) {
      this.commonService.logException(`Getting token is failed`, token);
      throw new HttpException(
        {
          errorCode: ErrorCode.RequestGeomagneticAuth_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RequestGeomagneticAuth_SignInUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.userSignIn(token);
    return this.userAuthentication();
  }

  /**
   * Authenticate a user by signing them in using a token and obtain an authentication token.
   * ユーザーをトークンを使用してサインインし、認証トークンを取得する。
   *
   * @param {string} token - The user's token used for authentication / 認証に使用されるユーザーのトークン。
   * @returns {Promise<void>} - Resolves when the authentication is successful or rejects with an error /認証が成功した場合、またはエラーで拒否された場合に解決します。
   */
  public async userSignIn(token: string) {
    const hmacSecretKey = this.env.get<string>('GEO_HMAC_SECRET_KEY');

    this.logger.info('start userSignIn(token)');

    // Username as Cainz app (UID as username) / カインズアプリとしてのユーザー名(UIDをユーザー名とする)
    const userName = token;
    // user password / ユーザーパスワード

    // Generate a password for the positioning target user using HMAC from the UID / UIDからHMACで測位対象者ユーザーのパスワードを生成
    this.userPassword = `Cainz-${this.geomagneticUtls.createUserPassword(
      userName,
      hmacSecretKey,
    )}`;

    try {
      // Obtain the token for Admin from the set-cookie header of the response / レスポンスのset-cookieヘッダーからAdmin用のトークンを取得
      this.userAuthToken = await this.geomagneticUtls.userSignIn(
        userName,
        this.userPassword,
      );
      this.logger.info('end userSignIn(token)');
    } catch (e) {
      this.commonService.logException(' user signIn failed', e);
      this.commonService.createHttpException(
        ErrorCode.RequestGeomagneticAuth_SignInUserFailed,
        ErrorMessage[ErrorCode.RequestGeomagneticAuth_SignInUserFailed],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   *
   * This function initiates the user's authentication process by making an authorization request
   * to a remote authentication server and obtaining an ID token.
   * この関数は、リモート認証サーバーに対して認証リクエストを行い、IDトークンを取得することで、
   * ユーザーの認証プロセスを開始します。
   *
   * @returns {Promise<RequestGeomagneticAuthResponse>} - Resolves with  RequestGeomagneticAuthResponse object upon successful authentication / 認証が成功した場合は、RequestGeomagneticAuthResponse オブジェクトで解決されます。
   */
  public async userAuthentication(): Promise<RequestGeomagneticAuthResponse> {
    const urlPrefix1 = this.env.get<string>('GEO_URL_PREFIX1');
    const xApiKey = this.env.get<string>('GEO_X_API_KEY');
    const urlRedirect = this.env.get<string>('GEO_URL_REDIRECT');

    this.logger.info('start userAuthentication()');

    try {
      const url = `${urlPrefix1}/auth/authorize2`;
      const nonce = this.geomagneticUtls.createNonce();
      const params = {
        scope: 'openid', // Fixed value / 固定値
        response_type: 'id_token', // Fixed value / 固定値
        client_id: 'auth_token', // Fixed value / 固定値
        redirect_uri: urlRedirect,
        nonce, // Any base64url string of up to 48 characters / 任意の48文字以下の任意のbase64url文字列
      };

      const headers = {
        'Content-type': 'application/json',
        'x-api-key': xApiKey,
        Cookie: `${this.userAuthToken}`,
      };
      const resp = await firstValueFrom(
        this.httpService
          .get(url, { headers, params })
          .pipe(map((response) => response)),
      );
      const statusCode = resp.status;

      if (!statusCode || statusCode !== 200) {
        this.commonService.createHttpException(
          ErrorCode.RequestGeomagneticAuth_Authorize2Failed,
          ErrorMessage[ErrorCode.RequestGeomagneticAuth_Authorize2Failed],
          HttpStatus.UNAUTHORIZED,
        );
      }
      // Get idToken (account ID) from response / レスポンスからidToken(アカウントID)を取得
      this.userIdToken = resp.data.id_token;

      if (!this.userIdToken) {
        this.commonService.createHttpException(
          ErrorCode.RequestGeomagneticAuth_Authorize2Failed,
          ErrorMessage[ErrorCode.RequestGeomagneticAuth_Authorize2Failed],
          HttpStatus.UNAUTHORIZED,
        );
      }
      this.logger.info('end userAuthentication()');
    } catch (e) {
      this.commonService.logException('user authentication failed', e);
      this.commonService.createHttpException(
        ErrorCode.RequestGeomagneticAuth_Authorize2Failed,
        ErrorMessage[ErrorCode.RequestGeomagneticAuth_Authorize2Failed],
        HttpStatus.UNAUTHORIZED,
      );
    }
    return {
      data: {
        token: this.userIdToken,
      },
      message: 'OK',
      code: HttpStatus.CREATED,
    };
  }
}
