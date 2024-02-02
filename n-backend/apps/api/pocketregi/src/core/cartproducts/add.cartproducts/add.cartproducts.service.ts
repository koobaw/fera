import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  Claims,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import {
  ProductDetailRequest,
  ProductDetailResponse,
} from '../interfaces/cartproducts.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';

@Injectable()
export class AddProductDetailService {
  private readonly FIRESTORE_COLLECTION_NAME = USERS_COLLECTION_NAME;

  private readonly FIRESTORE_SUB_COLLECTION_NAME =
    POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME;

  private readonly FIRESTORE_CART_PRODUCTS =
    POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME;

  private readonly DPT_CODE = '077';

  constructor(
    private httpService: HttpService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly loggingService: LoggingService,
    private firestoreBatchService: FirestoreBatchService,
    private pocketRegiCartCommonService: PocketRegiCartCommonService,
  ) {}

  /**
   * Fetches product details from get-product-detail and get-price api /
   * get-product-details および get-price API から製品の詳細を取得します
   * @param { ProductDetailRequest } productDetailReq contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @param { string } bearerToken authorization token from frontend / フロントエンドからの認可トークン
   * @param { Claims } claims contains userClaims / userClaim が含まれています
   * @returns { Promise<ProductDetailResponse> }
   */
  public async fetchProductDetails(
    productDetailReq: ProductDetailRequest,
    bearerToken: string,
    claims: Claims,
  ) {
    let productId = '';
    let code128Discount;
    // check for discount sticker barcode
    if (productDetailReq.productId.length > 13) {
      productId = productDetailReq.productId.slice(0, 13);
      code128Discount = [
        {
          discountMethod: productDetailReq.productId.slice(13, 15),
          discount: Number(productDetailReq.productId.slice(15, 21)),
          appliedCount: 1,
        },
      ];
    } else {
      productId = productDetailReq.productId;
      code128Discount = null;
    }
    const { encryptedMemberId } = claims;
    const url = `${this.env.get<string>('GET_PRODUCT_DETAIL_API')}${productId}`;
    this.loggingService.info('Calling Get product Detail Api');
    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          headers: {
            Authorization: bearerToken,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            const { errCode, errMessage, status } =
              this.pocketRegiCartCommonService.handleException(error);
            this.commonService.logException('Mule Error occurred', error);
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
    if (!data) {
      this.commonService.logException(`No product detail found for`, productId);
      this.commonService.createHttpException(
        ErrorCode.PRODUCT_DETAIL_API_ERROR,
        ErrorMessage[ErrorCode.PRODUCT_DETAIL_API_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // get the price of the product
    const priceDetail = await this.getPriceDetails(
      bearerToken,
      productDetailReq,
      encryptedMemberId,
    );
    const productDetailResponse: ProductDetailResponse = {
      productId: data.data[0].productId,
      productName: data.data[0].name,
      imageUrls: data.data[0].imageUrls,
      quantity: 1,
      taxRate: data.data[0].consumptionTaxRate,
      priceIncludingTax: priceDetail.data[0].priceIncludingTax,
      salePriceIncludingTax: priceDetail.data[0].salePriceIncludingTax
        ? priceDetail.data[0].salePriceIncludingTax
        : null,
      isAlcoholic: data.data[0].departmentCode === this.DPT_CODE,
      code128DiscountDetails: code128Discount,
    };
    this.loggingService.info('Product Details successful');
    await this.saveProductDetailToFirestore(
      encryptedMemberId,
      productDetailResponse,
    );
    return {
      data: productDetailResponse,
      code: HttpStatus.CREATED,
      message: 'OK',
    };
  }

  /**
   * Gets price detail from price-api / Price-API の価格の詳細を取得する
   * @param { string } bearerToken authorization token from frontend / フロントエンドからの認可トークン
   * @param { ProductDetailRequest } productDetailReq contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @param { string } encryptedMemberId encrypted memberId of the user /
   * encrypted memberId of the user
   * @returns the price details from the Price api / Price API からの価格の詳細
   */
  public async getPriceDetails(
    bearerToken: string,
    productDetailReq: ProductDetailRequest,
    encryptedMemberId: string,
  ) {
    const userData = this.firestoreBatchService
      .findCollection(this.FIRESTORE_COLLECTION_NAME)
      .doc(encryptedMemberId)
      .get();
    const { rank } = (await userData).data();
    const productId = productDetailReq.productId.slice(0, 13);
    const url = `${this.env.get<string>('GET_PRICE_API')}${productId}/${
      productDetailReq.storeCode
    }/${rank}`;
    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          headers: {
            Authorization: bearerToken,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            const { errCode, errMessage, status } =
              this.pocketRegiCartCommonService.handleException(error);
            this.commonService.logException('Mule Error occurred', error);
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
    if (!data) {
      this.commonService.logException(`Price detail not found for`, productId);
      this.commonService.createHttpException(
        ErrorCode.PRICE_API_ERROR,
        ErrorMessage[ErrorCode.PRICE_API_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  /**
   * Saves product detail to firestore / 製品の詳細を Firestore に保存する
   * @param { string } encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   * @param productDetail contains the product detail response / 製品詳細の応答が含まれています
   */
  async saveProductDetailToFirestore(
    encryptedMemberId: string,
    productDetail: ProductDetailResponse,
  ) {
    try {
      let existingProducts =
        await this.pocketRegiCartCommonService.getPocketRegiProductFromFirestore(
          encryptedMemberId,
        );
      // finding index if the productId already exists
      const existingProductIndex = existingProducts.findIndex(
        (product) => product.productId === productDetail.productId,
      );
      // finding sub item index if the productId already exists
      const subItemsExist = this.findSubProduct(
        existingProducts,
        productDetail.productId,
        productDetail.code128DiscountDetails,
      );
      // update the existing productDetail if the product is already present
      if (existingProductIndex !== -1) {
        existingProducts[existingProductIndex].quantity +=
          productDetail.quantity;
        existingProducts[existingProductIndex].priceIncludingTax +=
          productDetail.priceIncludingTax;
        if (productDetail.code128DiscountDetails) {
          const existingDiscount =
            existingProducts[existingProductIndex].code128DiscountDetails;
          const discountDetails = this.CheckExistingDiscount(
            productDetail.code128DiscountDetails,
            existingDiscount,
          );
          existingProducts[existingProductIndex].code128DiscountDetails =
            discountDetails;
        }
      } else if (subItemsExist) {
        existingProducts = subItemsExist;
      } else {
        // push the new productDetail object
        existingProducts.push(productDetail);
      }
      // set the data in firestore
      const productsInCart = this.firestoreBatchService
        .findCollection(this.FIRESTORE_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(this.FIRESTORE_SUB_COLLECTION_NAME);
      const docRef = productsInCart.doc(this.FIRESTORE_CART_PRODUCTS);

      await this.firestoreBatchService.batchSet(
        docRef,
        { products: existingProducts },
        {
          merge: true,
        },
      );
      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Save product details to firestore failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find sub items in collection  / コレクション内のサブアイテムを検索する
   * @param cartProduct contains the existing product detail of firestore /
   * Firestore の既存の製品の詳細が含まれています
   * @param  productId contains the product id  /
   * 製品IDが含まれています
   * @param  productDiscount contains the discount details of frontend request  /
   * フロントエンドリクエストの割引詳細が含まれます
   * @returns updated sub item object with quantity / 数量を含む更新されたサブ品目オブジェクト
   */
  public findSubProduct(cartProduct: any, productId: string, productDiscount) {
    let subItemDetail;
    let cartIndex = -1;
    const updateCart = cartProduct;
    let checkSubItemExist = 0;
    cartProduct.forEach((cartProd) => {
      cartIndex++;
      if (cartProd.subItems) {
        subItemDetail = cartProd.subItems.findIndex(
          (subitem) => subitem.productId === productId,
        );
        if (subItemDetail !== -1) {
          updateCart[cartIndex].subItems[subItemDetail].quantity =
            cartProd.subItems[subItemDetail].quantity + 1;
          if (productDiscount) {
            const existingDiscount =
              updateCart[cartIndex].subItems[subItemDetail]
                .code128DiscountDetails;
            const discountDetails = this.CheckExistingDiscount(
              productDiscount,
              existingDiscount,
            );
            updateCart[cartIndex].subItems[
              subItemDetail
            ].code128DiscountDetails = discountDetails;
          }

          checkSubItemExist = 1;
        }
      }
    });
    if (checkSubItemExist) {
      return updateCart;
    }
    return false;
  }

  /**
   * Check discount for existing cart products   / 既存のカート商品の割引を確認する
   * @param productDiscount accept array that contains the discount from request  /
   * リクエストからの割引を含む配列を受け入れます
   * @param existingDiscount  accept array that contains the existing product detail of firestore /
   * Firestore の既存の製品詳細を含む配列を受け入れます
   * @returns updated product detail with discount code / 割引コードを含む製品詳細を更新しました
   */
  public CheckExistingDiscount(productDiscount, existingDiscount) {
    let discountExist = 0;
    const updatedDiscount = existingDiscount;
    let codeIndex = -1;
    if (existingDiscount) {
      existingDiscount.forEach((code128Details) => {
        codeIndex++;
        if (
          code128Details.discountMethod === productDiscount[0].discountMethod &&
          code128Details.discount === productDiscount[0].discount
        ) {
          updatedDiscount[codeIndex].appliedCount =
            code128Details.appliedCount + 1;
          discountExist = 1;
        }
      });
      if (!discountExist) {
        updatedDiscount.push(productDiscount[0]);
      }
    } else {
      return productDiscount;
    }
    return updatedDiscount;
  }
}
