import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { LoggingService } from '@fera-next-gen/logging';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { CommonService } from '@fera-next-gen/common';
import { FieldValue } from '@google-cloud/firestore';
import { GeoMagnetismService } from '../../../utils/geoMagnetic.service';
import {
  GeomagneticRegistraion,
  RegistGeomagneticUserResponse,
} from '../interfaces/geomagnetism.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class GeomagnetismRegisterService {
  adminAuthToken: string[];

  adminIdToken: string;

  userName: string;

  userPassword: string;

  sonyUserId: string;

  isAuth: boolean;

  docId: string;

  operatorName: string;

  private readonly FIRESTORE_ANONYMOUSUSER_COLLECTION_NAME = 'anonymousUsers';

  private readonly FIRESTORE_USER_COLLECTION_NAME = 'users';

  constructor(
    private readonly env: ConfigService,
    private readonly httpService: HttpService,
    public readonly geomagneticUtls: GeoMagnetismService,
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Function used to save the geomagneticID in user/anonymous collection
   * geomagneticID をユーザー/匿名コレクションに保存するために使用される関数
   *
   * @param docId docId sring value / docId 文字列値
   * @param geomagneticUserId geomagneticUserId sring value / geomagneticUserId 文字列値
   * @param operatorName operatorName sring value / operatorName 文字列値
   * @param isAuthed isAuthed boolean value / isAuthed ブール値
   */
  public async saveToFirestore(
    docId: string,
    geomagneticUserId: string,
    operatorName: string,
    isAuthed: boolean,
  ) {
    this.logger.info('start saveToFirestore(geomagnetism)');
    let collectionName = this.FIRESTORE_ANONYMOUSUSER_COLLECTION_NAME;
    if (isAuthed) {
      collectionName = this.FIRESTORE_USER_COLLECTION_NAME;
    }

    try {
      const collection =
        this.firestoreBatchService.findCollection(collectionName);
      const docRef = collection.doc(docId);
      const data: GeomagneticRegistraion = {
        geomagneticUserId,
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestoreBatchService.batchSet(docRef, data, {
        merge: true,
      });
      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${collectionName} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.GeomagneticID_TO_Firestore,
          message: ErrorMessage[ErrorCode.GeomagneticID_TO_Firestore],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end saveToFirestore(geomagnetism)');
  }

  /**
   * Function used to register user ID and get sony ID
   * ユーザーIDの登録とsony IDの取得に使用する機能
   *
   * @param token user ID sring value / ユーザーID文字列値
   * @param docId docId sring value / docId 文字列値
   * @param isAuthed isAuthed boolean value / isAuthed ブール値
   * @returns promise of object RegistGeomagneticUserResponse / オブジェクト RegistGeomagneticUserResponse の約束
   */
  public async registGeomagneticUserService(
    token: string,
    docId: string,
    operatorName: string,
    isAuth: boolean,
  ): Promise<RegistGeomagneticUserResponse> {
    this.logger.info('start registGeomagneticUserService(token docid isAuth)');
    this.userName = token;
    this.isAuth = isAuth;
    this.docId = docId;
    this.operatorName = operatorName;
    // Authentication check / 認証チェック
    if (!token) {
      this.commonService.logException(`Getting token is failed`, token);
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_AuthenticationFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_AuthenticationFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.pseudoUserSignin();
    await this.userIdForRegistration();
    const sonyId = await this.checkUserAlreadyRegistered();

    if (sonyId && Object.keys(sonyId).length !== 0) {
      return sonyId;
    }

    await this.userRegistration();
    this.logger.info('end registGeomagneticUserService(token docid isAuth)');
    return this.addToPositioningGroup();
  }

  /**
   * STEP 1 - Function used to Signin Pseudo user for registration
   * STEP 1 - 登録用擬似ユーザーのサインインに使用する機能
   */
  public async pseudoUserSignin() {
    this.logger.info('start pseudoUserSignin');

    const adminUserName = this.env.get<string>('GEO_ADMIN_USER_NAME');
    const adminPassword = this.env.get<string>('GEO_ADMIN_PSWD');
    try {
      this.adminAuthToken = await this.geomagneticUtls.userSignIn(
        adminUserName,
        adminPassword,
      );
      this.logger.info('end pseudoUserSignin');
    } catch (e) {
      this.commonService.logException(`pseudoUserSignin is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_SignInUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * STEP 2 - Obtaining a user ID token for a pseudo user for user registration
   * STEP 2 - ユーザー登録用の擬似ユーザーのユーザーIDトークンの取得
   */
  public async userIdForRegistration() {
    this.logger.info('start userIdForRegistration');

    const urlPrefix1 = this.env.get<string>('GEO_URL_PREFIX1');
    const urlRedirect = this.env.get<string>('GEO_URL_REDIRECT');

    const xApiKey = this.env.get<string>('GEO_X_API_KEY');
    try {
      const url = `${urlPrefix1}/auth/authorize2`;
      const nonce = this.geomagneticUtls.createNonce();
      const params = {
        scope: 'openid', // 固定値
        response_type: 'id_token', // 固定値
        client_id: 'auth_token', // 固定値
        redirect_uri: urlRedirect,
        nonce,
      };
      const headers = {
        'Content-type': 'application/json',
        'x-api-key': xApiKey,
        Cookie: `${this.adminAuthToken}`,
      };
      const resp = await firstValueFrom(
        this.httpService
          .get(url, { headers, params })
          .pipe(map((response) => response)),
      );

      const statusCode = resp.status;
      if (!statusCode || statusCode !== 200) {
        this.commonService.logException(
          `userIdForRegistration status is failed`,
          statusCode,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_Authorize2Failed,
            message:
              ErrorMessage[ErrorCode.RegistGeomagneticUser_Authorize2Failed],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // Get idToken (account ID) from response / レスポンスからidToken(アカウントID)を取得
      this.adminIdToken = resp.data.id_token;

      if (!this.adminIdToken) {
        this.commonService.logException(
          `Getting adminIdToken in userIdForRegistration is failed`,
          this.adminIdToken,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_Authorize2Failed,
            message:
              ErrorMessage[ErrorCode.RegistGeomagneticUser_Authorize2Failed],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.info('end userIdForRegistration');
    } catch (e) {
      this.commonService.logException(`userIdForRegistration is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_Authorize2Failed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_Authorize2Failed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * STEP-3. Check whether the positioning target is registered
   * STEP-3. 測位目標が登録されているか確認する
   *
   * @returns RegistGeomagneticUserResponse object / RegistGeomagneticUserResponse オブジェクト
   */
  public async checkUserAlreadyRegistered() {
    this.logger.info('start checkUserAlreadyRegistered');

    const urlPrefix2 = this.env.get<string>('GEO_URL_PREFIX2');

    const accountId = this.env.get<string>('GEO_ACC_ID');
    const xApiKey = this.env.get<string>('GEO_X_API_KEY');
    try {
      const url = `${urlPrefix2}/accounts/${accountId}/usernames`;
      const params = {
        name: this.userName,
      };
      const headers = {
        'Content-type': 'application/json',
        'x-api-key': xApiKey,
        Authorization: `Bearer ${this.adminIdToken}`,
      };
      const resp = await firstValueFrom(
        this.httpService
          .get(url, { headers, params })
          .pipe(map((response) => response)),
      );
      const statusCode = resp.status;
      if (!statusCode || statusCode !== 200) {
        this.commonService.logException(
          `checkUserAlreadyRegistered status is failed`,
          statusCode,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_UsernameFailed,
            message:
              ErrorMessage[ErrorCode.RegistGeomagneticUser_UsernameFailed],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // userNameに一致するユーザーリストを取得
      const { users } = resp.data;

      if (users && users.length > 0) {
        const sony = users[0];
        this.logger.info('end checkUserAlreadyRegistered');
        // usersにデータが存在する場合、測位対象者ユーザー登録済のため処理終了
        return {
          data: {
            geomagneticUserId: sony.user,
          },
          message: 'OK',
          code: HttpStatus.CREATED,
        };
      }
      return {};
    } catch (e) {
      this.commonService.logException(
        `checkUserAlreadyRegistered is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_UsernameFailed,
          message: ErrorMessage[ErrorCode.RegistGeomagneticUser_UsernameFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * STEP-4. Registration of positioning target user (first time only when user is not registered)
   * STEP-4. 測位対象ユーザーの登録（ユーザー未登録の場合初回のみ）
   */
  public async userRegistration() {
    this.logger.info('start userRegistration');

    const hmacSecretKey = this.env.get<string>('GEO_HMAC_SECRET_KEY');
    const urlPrefix2 = this.env.get<string>('GEO_URL_PREFIX2');

    const accountId = this.env.get<string>('GEO_ACC_ID');
    const xApiKey = this.env.get<string>('GEO_X_API_KEY');
    try {
      this.userPassword = `fera-${this.geomagneticUtls.createUserPassword(
        this.userName,
        hmacSecretKey,
      )}`;
    } catch (e) {
      this.commonService.logException(
        `Generating password in userRegistration is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const url = `${urlPrefix2}/accounts/${accountId}/users`;
      const params = {
        name: this.userName,
        password: this.userPassword,
      };
      const headers = {
        'Content-type': 'application/json',
        'x-api-key': xApiKey,
        Authorization: `Bearer ${this.adminIdToken}`,
      };

      const resp = await firstValueFrom(
        this.httpService
          .post(url, JSON.stringify(params), { headers })
          .pipe(map((response) => response)),
      );

      const statusCode = resp.status;

      if (!statusCode || statusCode !== 200) {
        this.commonService.logException(
          `Status in userRegistration is failed`,
          resp,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
            message:
              ErrorMessage[
                ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
              ],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.sonyUserId = resp.data.user;

      if (!this.sonyUserId) {
        this.commonService.logException(
          `sonyUserId in userRegistration is failed`,
          resp,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
            message:
              ErrorMessage[
                ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
              ],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      this.logger.info('end userRegistration');
    } catch (e) {
      this.commonService.logException(`userRegistration is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * STEP-5. Add the positioning target user to the group "Positioning Users" (only for the first time when the user is not registered) /
   * STEP-5. 測位対象ユーザーをグループ「測位ユーザー」に追加（ユーザーが未登録の場合、初回のみ)
   *
   * @returns RegistGeomagneticUserResponse object / RegistGeomagneticUserResponse オブジェクト
   */
  public async addToPositioningGroup() {
    this.logger.info('start addToPositioningGroup');

    const urlPrefix2 = this.env.get<string>('GEO_URL_PREFIX2');

    const accountId = this.env.get<string>('GEO_ACC_ID');
    const xApiKey = this.env.get<string>('GEO_X_API_KEY');
    const groupId = this.env.get<string>('GEO_GRP_ID');
    try {
      const url = `${urlPrefix2}/accounts/${accountId}/groups/${groupId}/childusers`;
      const params = {
        user: this.sonyUserId,
      };
      const headers = {
        'Content-type': 'application/json',
        'x-api-key': xApiKey,
        Authorization: `Bearer ${this.adminIdToken}`,
      };
      const response = await firstValueFrom(
        this.httpService
          .post(url, JSON.stringify(params), { headers })
          .pipe(map((resp) => resp)),
      );
      const statusCode = response.status;
      if (!statusCode || statusCode !== 200) {
        this.commonService.logException(
          `status in addToPositioningGroup is failed`,
          response,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.RegistGeomagneticUser_RegisterUserFailed,
            message:
              ErrorMessage[ErrorCode.RegistGeomagneticUser_RegisterUserFailed],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Storing the Sony UserID in Firestore in user collection
      await this.saveToFirestore(
        this.docId,
        this.sonyUserId,
        this.operatorName,
        this.isAuth,
      );
      this.logger.info('end addToPositioningGroup');
      return {
        data: {
          geomagneticUserId: this.sonyUserId,
        },
        message: 'OK',
        code: HttpStatus.CREATED,
      };
    } catch (e) {
      this.commonService.logException(`addToPositioningGroup is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_RegisterUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_RegisterUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
