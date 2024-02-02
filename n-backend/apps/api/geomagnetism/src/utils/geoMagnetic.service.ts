import * as crypto from 'crypto';
import { firstValueFrom, map } from 'rxjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';

@Injectable()
export class GeoMagnetismService {
  constructor(
    private readonly env: ConfigService,
    private readonly httpService: HttpService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Creates a user-specific password hash using a secret key.
   *
   * @param {string} uid - The user identifier for which the password hash is generated. / パスワード ハッシュが生成されるユーザー識別子。
   * @param {string} secretKey - The secret key used for hashing the user identifier. / ユーザー識別子のハッシュ化に使用される秘密キー。
   * @returns {string} A hexadecimal password hash. / 16 進数のパスワード ハッシュ。
   */
  public createUserPassword(uid: string, secretKey: string): string {
    if (!uid || !secretKey) {
      return '';
    }

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(uid);
    return hmac.digest('hex');
  }

  /**
   * Generates a random nonce (a string of characters) with a specified length. / 指定された長さのランダムなノンス (文字列) を生成します。
   *
   * @returns {string} A random nonce with the specified length. / 指定された長さのランダムなノンス。
   */
  public createNonce(): string {
    const length = 48;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex: number = Math.floor(Math.random() * characters.length);
      const randomChar: string = characters
        .charAt(randomIndex)
        .substring(0, 48);
      result += randomChar;
    }

    return result;
  }

  /**
   * Performs user sign-in by sending a POST request to the Geo service's authentication endpoint. /
   * POST リクエストを Geo サービスの認証エンドポイントに送信して、ユーザー サインインを実行します。
   *
   * @param userName - The username of the user attempting to sign in. / サインインしようとしているユーザーのユーザー名。
   * @param password - The password associated with the user's account. / ユーザーのアカウントに関連付けられたパスワード。
   * @returns A Promise that resolves to the 'set-cookie' header from the response upon successful sign-in. /
   * サインインが成功したときの応答からの「set-cookie」ヘッダーに解決される Promise。
   */
  public async userSignIn(userName: string, password: string) {
    const urlPrefix1 = this.env.get<string>('GEO_URL_PREFIX1');
    const xApiKey = this.env.get<string>('GEO_X_API_KEY');

    const accountNum = this.env.get<string>('GEO_ACC_NUMBER');

    const url = `${urlPrefix1}/auth/signin`;
    const params = {
      account_num: accountNum,
      username: userName,
      password,
    };
    const resp = await firstValueFrom(
      this.httpService
        .post(url, JSON.stringify(params), {
          headers: {
            'Content-type': 'application/json',
            'x-api-key': xApiKey,
          },
        })
        .pipe(map((response) => response)),
    );
    const statusCode = resp.status;

    if (!statusCode || statusCode !== 200) {
      this.commonService.logException(
        `pseudoUserSignin staus is failed`,
        statusCode,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_SignInUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return resp.headers['set-cookie'];
  }
}
