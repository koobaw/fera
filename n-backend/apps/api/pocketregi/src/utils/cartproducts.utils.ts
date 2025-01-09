import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { ConfigService } from '@nestjs/config';
import {
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
  Claims,
  CartProducts,
  SubItem,
} from '@fera-next-gen/types';
import { AxiosError } from 'axios';
import { GlobalErrorCode } from '@fera-next-gen/exception';
import { ErrorCode, ErrorMessage } from '../types/constants/error-code';
import { MuleErrorResponse } from '../core/cartproducts/interfaces/cartproducts.interface';
import {
  DiscountPriceItems,
  ProductIdsAndQuantity,
  SubItemMule,
} from '../core/cartproducts/interfaces/getdiscountedPrice.interface';

@Injectable()
export class PocketRegiCartCommonService {
  private readonly FIRESTORE_COLLECTION_NAME = USERS_COLLECTION_NAME;

  private readonly FIRESTORE_SUB_COLLECTION_NAME =
    POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME;

  private readonly FIRESTORE_CART_PRODUCTS =
    POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME;

  constructor(
    private env: ConfigService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Get product details from firestore / Firestore から製品の詳細を取得する
   * @param { string } encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   * @returns product details / 製品詳細
   */
  public async getPocketRegiProductFromFirestore(encryptedMemberId: string) {
    try {
      // Get product from pocketRegiCartDetails
      const productsInCart = this.firestoreBatchService
        .findCollection(this.FIRESTORE_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(this.FIRESTORE_SUB_COLLECTION_NAME);
      const docRef = productsInCart.doc(this.FIRESTORE_CART_PRODUCTS);
      const result = await docRef.get();
      const cartProduct = result.data()?.products || [];
      return cartProduct;
    } catch (error) {
      this.commonService.logException(
        'Get product from firestore is failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return false;
    }
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

  /**
   * Gets decrypted member id from user claims
   * ユーザーの要求から復号化されたメンバー ID を取得します
   * @param { Claims } userClaims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns { Promise<string> } decrypted member id / 復号化された会員ID
   */
  public async getDecryptedMemberId(userClaims: Claims): Promise<string> {
    if (typeof userClaims.encryptedMemberId === 'undefined') {
      this.commonService.createHttpException(
        ErrorCode.INVALID_TOKEN_ID,
        ErrorMessage[ErrorCode.INVALID_TOKEN_ID],
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
      this.commonService.createHttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        ErrorMessage[GlobalErrorCode.CRYPTO_INFO_UNDEFINED],
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!iv) {
      this.commonService.createHttpException(
        GlobalErrorCode.CRYPTO_INFO_UNDEFINED,
        ErrorMessage[GlobalErrorCode.CRYPTO_INFO_UNDEFINED],
        HttpStatus.BAD_REQUEST,
      );
    }
    return [key, iv];
  }

  /**
   * Gets product ids and quantity
   * @param cartProducts
   * @returns Array of object where each object is of type productId:quantity
   */
  public getProductIdsAndQuantity(
    cartProducts: CartProducts[],
  ): ProductIdsAndQuantity[] {
    const productCodeMap = new Map<string, number>();
    const groupedProductsInfo: ProductIdsAndQuantity[] = [];

    cartProducts.forEach((product) => {
      if (!product.subItems || !product.subItems.length) {
        const savedProductQty = productCodeMap.get(product.productId);
        if (savedProductQty !== undefined) {
          productCodeMap.set(
            product.productId,
            savedProductQty + product.quantity,
          );
        } else {
          productCodeMap.set(product.productId, product.quantity);
        }
      } else {
        product.subItems.forEach((subitem) => {
          const savedProductQtySub = productCodeMap.get(subitem.productId);
          if (savedProductQtySub !== undefined) {
            productCodeMap.set(
              subitem.productId,
              savedProductQtySub + subitem.quantity,
            );
          } else {
            productCodeMap.set(subitem.productId, subitem.quantity);
          }
        });
      }
    });

    productCodeMap.forEach((value, key) => {
      groupedProductsInfo.push({
        productId: key,
        quantity: value,
      });
    });
    return groupedProductsInfo;
  }

  /**
   * Finds the product whose details are required
   * @param cartProducts
   * @param discountProduct
   * @returns object of type CartProducts
   */
  public findInProducts(
    cartProducts: CartProducts[],
    discountProduct: DiscountPriceItems | SubItemMule,
  ): CartProducts | SubItem {
    // find the product whose details are required when cart product does not have subItems
    const foundProduct = cartProducts.find(
      (cartProd) =>
        (!cartProd.subItems || !cartProd.subItems.length) &&
        cartProd.productId === discountProduct.productCode,
    );
    // if details were not found then check the subitems field of all the products in cart
    if (!foundProduct) {
      const findSubProduct = this.findInSubProducts(
        cartProducts,
        discountProduct,
      );
      return findSubProduct;
    }
    return foundProduct;
  }

  /**
   * Finds details of product in all the products having subitems field in firestore
   * @param cartProducts
   * @param discountProduct
   * @returns object of type SubItem
   */
  private findInSubProducts(
    cartProducts: CartProducts[],
    discountProduct: DiscountPriceItems | SubItemMule,
  ): SubItem {
    let subItemDetail;
    cartProducts.some((cartProd) => {
      // check for only those products in cart which has subItems field
      if (cartProd.subItems && cartProd.subItems.length) {
        subItemDetail = cartProd.subItems.find(
          (subitem) => subitem.productId === discountProduct.productCode,
        );
      }
      return subItemDetail;
    });
    return subItemDetail;
  }

  /**
   * Creates cart product data which has product details and discount prices.
   * @param findProduct
   * @param discountProduct
   * @returns object of type SubItem
   */
  public createCartProductData(findProduct, discountProduct) {
    const mergedData = {
      code128DiscountDetails: findProduct.code128DiscountDetails
        ? findProduct.code128DiscountDetails
        : [],
      productId: findProduct.productId,
      productName: findProduct.productName,
      imageUrls: findProduct.imageUrls ? findProduct.imageUrls : [],
      isAlcoholic: findProduct.isAlcoholic,
      taxRate: findProduct.taxRate,
      quantity: discountProduct.quantity,
      unitPrice: discountProduct.unitPrice,
      /* using same method to create product structure for salestype 0 and 1 and mixmatch and setItems, 
      the only difference is saleAmount is present only for mixmatch and setItems 
      so adding this field conditionally. */
      ...(discountProduct.salesAmount && {
        salePrice: discountProduct.salesAmount,
      }),
    };
    return mergedData;
  }

  /**
   * Updates pocket regi total price and total quantity
   * @param cartProd
   * @returns totalPrice of type number
   */
  public updatePocketRegiSummary(cartProducts: CartProducts[]) {
    // calculate the subtotalAmount of each saleType
    const totalPriceFirestore = cartProducts.reduce(
      (accumulator, cartProd) => accumulator + cartProd.subtotalAmount,
      0,
    );

    return { totalPriceFirestore };
  }
}
