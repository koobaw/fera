import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import {
  USERS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME,
  STORES_COLLECTION_NAME,
  PocketRegiCreditCard,
} from '@cainz-next-gen/types';
import { LoggingService } from '@cainz-next-gen/logging';
import { AxiosError } from 'axios';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';
import { SettlementMuleError } from '../core/settlement/interface/settlement.interface';
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

  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
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
    subDocId: any,
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
  public async getShopDetails(shopcode: string) {
    this.logger.info('getting shop details from firestore in starts');
    const docId = this.commonService.createMd5(shopcode.replace(/^0+/, ''));

    const { doc } = await this.getDocumentFromCollection(
      this.STORE_COLLECTION_NAME,
      docId,
    );
    if (!doc) {
      return {
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
    }
    this.logger.info('getting shop details from firestore in ends');
    return {
      data: doc,
      status: HttpStatus.OK,
    };
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
    let pointGranted: number;

    const items = [];
    products.forEach((product) => {
      let dataFetch;
      if (product.subItems && product.subItems.length) {
        dataFetch = product.subItems;
      } else {
        dataFetch = product;
      }

      this.totalProductQuantity += dataFetch.quantity;

      const item = {
        productCode: dataFetch.productId,
        quantity: dataFetch.quantity,
        amount: dataFetch.subtotalAmount,
      };
      items.push(item);

      if (Number(product.taxRate) === 10) {
        totalPriceTax10 += Number(product.subtotalAmount);
      } else if (Number(product.taxRate) === 8) {
        totalPriceTax8 += Number(product.subtotalAmount);
      } else if (Number(product.taxRate) === 0) {
        totalPriceTax0 += Number(product.subtotalAmount);
      }
    });

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
      cainzCardNumber: memberId,
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

    const payload: { [key: string]: any } = { entry };
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
  public async getPocketRegiCartProducts(
    encryptedMemberId: string,
    shopcode: string,
  ) {
    const collectionName = this.USERS_COLLECTION_NAME;
    const subCollectionName =
      this.USERS_POKETREGI_CART_PRODUCTS_COLLECTION_NAME;
    try {
      this.logger.info('getting data from pocketRegiCartProducts start');

      const docId = encryptedMemberId;
      const docRef = this.getFirestoreDocRef(collectionName, docId);
      const subDocId = this.commonService.createMd5(shopcode);
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
}
