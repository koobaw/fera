import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  USERS_COLLECTION_NAME,
  POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME,
  UpdateCreditCard,
} from '@fera-next-gen/types';
import firestore from '@google-cloud/firestore';
import { catchError, firstValueFrom } from 'rxjs';
import { LoggingService } from '@fera-next-gen/logging';
import { AxiosError } from 'axios';
import { CommonService } from '@fera-next-gen/common';
import { Claims } from 'packages/types/src/claims';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  Card,
  CardResult,
  CreditCardsRes,
} from '../interface/creditcards.response';
import { CreditUtilService } from '../../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class GetCardsService {
  constructor(
    private readonly logger: LoggingService,
    private env: ConfigService,
    private httpService: HttpService,
    private readonly commonService: CommonService,
    private creditUtilService: CreditUtilService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  /**
   * Getting credit cards from mule and GMO system/ muleとGMOシステムからクレジットカードを取得する
   * @param claims decrypted memberId from token / トークンからメンバー ID を復号化しました
   * @param operatorName createdby/updatedby operatorName / 作成者/更新者: オペレーター名
   * @returns data credit cards / 結果のクレジットカード。
   */
  public async getCreditCards(
    claims: Claims,
    operatorName: string,
  ): Promise<CreditCardsRes> {
    this.logger.info('stared getCreditCards method');
    const memberId = await this.creditUtilService.getDecryptedMemberId(claims);
    const url = `${await this.creditUtilService.getMuleUrls()}/${memberId}`;
    const muleClientId = this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID');
    const muleClientSecret = this.env.get<string>(
      'MULE_POCKET_REGI_CLIENT_SECRET',
    );
    const { data } = await firstValueFrom(
      this.httpService
        .get<Array<Card>>(url, {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            client_id: muleClientId,
            client_secret: muleClientSecret,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('Mule API occurred Error', error);
            const { errCode, errMessage, status } =
              this.creditUtilService.handleException(error);
            throw new HttpException(
              {
                message: errMessage,
                errorCode: errCode,
              },
              status,
            );
          }),
        ),
    );
    const formatedResponse = this.formatMuleResponse(data);
    await this.updateCardsToFirestore(
      formatedResponse,
      operatorName,
      claims.encryptedMemberId,
    );
    const result: CreditCardsRes = {
      data: { cards: formatedResponse },
      message: 'OK',
      code: HttpStatus.OK,
    };
    this.logger.info('ended getCreditCards method');
    return result;
  }

  /**
   * It is used for update credit cards detail in firestore. / Firestoreでクレジットカードの詳細を更新するために使用されます
   * @param cards credit cards
   * @param operatorName createdby/updatedby operatorName / 作成者/更新者: オペレーター名
   * @param encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   */
  public async updateCardsToFirestore(
    cards: Array<CardResult>,
    operatorName: string,
    encryptedMemberId: string,
  ) {
    if (!encryptedMemberId) return;
    this.logger.info('start cards update to firestore');
    try {
      await Promise.all(
        cards
          .filter((z) => !z.isDeleted)
          .map(async (card) => {
            const creditcard: UpdateCreditCard = {
              maskedCardNumber: card.maskedCardNumber,
              expirationDate: card.expirationDate,
              isPrimary: card.isPrimary,
              updatedAt: firestore.FieldValue.serverTimestamp(),
              updatedBy: operatorName,
            };
            const targetcardCollection = this.firestoreBatchService
              .findCollection(USERS_COLLECTION_NAME)
              .doc(encryptedMemberId)
              .collection(POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME)
              .doc(card.cardSequentialNumber);
            const targetRef = await targetcardCollection.get();
            if (targetRef.exists)
              this.firestoreBatchService.batchSet(
                targetcardCollection,
                creditcard,
                {
                  merge: true,
                },
              );
            else {
              this.logger.warn(
                `${targetRef.ref.path} : targetcardCollection is not exists.`,
              );
            }
          }),
      );

      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Update cards to firestore is failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.CARDS_STORE_TO_DB,
        ErrorMessage[ErrorCode.CARDS_STORE_TO_DB],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end cards update to firestore');
  }

  /**
   * Formats the mule response to match with firestore schema / firestore スキーマと一致するように Mule 応答をフォーマットします
   * @param cardDetails card details from mule api whose format needs to be changed
   * @returns Card details matching the format of firestore schema
   */
  private formatMuleResponse(cardDetails: Card[]) {
    const newData = cardDetails.map((cardDetail) => {
      // format expiration date from yymm to mm/yy / 有効期限を yymm から mm/yy にフォーマットします
      const { expirationDate } = cardDetail;
      const year = expirationDate.slice(0, expirationDate.length / 2);
      const month = expirationDate.slice(expirationDate.length / 2);
      const formatedExpirationDate = `${month}/${year}`;
      // format masked card number to add space between 4 digits of credit card number / マスクされたカード番号をフォーマットして、クレジット カード番号の 4 桁の間にスペースを追加します
      const { cardNumber } = cardDetail;
      const splitCardNumber = cardNumber.match(/.{1,4}/g).join(' ');
      return {
        cardSequentialNumber: cardDetail.cardSequentialNumber,
        isPrimary: cardDetail.isSelected,
        maskedCardNumber: splitCardNumber,
        expirationDate: formatedExpirationDate,
        isDeleted: cardDetail.isDeleted,
      };
    });
    return newData as CardResult[];
  }
}
