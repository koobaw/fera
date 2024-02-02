import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  CartProducts,
  Code128DiscountDetails,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  SubItem,
  USERS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import firestore from '@google-cloud/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';
import { GetDiscountedPriceApiService } from '../get.discountedPrice/get.discountedPrice.service';
import {
  DiscountPriceItems,
  GetDiscountedPriceResponseMule,
  ProductIdsAndQuantity,
} from '../interfaces/getdiscountedPrice.interface';

@Injectable()
export class CartProductsService {
  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
    private readonly getDiscountedPriceApiService: GetDiscountedPriceApiService,
    private readonly logger: LoggingService,
    private readonly pocketregiCartUtilService: PocketRegiCartCommonService,
  ) {}

  /**
   * Gets discounted price for cart products / カート商品の割引価格を取得します
   * @param storeCode: Storecode where the product was scanned /
   * 製品がスキャンされた店舗コード
   * @param encryptedMemberId: encryptedMemberId / 暗号化されたメンバーID
   * @param membershipRank: membership rank of user / ユーザーの会員ランク
   * @returns arrange products in to a format & return array / 製品をフォーマットに配置して配列を返す
   */
  public async getDiscountedPriceForCartProducts(
    storeCode: string,
    encryptedMemberId: string,
    membershipRank: string,
  ): Promise<CartProducts[]> {
    let formattedProductsData: CartProducts[] = [];
    const cartProductsFromFirestore = await this.fetchProductsFromCart(
      encryptedMemberId,
    );
    if (cartProductsFromFirestore) {
      const cartProducts =
        cartProductsFromFirestore.products as Array<CartProducts>;

      // Get all the productIds and quantity to send to discountprice api / すべての productId と数量を取得して、discountprice API に送信します
      const productIdsAndQuantity: ProductIdsAndQuantity[] =
        this.pocketregiCartUtilService.getProductIdsAndQuantity(cartProducts);

      const discountedPriceForProducts: GetDiscountedPriceResponseMule =
        await this.getDiscountedPriceApiService.getDiscountedPriceFromMule(
          storeCode,
          productIdsAndQuantity,
          membershipRank,
        );

      if (discountedPriceForProducts === null) {
        this.commonService.createHttpException(
          ErrorCode.DETAIL_NG_NOT_FOUND,
          ErrorMessage[ErrorCode.DETAIL_NG_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        );
      }
      const discountedPriceItems: DiscountPriceItems[] =
        discountedPriceForProducts.items;
      // group the products based on prodictIds / prodictId に基づいて製品をグループ化する
      const groupedProductMule =
        this.groupProductBasedOnProductCodes(discountedPriceItems);
      // format the response which is saved to firestore cart / Firestore カートに保存される応答をフォーマットします
      formattedProductsData = this.formatProductsToSaveToFirestore(
        cartProducts,
        groupedProductMule,
      );
    }
    return formattedProductsData;
  }

  /**
   * Fetch products from firestore cart / Firestore カートから製品を取得します
   * @param encryptedMemberId: encryptedMemberId / 暗号化されたメンバーID
   * @returns Firestore document / Firestore ドキュメント
   */
  public async fetchProductsFromCart(encryptedMemberId: string): Promise<any> {
    this.logger.info('start fetching cart-products from firestore');
    let data: any;
    try {
      // ユーザが保持するmystoreを取得
      const cartProductsDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME)
        .doc(POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME);

      data = (await cartProductsDocRef.get()).data();
    } catch (e: unknown) {
      this.commonService.logException(
        `Get cartproducts data from firestore failed`,
        e,
      );
      this.commonService.createHttpException(
        ErrorCode.FIRESTORE_OPERATION,
        ErrorMessage[ErrorCode.FIRESTORE_OPERATION],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('finish fetching cartproducts from firestore');
    return data;
  }

  /**
   * Groups product based on product codes / 製品コードに基づいて製品をグループ化する
   * @param discountedPriceItems  discountedPriceItems / 割引価格アイテム
   * @returns product based on product codes / 製品コードに基づいた製品
   */
  private groupProductBasedOnProductCodes(
    discountedPriceItems,
  ): DiscountPriceItems[] {
    discountedPriceItems.forEach((discountProd, index) => {
      // find the index of the object where salestype0 or 1 product is also inside salestype 2 or 3
      // salestype0 または 1 製品が salestype 2 または 3 内にあるオブジェクトのインデックスを検索します
      if (!discountProd.subItems) {
        const indexOfSalesType2or3 = discountedPriceItems.findIndex(
          (productToFind) =>
            productToFind.subItems &&
            productToFind.subItems.some(
              (subItemProd) =>
                discountProd.productCode === subItemProd.productCode,
            ),
        );
        // if index was found then change the quantity and salePrice / インデックスが見つかった場合は、数量と salePrice を変更します
        if (indexOfSalesType2or3 >= 0) {
          const newObj = discountedPriceItems[
            indexOfSalesType2or3
          ].subItems.map((product) => {
            if (product.productCode === discountProd.productCode) {
              const newObj2 = {
                ...product,
                quantity: product.quantity + discountProd.quantity,
                salesAmount: product.salesAmount + discountProd.subtotalAmount,
              };
              return newObj2;
            }
            return product;
          });
          // update the subtotal amount of grouped productIds / グループ化された productId の小計量を更新します
          const finalObject = {
            ...discountedPriceItems[indexOfSalesType2or3],
            subtotalAmount:
              discountedPriceItems[indexOfSalesType2or3].subtotalAmount +
              discountProd.subtotalAmount,
            subItems: newObj,
          };
          // replace the ungrouped productIds with the grouped productIds object
          // グループ化されていない productIds をグループ化された productIds オブジェクトに置き換えます。
          discountedPriceItems.splice(indexOfSalesType2or3, 1, finalObject);
          // remove the product which has already been grouped into subitems
          // すでにサブアイテムにグループ化されている製品を削除します
          discountedPriceItems.splice(index, 1);
        }
      }
    });
    return discountedPriceItems;
  }

  /**
   * Merge the details of discountPrice api and product details / discountPrice API の詳細と製品の詳細をマージします
   * @param cartProducts CartProducts from firestore which has product details
   * @param discountedPriceForProducts Product details from discountPrice api
   * @returns Array of object where each object is of type CartProducts
   */
  private formatProductsToSaveToFirestore(
    cartProducts: CartProducts[],
    discountedPriceItems: DiscountPriceItems[],
  ): CartProducts[] {
    const dataBeforeDiscount = discountedPriceItems.map((discountProduct) => {
      let productDetail: CartProducts;
      if (!discountProduct.subItems) {
        // find the product details in firestore cart / Firestore カートで製品の詳細を見つける
        const findProduct = this.pocketregiCartUtilService.findInProducts(
          cartProducts,
          discountProduct,
        );
        if (findProduct) {
          const saveData = this.pocketregiCartUtilService.createCartProductData(
            findProduct,
            discountProduct,
          );
          // since sales type 0 or 1 add the subtotalamount field to the merged product details
          // 売上タイプが 0 または 1 であるため、結合された製品の詳細に subtotalmount フィールドが追加されます。
          const finalDataToSave = {
            subtotalAmount: discountProduct.subtotalAmount,
            ...saveData,
          };
          productDetail = finalDataToSave;
        }
      } else {
        // when discountedproduct has subitems (salestype 'mixmatch' or 'setItems') / 割引商品にサブアイテムがある場合 (販売タイプ 'mixmatch' または 'setItems')
        const mergedData = discountProduct.subItems.map((discountSubItem) => {
          // find the product details of each subitem from firestore cart
          // Firestore カートから各サブアイテムの製品詳細を検索します
          const findProduct = this.pocketregiCartUtilService.findInProducts(
            cartProducts,
            discountSubItem,
          );

          // gets the merged product detail of each subitem of the discounted product
          // 割引商品の各サブアイテムのマージされた商品詳細を取得します
          const saveData = this.pocketregiCartUtilService.createCartProductData(
            findProduct,
            discountSubItem,
          );
          return saveData;
        });
        // merge the new subitems field which has price and product details with other details from discount mule api
        // 価格と製品の詳細を含む新しいサブアイテムフィールドを、割引ミュール API の他の詳細とマージします。
        productDetail = {
          ...(discountProduct.mixMatchCode
            ? { mixMatchCode: discountProduct.mixMatchCode }
            : { setItemCode: discountProduct.setItemCode }),
          subtotalAmount: discountProduct.subtotalAmount,
          subItems: mergedData,
        };
      }
      // return the new subitems with merged data / マージされたデータを含む新しいサブアイテムを返します
      return productDetail;
    });

    const dataAfterDiscount: CartProducts[] =
      this.applyDiscount(dataBeforeDiscount);

    return dataAfterDiscount as CartProducts[];
  }

  /**
   * Create new object after applying discount with updated calculations /
   * 更新された計算で割引を適用した後、新しいオブジェクトを作成します
   * @param dataBeforeDiscount Products in cart without applying the discount sticker /
   * 割引シールが貼られていない商品をカートに入れた場合
   * @returns Products in cart after applying discount sticker / 割引シールを貼った後のカート内の商品
   */
  private applyDiscount(dataBeforeDiscount: CartProducts[]): CartProducts[] {
    const productsAfterDiscount = dataBeforeDiscount.map((prodToApply) => {
      let finalObjectAfterDiscount;
      if (!prodToApply.subItems) {
        // only if product has discount sticker details apply discount else return the object
        // 製品に割引ステッカーの詳細がある場合のみ割引を適用し、それ以外の場合はオブジェクトを返します
        if (prodToApply.code128DiscountDetails) {
          finalObjectAfterDiscount = this.setDiscountForProduct(
            prodToApply,
            prodToApply.code128DiscountDetails,
          );
        } else {
          finalObjectAfterDiscount = prodToApply;
        }
      } else {
        const newObjWithoutSubTotalCalculation = prodToApply.subItems.map(
          (subItemProd) => {
            // only if subitem has discount sticker details apply discount else return the object
            // サブアイテムに割引ステッカーの詳細がある場合のみ割引を適用し、それ以外の場合はオブジェクトを返します
            if (subItemProd.code128DiscountDetails) {
              return this.setDiscountForSubItems(
                subItemProd,
                subItemProd.code128DiscountDetails,
              );
            }
            return subItemProd;
          },
        );
        // create a new object where subitems is updated with discount value
        // サブアイテムが割引値で更新される新しいオブジェクトを作成します
        const mergeSubItemsWithParent = {
          ...prodToApply,
          subItems: newObjWithoutSubTotalCalculation,
        };
        // update the subtotalamount after the subitems is merged since saleprice changes after applying discount sticker
        // 割引ステッカーを適用した後に販売価格が変更されるため、小項目が結合された後に小計金額を更新します
        finalObjectAfterDiscount = this.setSubtotalAmount(
          mergeSubItemsWithParent,
        );
      }
      return finalObjectAfterDiscount;
    });
    return productsAfterDiscount as CartProducts[];
  }

  /**
   * Set Subtotal Amount after applying discount / 割引適用後の小計金額を設定
   * @param  {SalesItem} itemObj to calculate subtotal amount pass object of cart product items /
   * カート商品アイテムの小計金額を計算するパスオブジェクト
   * @returns object of CartProducts in which subtotalAmount is updated. /
   * subtotalAmount が更新される CartProducts のオブジェクト。
   */
  private setSubtotalAmount(itemObj: CartProducts) {
    const newObj = itemObj;
    // recalculating subtotal amount / 小計金額を再計算する
    newObj.subtotalAmount = 0;
    itemObj.subItems.forEach((item) => {
      newObj.subtotalAmount += item.salePrice;
    });
    return newObj;
  }

  /**
   * Sets discount for the products / 商品のセット割引
   * @param discountStickerProduct Product to apply the discount sticker / 割引シールを貼る商品
   * @param discountDetails Details of the discount sticker / 割引ステッカーの詳細
   * @returns Product after applying the discount / 割引適用後の商品
   */
  private setDiscountForProduct(
    discountStickerProduct: CartProducts,
    discountDetails: Code128DiscountDetails[],
  ): CartProducts {
    const salesItem: CartProducts = discountStickerProduct;
    salesItem.subtotalAmount -= this.getDiscountedAmount(
      discountDetails,
      salesItem.unitPrice,
    );
    return salesItem;
  }

  /**
   * Sets discount to products inside subItems / subItems内の製品に割引を設定します
   * @param discountStickerProduct Product to apply the discount sticker / 割引シールを貼る商品
   * @param discountDetails Details of the discount sticker / 割引ステッカーの詳細
   * @returns Product after applying the discount / 割引適用後の商品
   */
  private setDiscountForSubItems(
    discountStickerProduct: SubItem,
    discountDetails: Code128DiscountDetails[],
  ): SubItem {
    const salesItem: SubItem = discountStickerProduct;
    salesItem.salePrice -= this.getDiscountedAmount(
      discountDetails,
      salesItem.unitPrice,
    );
    return salesItem;
  }

  /**
   * Gets discounted amount to be reduced from subtotal and saleprice / 小計とセール価格から減額される割引額を取得します
   * @param discountDetails Discount sticker details / 割引ステッカーの詳細
   * @param unitPrice Unit Price of the product / 商品の単価
   * @returns discounted amount / 割引額
   */
  private getDiscountedAmount(
    discountDetails: Code128DiscountDetails[],
    unitPrice: number,
  ): number {
    let finalDiscountPrice = 0;
    discountDetails.forEach((discountSticker) => {
      const { discountMethod, discount, appliedCount } = discountSticker;
      // rounding up the value to 1 decimal place and then rounding it to number
      finalDiscountPrice +=
        Math.ceil(
          this.getDiscountPerPiece(discountMethod, discount, unitPrice),
        ) * appliedCount;
    });
    return finalDiscountPrice;
  }

  /**
   * Get the discount amount per piece / 1個あたりの割引額を取得します
   * @param discountMethod 03: %discount, 02: yen discount / 03：%値引, 02: 円値引
   * @param discount discount amount based on discount method / 割引方法による割引額
   * @param unitPrice unit price of a product / 商品の単価
   * @return discount per piece / 1個あたりの割引
   */
  private getDiscountPerPiece(
    discountMethod: string,
    discount: number,
    unitPrice: number,
  ) {
    let discountPrice: number;
    if (discountMethod === '02') {
      discountPrice = discount;
    } else if (discountMethod === '03') {
      discountPrice = unitPrice * (discount / 100);
    }
    return discountPrice;
  }

  /**
   * Saves the new cartProducts into Firestore / 新しいカート製品を Firestore に保存します
   * @param cartProducts updated product details to save in firestore / Firestore に保存する製品の詳細を更新しました
   * @param operatorName system name which gets saved in firestore / Firestoreに保存されるシステム名
   * @returns object with products of type CartProducts[] , totalPrice of type number /
   * CartProducts[] 型の製品、数値型の totalPrice を含むオブジェクト
   */
  public async saveToFirestore(
    cartProducts: CartProducts[],
    operatorName: string,
    encryptedMemberId: string,
  ) {
    const { totalPriceFirestore } =
      this.pocketregiCartUtilService.updatePocketRegiSummary(cartProducts);
    const dataToSaveToFirestore = {
      products: cartProducts,
      totalAmount: totalPriceFirestore,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    };
    this.logger.debug('start saving to firestore');

    try {
      const cartProductsDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME)
        .doc(POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME);

      await this.firestoreBatchService.batchSet(
        cartProductsDocRef,
        dataToSaveToFirestore,
        {
          merge: true,
        },
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${USERS_COLLECTION_NAME} is failed`,
        e,
      );
      this.commonService.createHttpException(
        ErrorCode.FIRESTORE_OPERATION,
        ErrorMessage[ErrorCode.FIRESTORE_OPERATION],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end saving to firestore');
    return {
      products: dataToSaveToFirestore.products,
      totalAmount: dataToSaveToFirestore.totalAmount,
    };
  }

  /**
   * Send the response of this api / このAPIのレスポンスを送信します
   * @param savedProductDetails the merged product details and total amount will be sent from this api /
   *  統合された商品詳細と合計金額はこの API から送信されます
   * @returns formatted response to send from this api / この API から送信するフォーマットされた応答
   */
  public getResponse(savedProductDetails) {
    return {
      data: {
        products: savedProductDetails.products,
        totalAmount: savedProductDetails.totalAmount,
      },
      code: 200,
      message: 'OK',
    };
  }

  /**
   * Fetch membership rank from firestore / Firestoreからメンバーシップランクを取得します
   * @param encryptedMemberId encrypted memberId in string / 文字列内の暗号化された memberId
   * @returns membership rank of the user as string /
   * ユーザーのメンバーシップランクを文字列として指定する
   */
  public async fetchMembershipRank(encryptedMemberId: string): Promise<string> {
    const userDataRef = this.firestoreBatchService
      .findCollection(USERS_COLLECTION_NAME)
      .doc(encryptedMemberId);

    const { rank } = (await userDataRef.get()).data();
    return rank;
  }
}
