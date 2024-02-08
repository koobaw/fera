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
  Store,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  PurchaseOrder,
  SettlementMuleResponse,
  SettlementResponse,
  OrderedProduct,
  SaveProduct,
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
    bearerToken?: string,
  ): Promise<SettlementResponse> {
    const { encryptedMemberId } = userClaims;
    try {
      this.logger.info('credit mule order api starts');

      const result = await this.settlementUtils.getPocketRegiCartProducts(
        encryptedMemberId,
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
        bearerToken,
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
    bearerToken?: string,
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

    // all ordered products with dept code
    const productsWithBumon = await this.getOrderedProducts(
      products,
      bearerToken,
    );

    // all ordered products without dept code
    const productsWithoutBumon: SaveProduct[] = productsWithBumon.map(
      ({ departmentCode, ...rest }) => rest,
    );

    // Get shop detail from firestore using storecode.
    const shopDetail = await this.settlementUtils.getShopDetails(
      payload.entry.storeCode,
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
          catchError(async (error: AxiosError) => {
            this.commonService.logException('Mule API occurred Error', error);
            const { code, messageUI, status } =
              this.settlementUtils.errorHandling(error);

            await this.logPurchaseEvent(
              encryptedMemberId,
              payload,
              productsWithBumon,
              settlementRequest,
              shopDetail,
            );
            // save failed response to firestore
            await this.saveOrderDataToFireStore(
              operatorName,
              encryptedMemberId,
              memberId,
              settlementRequest.orderId,
              payload,
              productsWithoutBumon,
              shopDetail,
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
    await this.logPurchaseEvent(
      encryptedMemberId,
      payload,
      productsWithBumon,
      settlementRequest,
      shopDetail,
      successResult,
    );
    const result: SettlementResponse = {
      code: HttpStatus.CREATED,
      message: 'OK',
      data: {
        status: successResult.status,
        muleRequestId: successResult.cid,
        shortOrderId: successResult.shortOrderId,
      },
    };

    // Delete pocketRegiProducts collection / pocketRegiProducts コレクションを削除
    await this.deleteCollection(encryptedMemberId);

    await this.saveOrderDataToFireStore(
      operatorName,
      encryptedMemberId,
      memberId,
      settlementRequest.orderId,
      payload,
      productsWithoutBumon,
      shopDetail,
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
    products: SaveProduct[],
    shopDetail: Store,
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
        isReturned: false,
        returnedDate: null,
        storeCode: payload.entry.storeCode,
        storeName: shopDetail.name,
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

  /**
   * get all ordered products in single array. / 注文されたすべての商品を単一の配列で取得する
   * @param products all order products with subItems product
   * @param bearerToken bearerToken login user
   * @returns ordered products with dept code
   */
  public async getOrderedProducts(
    products: { [key: string]: any },
    bearerToken: string,
  ) {
    const orderedProducts: OrderedProduct[] = [];
    if (!products || products.length === 0) return orderedProducts;
    products.forEach((item) => {
      if (item.subItems && item.subItems.length !== 0) {
        item.subItems.forEach((subItem) => {
          orderedProducts.push({
            code128DiscountDetails: subItem.code128DiscountDetails,
            imageUrls: subItem.imageUrls,
            isAlcoholic: subItem.isAlcoholic,
            productId: subItem.productId,
            productName: subItem.productName,
            price: subItem.salePrice,
            quantity: subItem.quantity,
            taxRate: subItem.taxRate,
          });
        });
      } else {
        if (!item.productId || !item.subtotalAmount) {
          return;
        }
        orderedProducts.push({
          code128DiscountDetails: item.code128DiscountDetails,
          imageUrls: item.imageUrls,
          isAlcoholic: item.isAlcoholic,
          productId: item.productId,
          productName: item.productName,
          price: item.subtotalAmount,
          quantity: item.quantity,
          taxRate: item.taxRate,
        });
      }
    });
    const resOrderedProducts = await this.getProductsWithBumon(
      orderedProducts,
      bearerToken,
    );
    return resOrderedProducts;
  }

  /**
   * get product list with dept code using product detail api / 商品詳細APIを使用して部門コード付きの商品リストを取得する
   * @param products all order product list
   * @param bearerToken bearerToken login user
   * @returns product list with dept code
   */
  public async getProductsWithBumon(
    products: OrderedProduct[],
    bearerToken: string,
  ) {
    let finalProducs: OrderedProduct[] = [];
    if (products.length === 0) {
      return finalProducs;
    }
    const productCodes = products.map((item) => item.productId);
    const productCodesString = productCodes.join(',');
    const url = `${this.env.get<string>(
      'PRODUCT_BASE_URL',
    )}${this.env.get<string>('GET_PRODUCT_DETAIL')}/${productCodesString}`;

    this.logger.info('Calling Get product Detail Api');
    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          headers: {
            Authorization: bearerToken,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException(
              'product Detail Api occurred',
              error,
            );
            this.commonService.createHttpException(
              ErrorCode.PRODUCT_DETAIL_API_ERROR,
              ErrorMessage[ErrorCode.PRODUCT_DETAIL_API_ERROR],
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    if (!data) {
      this.commonService.logException(
        `No product detail found for`,
        productCodesString,
      );
      this.commonService.createHttpException(
        ErrorCode.PRODUCT_DETAIL_API_ERROR,
        ErrorMessage[ErrorCode.PRODUCT_DETAIL_API_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (data.data.length === 0) {
      finalProducs = products;
      return finalProducs;
    }
    products.forEach((item) => {
      const deptCode = data.data.find(
        (z: { departmentCode: string; productId: string }) =>
          z.productId === item.productId,
      )?.departmentCode;
      finalProducs.push({
        code128DiscountDetails: item.code128DiscountDetails,
        imageUrls: item.imageUrls,
        isAlcoholic: item.isAlcoholic,
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        taxRate: item.taxRate,
        departmentCode: deptCode,
      });
    });

    this.logger.info('Product Details successful');
    return finalProducs;
  }

  /**
   * log purchase event when payment success or failed./ 支払いの成功または失敗時に購入イベントをログに記録する
   * @param encryptedMemberId encryptedMemberId
   * @param payload payload for mule api
   * @param products ordered products
   * @param request request for settlement
   * @param response mule response
   */
  public async logPurchaseEvent(
    encryptedMemberId: string,
    payload: { [key: string]: any },
    products: OrderedProduct[],
    request: SettlementDto,
    shopDetail: Store,
    response?: SettlementMuleResponse,
  ) {
    if (!payload || !payload.entry) {
      return;
    }
    const orderDetail = {
      products,
      storeCode: payload.entry.storeCode,
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
      storeName: shopDetail.name,
    } as PurchaseOrder;
    await this.settlementUtils.setPurchaseLog(
      encryptedMemberId,
      request,
      orderDetail,
      response,
    );
  }

  /**
   * Deletes the pocketRegiProducts collection once order is completed
   * 注文が完了すると、pocketRegiProducts コレクションを削除します
   * @param encryptedMemberId encryptedMemberId of the user /ユーザーの暗号化されたメンバーID
   */
  public async deleteCollection(encryptedMemberId: string) {
    try {
      this.logger.info('Start of deleting pocketRegiProducts collection');

      const docRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME)
        .doc(POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME);

      await this.firestoreBatchService.batchDelete(docRef);

      this.logger.info('End of deleting pocketRegiProducts collection');
    } catch (e) {
      this.commonService.logException(
        `Error Occured while Deleting the collection`,
        e,
      );
      this.commonService.createHttpException(
        ErrorCode.FAILED_TO_DELETE_COLLECTION,
        ErrorMessage[ErrorCode.FAILED_TO_DELETE_COLLECTION],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
