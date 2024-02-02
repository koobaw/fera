import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

import { CommonService } from '@cainz-next-gen/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { FieldValue } from '@google-cloud/firestore';
import {
  Claims,
  USERS_COLLECTION_NAME,
  POCKET_REGI_ORDERS_COLLECTION_NAME,
  PocketRegiOrder,
} from '@cainz-next-gen/types';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  SettlementMuleResponse,
  SettlementResponse,
} from './interface/settlement.interface';

import { SettlementUtilsService } from '../../utils/settlement.utils';
import { SettlementDto } from './dto/settlement.dto';
import { CreditUtilService } from '../../utils/credit-util.service';

@Injectable()
export class SettlementService {
  private readonly USERS_COLLECTION_NAME = USERS_COLLECTION_NAME;

  private readonly USERS_POKETREGI_ORDERS_COLLECTION_NAME =
    POCKET_REGI_ORDERS_COLLECTION_NAME;

  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
    private httpService: HttpService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly settlementUtils: SettlementUtilsService,
    private readonly creditUtilService: CreditUtilService,
  ) {}

  /**
   * Main service function for credit mule order / クレジットミュール注文の主なサービス方法
   * @param settlementRequest HTTP request object it contains orderId (string value), storeCode (string value), totalAmount (number value), paymentMethod (string value), cardSequentialNumber (string value), appVer (string value) / req HTTP リクエスト オブジェクトには、orderId (文字列値)、storeCode (文字列値)、totalAmount (数値値)、paymentMethod (文字列値)、cardSequentialNumber (文字列値)、appVer (文字列値) が含まれます。
   * @param encryptedMemberId string value / 文字列値
   * @returns promise of object SettlementResponse / オブジェクト SettlementResponse の約束
   */
  public async creditMuleOrder(
    settlementRequest: SettlementDto,
    userClaims: Claims,
    operatorName: string,
  ): Promise<SettlementResponse> {
    const { storeCode } = settlementRequest;
    const { encryptedMemberId } = userClaims;
    try {
      this.logger.info('credit mule order api starts');
      const result = await this.settlementUtils.getPocketRegiCartProducts(
        encryptedMemberId,
        storeCode,
      );
      if (result.status !== 200) {
        throw new HttpException(
          {
            errorCode: result.errorCode,
            message: ErrorMessage[result.errorCode],
          },
          result.status,
        );
      }
      const { data } = result;
      if (!data.products || data.products.length === 0) {
        throw new HttpException(
          {
            errorCode: ErrorCode.CART_PRODUCTS_NOT_FOUND,
            message: ErrorMessage[ErrorCode.CART_PRODUCTS_NOT_FOUND],
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const { products } = data;

      // mule api call start
      const response: SettlementResponse = await this.callMuleApiForSettlement(
        userClaims,
        settlementRequest,
        products,
        operatorName,
      );
      // mule api call end

      this.logger.info('credit mule order api ends');
      return response;
    } catch (e: any) {
      this.commonService.logException(
        `Getting data from pocket regi cart products failed`,
        e,
      );
      throw new HttpException(e.getResponse(), e.getStatus());
    }
  }

  /**
   * calling mule api for payement order experience / 支払い注文エクスペリエンスのために Mule API を呼び出す
   * @param encryptedMemberId string value / 文字列値
   * @param settlementRequest HTTP request object it contains orderId (string value), storeCode (string value), totalAmount (number value), paymentMethod (string value), cardSequentialNumber (string value), appVer (string value) / req HTTP リクエスト オブジェクトには、orderId (文字列値)、storeCode (文字列値)、totalAmount (数値値)、paymentMethod (文字列値)、cardSequentialNumber (文字列値)、appVer (文字列値) が含まれます。
   * @param products firestore cart products array / Firestore カートの製品配列
   * @returns payload obeject value contains all the data to submit the mule api
   */
  public async callMuleApiForSettlement(
    userClaims: Claims,
    settlementRequest: SettlementDto,
    products: { [key: string]: any },
    operatorName: string,
  ) {
    const baseUrl = this.env.get<string>('MULE_CREDIT_BASE_URL');
    const endPoint = this.env.get<string>('MULE_ORDER_SETTLEMENT');
    const { encryptedMemberId } = userClaims;
    const url = baseUrl + endPoint;
    const memberId = await this.creditUtilService.getDecryptedMemberId(
      userClaims,
    );
    const payload = this.settlementUtils.muleApiRequestPayload(
      memberId,
      settlementRequest,
      products,
    );

    const { data } = await firstValueFrom(
      this.httpService
        .post(url, payload, {
          headers: {
            client_id: this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
            client_secret: this.env.get<string>(
              'MULE_POCKET_REGI_CLIENT_SECRET',
            ),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('Mule API occurred Error', error);
            const { code, messageUI, status } =
              this.settlementUtils.errorHandling(error);

            // save failed response to firestore
            this.saveOrderDataToFireStore(
              operatorName,
              encryptedMemberId,
              memberId,
              settlementRequest.orderId,
              payload,
              products,
              '',
              code,
            );
            throw new HttpException(
              {
                errorCode: code,
                message: messageUI,
              },
              status,
            );
          }),
        ),
    );

    this.logger.info(`Mule api url: ${url}`);
    const successResult = data as SettlementMuleResponse;
    const result: SettlementResponse = {
      code: HttpStatus.CREATED,
      message: 'OK',
      data: {
        status: successResult.status,
        muleRequestId: successResult.cid,
        shortOrderId: successResult.shortOrderId,
      },
    };

    this.saveOrderDataToFireStore(
      operatorName,
      encryptedMemberId,
      memberId,
      settlementRequest.orderId,
      payload,
      products,
      successResult.shortOrderId,
      '',
    );
    this.logger.info('end of credit mule order');
    return result;
  }

  /**
   * saving order data to firestore database / 注文データを Firestore データベースに保存する
   * @param encryptedMemberId string value / 文字列値
   * @param memberId string value / 文字列値
   * @param orderId string value / 文字列値
   * @param shortOrderId string value / 文字列値
   * @param payload payload obeject value contains all the data to submit the mule api
   * @param products firestore cart products array / Firestore カートの製品配列
   * @param paymentErrorCode string value / 文字列値
   */
  public async saveOrderDataToFireStore(
    operatorName: string,
    encryptedMemberId: string,
    memberId: string,
    orderId: string,
    payload: { [key: string]: any },
    products: { [key: string]: any },
    shortOrderId = '',
    paymentErrorCode = '',
  ) {
    const collectionName = this.USERS_COLLECTION_NAME;
    const subCollectionName = this.USERS_POKETREGI_ORDERS_COLLECTION_NAME;
    const subDocId = orderId;
    try {
      this.logger.info('start saveOrderDataToFireStore(credit mule order)');
      const docId = encryptedMemberId;
      const docRef = this.settlementUtils.getFirestoreDocRef(
        collectionName,
        docId,
      );

      const subDocRef = this.settlementUtils.getFirestoreSubDocRef(
        docRef,
        subCollectionName,
        subDocId,
      );

      const shopDocs: { [key: string]: any } =
        await this.settlementUtils.getShopDetails(payload.entry.storeCode);
      if (shopDocs.errorCode || shopDocs.status !== 200) {
        throw new HttpException(
          {
            errorCode: shopDocs.errorCode,
            message: ErrorMessage[shopDocs.errorCode],
          },
          shopDocs.status,
        );
      }

      const creditCardDocs: { [key: string]: any } =
        await this.settlementUtils.getCeditCardDetails(
          encryptedMemberId,
          payload.entry.cardSequentialNumber,
        );
      if (creditCardDocs.errorCode || creditCardDocs.status !== 200) {
        throw new HttpException(
          {
            errorCode: creditCardDocs.errorCode,
            message: ErrorMessage[creditCardDocs.errorCode],
          },
          creditCardDocs.status,
        );
      }

      const data: PocketRegiOrder = {
        orderId,
        products,
        orderIdForCustomer: shortOrderId,
        memberId,
        memberMail: '',
        memberName: '',
        memberPhone: '',
        creditCardExpireDate: creditCardDocs.data.expirationDate,
        creditCardMaskNum: creditCardDocs.data.maskedCardNumber,
        creditCardType: creditCardDocs.data.brand,
        storeCode: payload.entry.storeCode,
        storeName: shopDocs.data.name,
        totalPointUse: payload.entry.totalPointUse,
        subtotalConsumptionTaxByStandardRate:
          payload.entry.subtotalConsumptionTaxByStandardRate,
        subtotalConsumptionTaxByReducedRate:
          payload.entry.subtotalConsumptionTaxByReducedRate,
        subtotalPriceByStandardTaxRate:
          payload.entry.subtotalPriceByStandardTaxRate,
        subtotalPriceByReducedTaxRate:
          payload.entry.subtotalPriceByReducedTaxRate,
        subtotalPriceByTaxExempt: payload.entry.subtotalPriceByTaxExempt,
        totalAmount: payload.entry.totalAmount,
        totalGrantedPoints: payload.entry.totalGrantedPoints,
        paymentMethod: payload.entry.paymentMethod,
        totalQuantity: payload.entry.totalProductQuantity,
        paymentCode1: 84,
        paymentCode2: null,
        paymentErrorCode,
        createdAt: FieldValue.serverTimestamp(),
        totalPointUsed: 0,
        createdBy: operatorName,
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };
      await this.firestoreBatchService.batchSet(subDocRef, data, {
        merge: false,
      });

      await this.firestoreBatchService.batchCommit();
      this.logger.info('end saveOrderDataToFireStore(credit mule order)');
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${subCollectionName} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.MULE_API_SERVER_ERROR,
          message: ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
