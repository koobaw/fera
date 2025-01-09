import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import {
  Claims,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { ProductIdsAndQuantity } from '../interfaces/cartproducts.interface';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';

@Injectable()
export class UpdateProductQuantityService {
  private readonly FIRESTORE_COLLECTION_NAME = USERS_COLLECTION_NAME;

  private readonly FIRESTORE_SUB_COLLECTION_NAME =
    POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME;

  private readonly FIRESTORE_CART_PRODUCTS =
    POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME;

  constructor(
    private readonly commonService: CommonService,
    private readonly loggingService: LoggingService,
    private firestoreBatchService: FirestoreBatchService,
    private pocketRegiCartCommonService: PocketRegiCartCommonService,
  ) {}

  /**
   * Update product details  / 製品詳細を更新
   * @param  productId contains product id from frontend request /
   *  フロントエンドリクエストの製品IDが含まれています
   * @param  quantity contains quantity from frontend request/
   * フロントエンドリクエストからの数量が含まれます
   * @param { Claims } claims contains userClaims / userClaim が含まれています
   * @returns update response
   */
  public async updateCartProduct(productId, quantity, claims: Claims) {
    const { encryptedMemberId } = claims;
    this.loggingService.info('Product update starting');
    const ProductDetails = {
      productId,
      quantity,
    };
    await this.updateProductDetailToFirestore(
      encryptedMemberId,
      ProductDetails,
    );
    return {
      code: HttpStatus.OK,
      message: 'OK',
    };
  }

  /**
   * Save product details in firestore  / 製品の詳細を Firestore に保存する
   * @param { string } encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   * @param { ProductIdsAndQuantity } productDetail contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @returns firestore response
   */
  public async updateProductDetailToFirestore(
    encryptedMemberId: string,
    productDetail: ProductIdsAndQuantity,
  ) {
    const cartProduct =
      await this.pocketRegiCartCommonService.getPocketRegiProductFromFirestore(
        encryptedMemberId,
      );
    try {
      const existingProducts = cartProduct;
      const existingProductIndex = existingProducts.findIndex(
        (product) => product.productId === productDetail.productId,
      );
      let updatedProductCart;
      if (existingProductIndex !== -1) {
        existingProducts[existingProductIndex].quantity = Number(
          productDetail.quantity,
        );
        updatedProductCart = existingProducts;
      } else {
        updatedProductCart = this.findSubProduct(
          existingProducts,
          productDetail,
        );
      }

      const productsInCart = this.firestoreBatchService
        .findCollection(this.FIRESTORE_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(this.FIRESTORE_SUB_COLLECTION_NAME);
      const docRef = productsInCart.doc(this.FIRESTORE_CART_PRODUCTS);
      this.firestoreBatchService.batchSet(
        docRef,
        { products: updatedProductCart },
        {
          merge: true,
        },
      );

      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Update product quantity to firestore is failed',
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
   * @param { ProductIdsAndQuantity } productDetail contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @param { cartProduct } cartProduct contains the existing product detail of firestore /
   * Firestore の既存の製品の詳細が含まれています
   * @returns updated sub item object with quantity / 数量を含む更新されたサブ品目オブジェクト
   */
  public findSubProduct(
    cartProduct: any,
    productDetail: ProductIdsAndQuantity,
  ) {
    let subItemDetail;
    let cartIndex = -1;
    const updateCart = cartProduct;
    cartProduct.forEach((cartProd) => {
      cartIndex++;
      if (cartProd.subItems) {
        subItemDetail = cartProd.subItems.findIndex(
          (subitem) => subitem.productId === productDetail.productId,
        );
        if (subItemDetail !== -1) {
          updateCart[cartIndex].subItems[subItemDetail].quantity =
            productDetail.quantity;
        }
      }
    });
    return updateCart;
  }
}
