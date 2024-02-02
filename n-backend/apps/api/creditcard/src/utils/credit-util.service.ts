import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Claims } from 'packages/types/src/claims';
import { ConfigService } from '@nestjs/config';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import { CommonService } from '@cainz-next-gen/common';
import { AxiosError } from 'axios';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';
import { MuleErrorResponse } from '../core/cards/interface/creditcards.response';

@Injectable()
export class CreditUtilService {
  constructor(
    private env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Gets decrypted member id from user claims
   * ユーザーの要求から復号化されたメンバー ID を取得します
   * @param { Claims } userClaims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns { Promise<string> } decrypted member id / 復号化された会員ID
   */
  public async getDecryptedMemberId(userClaims: Claims): Promise<string> {
    if (typeof userClaims.encryptedMemberId === 'undefined') {
      throw new HttpException(
        {
          errorCode: ErrorCode.MEMBER_ID_GET_CLAIM_MEMBER_NOT_FOUND,
          message: ErrorMessage[ErrorCode.MEMBER_ID_GET_CLAIM_MEMBER_NOT_FOUND],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { encryptedMemberId } = userClaims;
    const [key, iv] = this.getKeyAndIv();
    // Get decryted memberId / 復号化されたメンバーIDを取得する
    const memberIdRow = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    const memberId = memberIdRow.replace(/^0+/, '');
    return memberId;
  }

  /**
   * Function is help to get key and iv for decryption / 関数は、復号化のためのキーと iv を取得するのに役立ちます
   * @returns array of buffer utf-8 encoded values / バッファ utf-8 エンコード値の配列
   */
  // 暗号化複合化用のkeyとivを取得
  private getKeyAndIv(): string[] {
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');

    if (!key) {
      throw new HttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!iv) {
      throw new HttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        HttpStatus.BAD_REQUEST,
      );
    }
    return [key, iv];
  }

  /**
   * Gets mule urls / Mule URLを取得します
   * @returns { Promise<string> } the mule url for credit card registration and deletion /
   * クレジットカードの登録と削除用の Mule URL
   */
  public async getMuleUrls(): Promise<string> {
    const muleBaseUrl = this.env.get<string>('MULE_CREDIT_BASE_URL');
    const registCard = this.env.get<string>('MULE_CREDIT_REGISTER_CARD');
    const url = muleBaseUrl + registCard;
    return url;
  }

  /**
   * Error handling / エラー処理
   * @param { AxiosError } error error object from mule api / Mule API からのエラー オブジェクト
   * @returns the error object with code, message and status /
   * コード、メッセージ、ステータスを含むエラー オブジェクト
   */
  public handleException(error: AxiosError) {
    const errorObject: MuleErrorResponse = error.response.data;

    let errorCode: string;
    let statusCode: number;

    if (!error.response) {
      errorCode = ErrorCode.MULE_API_SERVER_ERROR;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (errorObject.status === 500 && errorObject.errors) {
      errorCode = ErrorCode.GMO_ERROR;
    } else if (error.response.status === 401) {
      errorCode = ErrorCode.MULE_API_UNAUTHORIZED_ACCESS;
    } else {
      errorCode = ErrorCode.MULE_API_BAD_REQUEST;
    }

    return {
      errCode: errorCode,
      errMessage: ErrorMessage[errorCode],
      status: error.response.status ? error.response.status : statusCode,
    };
  }
}
