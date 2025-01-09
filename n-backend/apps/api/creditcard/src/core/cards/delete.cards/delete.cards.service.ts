import { Injectable, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import {
  USERS_COLLECTION_NAME,
  POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { catchError, firstValueFrom } from 'rxjs';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  CreditCardResponse,
  DeleteCard,
  DeleteCardRequest,
} from '../interface/creditcards.response';
import { CreditUtilService } from '../../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class DeleteCardService {
  constructor(
    private env: ConfigService,
    private httpService: HttpService,
    private logging: LoggingService,
    private creditUtilService: CreditUtilService,
    private commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  /**
   * Deletes credit card / クレジットカードを削除します
   * @param { DeleteCard } deleteCreditCard contains userClaims and credit card sequence number /
   * deleteCreditCard には userClaims とクレジット カードのシーケンス番号が含まれています
   * @returns { Promise<CreditCardResponse> }
   */
  public async deleteCreditCard(
    deleteCreditCard: DeleteCardRequest,
  ): Promise<CreditCardResponse> {
    const url = await this.creditUtilService.getMuleUrls();
    const { cardSequentialNumber } = deleteCreditCard;
    const { encryptedMemberId } = deleteCreditCard.userClaims;
    const memberId = await this.creditUtilService.getDecryptedMemberId(
      deleteCreditCard.userClaims,
    );
    const deleteCard: DeleteCard = {
      memberId,
      cardSequentialNumber,
    };
    this.logging.info(`Calling Delete Credit Card`);
    await firstValueFrom(
      this.httpService
        .delete(url, {
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
            client_id: this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
            client_secret: this.env.get<string>(
              'MULE_POCKET_REGI_CLIENT_SECRET',
            ),
          },
          data: JSON.stringify(deleteCard),
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
    await this.deleteCardFromFireStore(encryptedMemberId, cardSequentialNumber);
    this.logging.info(`Delete Credit Card successful`);
    const result = { message: 'OK', code: HttpStatus.OK } as CreditCardResponse;
    return result;
  }

  /**
   * function is used for deleting credit card from firestore.
   * @param encryptedMemberId encryptedMemberId is documentId / encryptedMemberId は documentId です
   * @param cardSeq cardSequentialNumber is sub documentId / CardSequentialNumber はサブ documentId です
   */
  public async deleteCardFromFireStore(
    encryptedMemberId: string,
    cardSeq: string,
  ) {
    if (!encryptedMemberId || !cardSeq) return;
    this.logging.info('start card deleting from firestore');
    const cardCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData> =
      this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME);

    try {
      const cardDoc = await cardCollection.doc(cardSeq);
      await this.firestoreBatchService.batchDelete(cardDoc);
      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Delete card to firestore is failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.CARDS_DELETE_TO_DB,
        ErrorMessage[ErrorCode.CARDS_DELETE_TO_DB],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logging.info('end card deleted from firestore');
  }
}
