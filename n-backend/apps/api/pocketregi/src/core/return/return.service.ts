import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { POCKET_REGI_ORDERS_COLLECTION_NAME } from '@fera-next-gen/types';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Timestamp } from '@google-cloud/firestore';
import {
  ErrorResponse,
  ReturnRequest,
  ReturnResponse,
} from './interface/pocket-regi-return.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class ReturnService {
  constructor(
    private readonly commonService: CommonService,
    private firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
  ) {}

  /**
   * Fetches and set return date in firestore / Firestoreで戻り日を取得して設定する
   * @param { ReturnRequest} returnRequest containing the orderId / orderIdを含む
   * @returns { Promise<ReturnResponse> }
   */
  public async fetchAndSetReturnDate(
    returnRequest: ReturnRequest,
  ): Promise<ReturnResponse> {
    this.logger.info(`Start of set return date in Order data in firestore`);
    try {
      const orderData = await this.fetchFirestoreData(returnRequest.orderId);
      orderData.forEach((doc) => {
        doc.ref.set(
          {
            isReturned: true,
            returnedDate: Timestamp.now(),
          },
          {
            merge: true,
          },
        );
      });
      this.logger.info(`Set return date successful`);
    } catch (error: unknown) {
      this.commonService.logException(
        `Error occurred while setting the return date `,
        error,
      );
      const { errCode, errMessage, statusCode } = this.handleException(
        error as ErrorResponse,
      );
      this.commonService.createHttpException(errCode, errMessage, statusCode);
    }

    this.logger.info(`End of set return date in Order data in firestore`);

    const result = {
      message: 'OK',
      code: HttpStatus.CREATED,
    } as ReturnResponse;
    return result;
  }

  /**
   * Fetches firestore data for the order Id / 注文 ID の Firestore データを取得します
   * @param { string } orderId pocketRegi order Id / pocketRegi注文ID
   * @returns { FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>[] } orderData containing order details /
   * 注文の詳細を含むorderData
   */
  public async fetchFirestoreData(
    orderId: string,
  ): Promise<
    FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]
  > {
    const EMPTY_SNAPSHOT = 'empty_snapshot';
    try {
      const orderData = await this.firestoreBatchService
        .findCollectionGroup(POCKET_REGI_ORDERS_COLLECTION_NAME)
        .where('orderId', '==', orderId)
        .get();

      if (orderData.empty) {
        throw Error(EMPTY_SNAPSHOT);
      }
      return orderData.docs;
    } catch (e: any) {
      if (e.message === EMPTY_SNAPSHOT) {
        this.commonService.logException(`OrderId Not found`, orderId);
        this.commonService.createHttpException(
          ErrorCode.ORDER_ID_NOT_FOUND,
          ErrorMessage[ErrorCode.ORDER_ID_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        );
      } else {
        this.commonService.logException(
          `Failed to fetch the document`,
          orderId,
        );
        this.commonService.createHttpException(
          ErrorCode.FETCH_ORDER_DOCUMENT_FAIL,
          ErrorMessage[ErrorCode.FETCH_ORDER_DOCUMENT_FAIL],
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    return []; // If an exception occurs returns empty array / 例外が発生した場合は空の配列を返す
  }

  /**
   * Handles exception / 例外を処理します
   * @param error error object / エラーオブジェクト
   * @returns { ErrorResponse } the error object with code, message and status /
   * コード、メッセージ、ステータスを含むエラー オブジェクト
   */
  private handleException(error: ErrorResponse) {
    let errorCode: string;
    let message: string;
    const { status } = error;

    if (error.response) {
      errorCode = error.response.errorCode;
      message = error.response.message;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorCode = ErrorCode.SET_RETURN_DATE_FAILED;
      message = ErrorMessage[ErrorCode.SET_RETURN_DATE_FAILED];
    }

    return {
      errCode: errorCode,
      errMessage: message,
      statusCode: status,
    };
  }
}
