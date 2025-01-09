import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import {
  USERS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
  STORES_COLLECTION_NAME,
  PocketRegiCreditCard,
  Store,
} from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';
import { FixedPurchaseEventData } from '../types/constants/purchase-event';
import {
  PurchaseEvent,
  SettlementMuleError,
  SettlementMuleResponse,
  PurchaseOrder,
} from '../core/settlement/interface/settlement.interface';
import { SettlementDto } from '../core/settlement/dto/settlement.dto';

@Injectable()
export class SettlementUtilsService {
  private readonly USERS_COLLECTION_NAME = USERS_COLLECTION_NAME;

  private readonly USERS_POKETREGI_CART_PRODUCTS_COLLECTION_NAME =
    POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME;

  private readonly USERS_CREDIR_CARD_COLLECTION_NAME =
    POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME;

  private readonly STORE_COLLECTION_NAME = STORES_COLLECTION_NAME;

  private totalProductQuantity = 0;

  totalPointUse = 0;

  COMPANY_CODE = '24';

  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
  ) {}

  /**
   * get firestore document reference from collection / コレクションから Firestore ドキュメント参照を取得する
   * @param collectionName string value / 文字列値
   * @param docId string value / 文字列値
   * @returns docRef reference of firestore document / Firestoreドキュメントのリファレンス
   */
  public getFirestoreDocRef(collectionName: string, docId: string) {
    const collection =
      this.firestoreBatchService.findCollection(collectionName);
    const docRef = collection.doc(docId);
    return docRef;
  }

  /**
   * get firestore sub document reference from collection / コレクションから Firestore サブドキュメント参照を取得します
   * @param docRef
   * @param subCollectionName string value / 文字列値
   * @param subDocId string value / 文字列値
   * @returns subDocRef reference of firestore sub document / Firestore サブドキュメントのリファレンス
   */
  public getFirestoreSubDocRef(
    docRef: any,
    subCollectionName: string,
    subDocId: string,
  ) {
    const subDocRef = docRef.collection(subCollectionName).doc(subDocId);
    return subDocRef;
  }

  /**
   * get data firestore collection with doc id / ドキュメント ID を使用してデータ Firestore コレクションを取得します
   * @param collectionName string value / 文字列値
   * @param docId string value / 文字列値
   * @returns { doc, docRef } doc is the object of that document and docRef reference of firestore document / doc はそのドキュメントのオブジェクトであり、firestore ドキュメントの docRef 参照です。
   */
  public async getDocumentFromCollection(collectionName: string, docId: any) {
    const docRef = this.getFirestoreDocRef(collectionName, docId);
    const snapshot = await docRef.get();
    const doc = snapshot.data();

    return { doc, docRef };
  }

  /**
   * get data firestore sub collection with sub doc id / サブドキュメントIDを使用してデータFirestoreサブコレクションを取得します
   * @param docRef
   * @param subCollectionName string value / 文字列値
   * @param subDocId string value / 文字列値
   * @returns { subDoc, subDocRef } subDoc is the object of that document and subDocRef reference of firestore document / subDoc はそのドキュメントのオブジェクトであり、firestore ドキュメントの subDocRef 参照です。
   */
  public async getDocumentFromSubCollection(
    docRef: any,
    subCollectionName: string,
    subDocId: string,
  ) {
    const subDocRef = this.getFirestoreSubDocRef(
      docRef,
      subCollectionName,
      subDocId,
    );
    const subSnapshot = await subDocRef.get();
    const subDoc = subSnapshot.data();
    return { subDoc, subDocRef };
  }

  /**
   * get the shop details from firestore by shopcode / Firestoreからショップコードでショップの詳細を取得します
   * @param shopcode string value / 文字列値
   * @returns either { data, shopcode, data } for success or { status, errorCode } for error / 成功の場合は { data, shopcode, data }、エラーの場合は { status, errorCode }
   */
  public async getShopDetails(shopcode: string): Promise<Store> {
    this.logger.info('getting shop details from firestore in starts');
    const docId = this.commonService.createMd5(shopcode.replace(/^0+/, ''));
    let shopData: Store;
    try {
      const { doc } = await this.getDocumentFromCollection(
        this.STORE_COLLECTION_NAME,
        docId,
      );
      shopData = doc as Store;
    } catch (e) {
      this.commonService.logException(
        `Get shop detail from firestore is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.SHOP_COLLECTION_NOT_EXISTS_IN_DB,
          message: ErrorMessage[ErrorCode.SHOP_COLLECTION_NOT_EXISTS_IN_DB],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    this.logger.info('getting shop details from firestore in ends');
    return shopData;
  }

  /**
   * get the credit card details from firestore by credit card sequential number / クレジット カードの連続番号を使用して Firestore からクレジット カードの詳細を取得します
   * @param encryptedMemberId string value / 文字列値
   * @param cardSequentialNumber string value / 文字列値
   * @returns either { data, shopcode, data } for success or { status, errorCode } for error / 成功の場合は { data, shopcode, data }、エラーの場合は { status, errorCode }
   */
  public async getCeditCardDetails(
    encryptedMemberId: string,
    cardSequentialNumber: string,
  ) {
    this.logger.info('getting credit card details from firestore in starts');

    const { doc, docRef } = await this.getDocumentFromCollection(
      this.USERS_COLLECTION_NAME,
      encryptedMemberId,
    );
    if (!doc) {
      return {
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
    }
    const { subDoc } = await this.getDocumentFromSubCollection(
      docRef,
      this.USERS_CREDIR_CARD_COLLECTION_NAME,
      cardSequentialNumber,
    );
    if (!subDoc) {
      return {
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
    }
    this.logger.info('getting credit card details from firestore in ends');
    return {
      data: subDoc as PocketRegiCreditCard,
      status: HttpStatus.OK,
    };
  }

  /**
   * getting the payload data for calling mule api payement order experience / Mule API の支払い注文エクスペリエンスを呼び出すためのペイロード データの取得
   * @param memberId string value / 文字列値
   * @param reqData HTTP request object it contains orderId (string value), storeCode (string value), totalAmount (number value), paymentMethod (string value), cardSequentialNumber (string value), appVer (string value) / req HTTP リクエスト オブジェクトには、orderId (文字列値)、storeCode (文字列値)、totalAmount (数値値)、paymentMethod (文字列値)、cardSequentialNumber (文字列値)、appVer (文字列値) が含まれます。
   * @param products firestore cart products array / Firestore カートの製品配列
   * @returns payload obeject value contains all the data to submit the mule api
   */
  public muleApiRequestPayload(
    memberId: string,
    reqData: SettlementDto,
    products: { [key: string]: any },
  ) {
    // 合計金額 / total amount
    let totalPriceTax10 = 0;
    let totalPriceTax8 = 0;
    let totalPriceTax0 = 0;

    // 消費税10%商品の税額 / Tax amount for products with 10% sales tax
    let taxAmount10: number;
    // 消費税8%商品の税額 / Tax amount for products with 8% sales tax
    let taxAmount8: number;

    // 消費税10%商品の税込価格 / Price including tax for products with 10% consumption tax
    let taxedPrice10: number;
    // 消費税8%商品の税込価格 / Price including tax for products with 8% consumption tax
    let taxedPrice8: number;

    // 非課税商品の合計金額 / Total amount of tax-free products
    let nonTaxedTotalPrice: number;

    // 付与ポイント数 / Number of points granted
    let pointGranted = 0;

    const items = [];
    products.forEach((product) => {
      if (product.subItems && product.subItems.length) {
        product.subItems.forEach((item) => {
          items.push({
            productCode: item.productId,
            quantity: item.quantity,
            amount: item.salePrice,
          });
        });
      } else {
        if (!product.subtotalAmount) {
          return;
        }
        items.push({
          productCode: product.productId,
          quantity: product.quantity,
          amount: product.subtotalAmount,
        });
      }

      if (Number(product.taxRate) === 10) {
        totalPriceTax10 += Number(product.subtotalAmount);
      } else if (Number(product.taxRate) === 8) {
        totalPriceTax8 += Number(product.subtotalAmount);
      } else if (Number(product.taxRate) === 0) {
        totalPriceTax0 += Number(product.subtotalAmount);
      }
    });

    this.totalProductQuantity = items.length;

    if (totalPriceTax10 > 0) taxAmount10 = (totalPriceTax10 * 10) / 110;

    if (totalPriceTax8 > 0) taxAmount8 = (totalPriceTax8 * 8) / 108;

    if (totalPriceTax10 > 0)
      taxedPrice10 = totalPriceTax10 - Math.floor(taxAmount10);

    if (totalPriceTax8 > 0)
      taxedPrice8 = totalPriceTax8 - Math.floor(taxAmount8);

    if (totalPriceTax10 > 0 && totalPriceTax8 > 0) {
      nonTaxedTotalPrice = taxedPrice10 + taxedPrice8 + totalPriceTax0;
    } else if (totalPriceTax10 > 0 && totalPriceTax8 === 0) {
      nonTaxedTotalPrice = taxedPrice10 + totalPriceTax0;
    } else if (totalPriceTax10 === 0 && totalPriceTax8 > 0) {
      nonTaxedTotalPrice = taxedPrice8 + totalPriceTax0;
    } else if (totalPriceTax10 === 0 && totalPriceTax8 === 0) {
      nonTaxedTotalPrice = totalPriceTax0;
    }

    if (nonTaxedTotalPrice) {
      pointGranted = this.getPointsGranted(
        nonTaxedTotalPrice,
        this.totalPointUse,
      );
    }

    this.totalPointUse = reqData.totalPointUse;

    const entry = {
      orderId: reqData.orderId,
      storeCode: `0000${reqData.storeCode}`.slice(-4),
      feraCardNumber: memberId,
      totalAmount: reqData.totalAmount,
      subtotalPriceByStandardTaxRate:
        totalPriceTax10 > 0 ? Math.floor(taxAmount10) : 0,
      subtotalConsumptionTaxByStandardRate:
        totalPriceTax10 > 0 ? totalPriceTax10 : 0,
      subtotalPriceByReducedTaxRate:
        totalPriceTax8 > 0 ? Math.floor(taxAmount8) : 0,
      subtotalConsumptionTaxByReducedRate:
        totalPriceTax8 > 0 ? totalPriceTax8 : 0,
      subtotalPriceByTaxExempt: totalPriceTax0 > 0 ? totalPriceTax0 : 0,
      totalGrantedPoints: pointGranted,
      totalPointUse: this.totalPointUse ? this.totalPointUse : 0,
      totalProductQuantity: this.totalProductQuantity,
      paymentMethod: reqData.paymentMethod,
      numberOfPayments: 1,
      cardSequentialNumber: reqData.cardSequentialNumber,
      cardPassword: '',
      clientField1: 'pocketregi=0003',
      clientField2: `app=ShopApp,ver=${reqData.appVer}`,
      clientField3: '',
      taxAndShippingCost: 0,
      items,
    };

    const payload = { entry };
    return payload;
  }

  /**
   * Get Points Granted for the Order / 注文に対して付与されたポイントを取得する
   * @param  {number} nonTaxedTotalPrice
   * @param  {number} totalPointsUsed
   * @returns number
   */
  private getPointsGranted(
    nonTaxedTotalPrice: number,
    totalPointsUsed: number,
  ): number {
    if (totalPointsUsed >= nonTaxedTotalPrice) {
      return 0;
    }
    return Math.round((nonTaxedTotalPrice - totalPointsUsed) / 200);
  }

  /**
   * get the shop details from firestore by shopcode / Firestoreからショップコードでショップの詳細を取得します
   * @param encryptedMemberId string value / 文字列値
   * @param shopcode string value / 文字列値
   * @returns either { data, status } for success or { status, errorCode } for error / 成功の場合は { data, status }、エラーの場合は { status, errorCode }
   */
  public async getPocketRegiCartProducts(encryptedMemberId: string) {
    const collectionName = this.USERS_COLLECTION_NAME;
    const subCollectionName =
      this.USERS_POKETREGI_CART_PRODUCTS_COLLECTION_NAME;
    try {
      this.logger.info('getting data from pocketRegiCartProducts start');

      const docId = encryptedMemberId;
      const docRef = this.getFirestoreDocRef(collectionName, docId);
      const subDocId = POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME;
      const { subDoc } = await this.getDocumentFromSubCollection(
        docRef,
        subCollectionName,
        subDocId,
      );
      if (!subDoc) {
        return {
          errorCode: ErrorCode.CART_PRODUCTS_NOT_FOUND,
          status: HttpStatus.NOT_FOUND,
        };
      }

      this.logger.info('getting data from pocketRegiCartProducts end');
      return {
        data: subDoc,
        status: HttpStatus.OK,
      };
    } catch (e: unknown) {
      this.commonService.logException(
        `Getting data from pocket regi cart products failed`,
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
   * Error handling for mule and gmo system / mule と gmo システムのエラー処理
   * @param error error object of type AxiosError
   * @returns {ErrorCode: string, ErrorMessage: string, StatusCode: number} Customized error object / カスタマイズされたエラー オブジェクト
   */
  public errorHandling(error: AxiosError) {
    const errorObject: SettlementMuleError = error.response.data;
    let errorCode: string;
    let errorMessage: string;
    let statusCode: number;
    if (errorObject.status === 500 && errorObject.errors) {
      const description = errorObject.description
        ? ` ${errorObject.description}`
        : '';
      errorCode = ErrorCode.GMO_ERROR;
      errorMessage = `${ErrorMessage[ErrorCode.GMO_ERROR]}.${description}`;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (error.response.status === 500) {
      errorCode = ErrorCode.MULE_API_SERVER_ERROR;
      errorMessage = ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR];
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (error.response.status === 401) {
      errorCode = ErrorCode.MULE_API_UNAUTHORIZED_ACCESS;
      errorMessage = ErrorMessage[ErrorCode.MULE_API_UNAUTHORIZED_ACCESS];
      statusCode = HttpStatus.UNAUTHORIZED;
    } else {
      errorCode = ErrorCode.MULE_API_BAD_REQUEST;
      errorMessage = ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST];
      statusCode = HttpStatus.BAD_REQUEST;
    }
    return {
      code: errorCode,
      messageUI: errorMessage,
      status: statusCode,
    };
  }

  /**
   * Set special log event for purchase success or fail / 購入の成功または失敗に対する特別なログイベントを設定する
   * Ones logs in log events then Log Router Sink service trigger and send to BigQuery / ログイベントにログを記録し、次に Log Router Sink サービスをトリガーして BigQuery に送信します。
   * @param request creditmuleorder request
   * @param orderDetail pocketregi order detail
   * @param response response creditmuleorder success response
   */
  public async setPurchaseLog(
    encryptedMemberId: string,
    request: SettlementDto,
    orderDetail: PurchaseOrder,
    response?: SettlementMuleResponse,
  ) {
    this.logger.info('setPurchaseLog function is started');
    const logData = await this.getPurchaseEventData(
      encryptedMemberId,
      request,
      orderDetail,
      response,
    );
    if (logData) {
      // please dont remove, We are putting purchase event in log explore as object. / 削除しないでください. 購入イベントをオブジェクトとしてログエクスプローラーに配置します
      console.log(JSON.stringify(logData));
    } else {
      this.commonService.logException(`failed to set PurchaseLog`, null);
      // Create an HTTP exception with appropriate error codes and status / 適切なエラーコードとステータスを持つHTTP例外を生成
      this.commonService.createHttpException(
        ErrorCode.PURCHASE_LOG_EVENT,
        ErrorMessage[ErrorCode.PURCHASE_LOG_EVENT],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('setPurchaseLog function is ended.');
  }

  /**
   *  Get purchase event data / 購入イベントデータの取得
   * @param request creditmuleorder request
   * @param orderDetail pocketregiItems
   * @param response response creditmuleorder success response
   * @returns Purchase data
   */
  private async getPurchaseEventData(
    encryptedMemberNo: string,
    request: SettlementDto,
    orderDetail: PurchaseOrder,
    response?: SettlementMuleResponse,
  ) {
    if (!request || !orderDetail || orderDetail.products.length === 0) {
      return undefined;
    }
    const purchaseEvent = {
      currency: FixedPurchaseEventData.CURRENCY,
      customer_type: FixedPurchaseEventData.CUSTOMER_TYPE,
      encrypted_member_no: encryptedMemberNo,
      event_date: this.commonService.getDateTimeStringJST(),
      fullfillment_method: FixedPurchaseEventData.FULFILLMENT_METHOD,
      products: orderDetail.products,
      log_type: FixedPurchaseEventData.LOG_TYPE,
      payment_type: request.paymentMethod,
      subtotal_consumption_tax_by_reduced_rate:
        orderDetail.subtotalConsumptionTaxByReducedRate
          ? orderDetail.subtotalConsumptionTaxByReducedRate
          : 0,
      subtotal_consumption_tax_by_standard_rate:
        orderDetail.subtotalConsumptionTaxByStandardRate
          ? orderDetail.subtotalConsumptionTaxByStandardRate
          : 0,
      subtotal_price_by_reduced_tax_rate:
        orderDetail.subtotalPriceByReducedTaxRate
          ? orderDetail.subtotalPriceByReducedTaxRate
          : 0,
      subtotal_price_by_standard_tax_rate:
        orderDetail.subtotalPriceByStandardTaxRate
          ? orderDetail.subtotalPriceByStandardTaxRate
          : 0,
      point_discount: orderDetail.totalPointUsed,
      shipping: FixedPurchaseEventData.SHIPPING,
      shop_code: `0000${orderDetail.storeCode}`.slice(-4),
      shop_name: orderDetail.storeName,
      transaction_id: request.orderId,
      value: request.totalAmount,
      detail_number: response?.shortOrderId ? response.shortOrderId : undefined,
    } as PurchaseEvent;
    return purchaseEvent;
  }
}
