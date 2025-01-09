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
import { ProductDeleteRequest } from '../interfaces/cartproducts.interface';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';

@Injectable()
export class DeleteProductService {
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
   * Delete product details / 商品詳細の削除
   * @param { ProductDeleteRequest } ProductDeleteReq contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @param { Claims } claims contains userClaims / userClaim が含まれています
   * @returns delete response
   */
  public async deleteCartProduct(
    ProductDeleteReq: ProductDeleteRequest,
    claims: Claims,
  ) {
    const { encryptedMemberId } = claims;
    this.loggingService.info('Product update starting');
    const ProductDetails = {
      productId: ProductDeleteReq.productId,
    };
    await this.deleteProductDetailToFirestore(
      encryptedMemberId,
      ProductDetails,
    );
    return {
      code: HttpStatus.OK,
      message: 'OK',
    };
  }

  /**
   * Delete product details from firestore  / Firestore から製品の詳細を削除する
   * @param { string } encryptedMemberId encryptedMemberId / 暗号化されたメンバーID
   * @param { ProductDeleteRequest } productDetail contains the request data from the frontend /
   * フロントエンドからのリクエストデータが含まれます
   * @returns firestore response
   */
  public async deleteProductDetailToFirestore(
    encryptedMemberId: string,
    productDetail: ProductDeleteRequest,
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
      let deletedProduct;
      if (existingProductIndex !== -1) {
        deletedProduct = existingProducts.filter(
          (product) => product.productId !== productDetail.productId,
        );
      } else {
        existingProducts.forEach((cartProd, index) => {
          if (cartProd.subItems) {
            existingProducts[index].subItems = cartProd.subItems.filter(
              (prod) => prod.productId !== productDetail.productId,
            );
            if (existingProducts[index].subItems.length === 0) {
              existingProducts.splice(index, 1);
            }
          }
          deletedProduct = existingProducts;
        });
      }
      const productsInCart = this.firestoreBatchService
        .findCollection(this.FIRESTORE_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(this.FIRESTORE_SUB_COLLECTION_NAME);
      const docRef = productsInCart.doc(this.FIRESTORE_CART_PRODUCTS);
      this.firestoreBatchService.batchSet(
        docRef,
        { products: deletedProduct },
        {
          merge: true,
        },
      );

      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException(
        'Delete product to firestore is failed',
        error,
      );
      this.commonService.createHttpException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
