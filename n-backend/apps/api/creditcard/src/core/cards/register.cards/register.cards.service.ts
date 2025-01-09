import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import firestore from '@google-cloud/firestore';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common/exceptions';
import {
  USERS_COLLECTION_NAME,
  POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME,
  AddCreditCard,
} from '@fera-next-gen/types';
import {
  CreditCardResponse,
  RegisterCardRequest,
  RegisterCard,
} from '../interface/creditcards.response';
import { CreditUtilService } from '../../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class RegisterCardService {
  constructor(
    private env: ConfigService,
    private httpService: HttpService,
    private logging: LoggingService,
    private creditUtilService: CreditUtilService,
    private commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  /**
   * Register credit card / クレジットカードを登録します
   * @param { RegistCreditCard } registerCreditCard contains userClaims and credit card token /
   * registCreditCard には userClaims とクレジット カード トークンが含まれます
   * @param brand brand name / ブランド名
   * @param operatorName createdby/updatedby operatorName / 作成者/更新者: オペレーター名
   * @param bearerToken authorization token from frontend / フロントエンドからの認可トークン
   * @returns { Promise<CreditCardResponse> }
   */
  public async registerCreditCard(
    registerCreditCard: RegisterCardRequest,
    brand: string,
    operatorName: string,
    bearerToken: string,
  ): Promise<CreditCardResponse> {
    const url = await this.creditUtilService.getMuleUrls();
    const { encryptedMemberId } = registerCreditCard.claims;
    const memberId = await this.creditUtilService.getDecryptedMemberId(
      registerCreditCard.claims,
    );
    const { token } = registerCreditCard;
    const registCard: RegisterCard = {
      memberId,
      token,
    };

    this.logging.info(`Calling Register Credit Card`);
    const { data } = await firstValueFrom(
      this.httpService
        .post(url, JSON.stringify(registCard), {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            client_id: this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
            client_secret: this.env.get<string>(
              'MULE_POCKET_REGI_CLIENT_SECRET',
            ),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            const { errCode, errMessage, status } =
              this.creditUtilService.handleException(error);
            this.commonService.logException('Mule Api Error occured', error);
            throw new HttpException(
              {
                errorCode: errCode,
                message: errMessage,
              },
              status,
            );
          }),
        ),
    );
    await this.saveCardToFirestore(
      data.cardSequentialNumber,
      brand,
      operatorName,
      encryptedMemberId,
    );
    // Get credit card details & update Firestore
    await this.getCardDetails(bearerToken);
    this.logging.info(`Register Credit Card successful`);
    const result = {
      message: 'OK',
      code: HttpStatus.CREATED,
    } as CreditCardResponse;
    return result;
  }

  /**
   * Get credit card details & update Firestore  / クレジット カードの詳細を取得して Firestore を更新する
   * @param { string } bearerToken authorization token from frontend / フロントエンドからの認可トークン
   */
  public async getCardDetails(bearerToken: string) {
    const creditCardBaseUrl = `${this.env.get<string>(
      'CREDIT_CARDS_BASE_URL',
    )}`;
    const creditCard = `${this.env.get<string>('GET_CREDIT_CARDS')}`;
    const cardUrl = creditCardBaseUrl + creditCard;
    const creditCardData = await firstValueFrom(
      this.httpService
        .get(cardUrl, {
          headers: {
            Authorization: bearerToken,
          },
        })
        .pipe(
          catchError((error: HttpException) => {
            this.commonService.logException(
              'Unable to call credit card list API',
              error,
            );
            this.commonService.createHttpException(
              ErrorCode.CREDIT_CARD_API_SERVER_ERROR,
              ErrorMessage[ErrorCode.CREDIT_CARD_API_SERVER_ERROR],
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    if (!creditCardData) {
      this.logging.info('Credit card list API call failed');
    }
    this.logging.info('Credit card list API call successful');
  }

  /**
   * It is used for saving credit cards in firestore. / Firestore にクレジット カードを保存するために使用されます。
   * @param cardSeq cardSequentialNumber / カードの通し番号
   * @param brand brand name / ブランド名
   * @param operatorName createdby/updatedby operatorName / 作成者/更新者: オペレーター名
   * @param encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   */
  public async saveCardToFirestore(
    cardSeq: string,
    brand: string,
    operatorName: string,
    encryptedMemberId: string,
  ) {
    if (!encryptedMemberId || !cardSeq) return;
    this.logging.info('start card saving to firestore');
    try {
      const creditcard: AddCreditCard = {
        brand,
        createdAt: firestore.FieldValue.serverTimestamp(),
        createdBy: operatorName,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        updatedBy: operatorName,
      };
      const cardCollection = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME);
      const docRef = cardCollection.doc(`${cardSeq}`);
      await this.firestoreBatchService.batchSet(docRef, creditcard, {
        merge: false,
      });
      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Save card to firestore is failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.CARDS_STORE_TO_DB,
        ErrorMessage[ErrorCode.CARDS_STORE_TO_DB],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logging.info('end card saving to firestore');
  }
}
