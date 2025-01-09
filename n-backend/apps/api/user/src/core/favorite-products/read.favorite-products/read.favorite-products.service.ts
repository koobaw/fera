import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  OmitTimestampUserFavoriteProduct,
  Timestamp,
  USERS_FAVORITES_COLLECTION_NAME,
  USERS_FAVORITES_PRODUCTS_COLLECTION_NAME,
  UserFavoriteProduct,
} from '@fera-next-gen/types';
import firestore from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { FavoritesMuleApiService } from '../favorites-mule-api/favorites-mule-api.service';
import { MuleFavoriteProductReadResponseSuccess } from '../interfaces/favorite-products-mule-api.interface';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { FavoriteProductsMuleApiService } from '../favorite-products-mule-api/favorite-products-mule-api.service';
import { MuleFavoritesReadSuccessResponse } from '../interfaces/favorites-mule-api.interface';
import {
  FavoriteProductsResponseObject,
  ProductServiceApiRequest,
  ProductServiceApiResponse,
} from '../interfaces/favorite-products.interface';
import { CommonFavoriteProductsService } from '../common.favorite-products.service';

@Injectable()
export class ReadFavoriteProductsService {
  constructor(
    private readonly favoritesMuleApiService: FavoritesMuleApiService,
    private readonly favoriteProductsApiService: FavoriteProductsMuleApiService,
    private readonly commonService: CommonService,
    private readonly commonFavoriteProductsService: CommonFavoriteProductsService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async getFavoriteProductsFromFirestore(
    targetFavoritesProductCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  ): Promise<UserFavoriteProduct[]> {
    this.logger.debug('start get data from firestore');
    let snapshot: firestore.QuerySnapshot<firestore.DocumentData>;
    try {
      snapshot = await targetFavoritesProductCollection.get();
    } catch (e) {
      this.commonService.logException(
        `get from firestore/${USERS_FAVORITES_COLLECTION_NAME}/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_GET_FROM_FIRESTORE,
          message: ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_GET_FROM_FIRESTORE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.debug('end get data from firestore');
    }
    const favoriteProducts: UserFavoriteProduct[] = [];
    snapshot?.forEach((doc) =>
      favoriteProducts.push(doc.data() as UserFavoriteProduct),
    );
    return favoriteProducts;
  }

  public async fetchFavoriteProduct(
    memberId: string,
  ): Promise<MuleFavoriteProductReadResponseSuccess[]> {
    const defaultList = await this.fetchDefaultFavorites(memberId);

    if (defaultList == null) {
      return [];
    }

    const favoriteProducts =
      await this.favoriteProductsApiService.fetchFavoriteProducts(
        defaultList.id,
      );

    return favoriteProducts;
  }

  public async saveToFirestore(
    favoriteProducts: OmitTimestampUserFavoriteProduct[],
    targetFavoritesProductCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    operatorName: string,
  ) {
    this.logger.debug('start save to firestore');
    try {
      await Promise.all(
        favoriteProducts.map(async (product) => {
          const docId = product.productId;

          const favoriteProductDocRef =
            targetFavoritesProductCollection.doc(docId);

          const oldFavoriteProduct = await favoriteProductDocRef.get();

          const saveData: UserFavoriteProduct = {
            ...product,
            createdBy: oldFavoriteProduct.data()?.createdBy ?? operatorName,
            createdAt:
              oldFavoriteProduct.data()?.createdAt ??
              firestore.FieldValue.serverTimestamp(),
            updatedBy: operatorName,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          };

          await this.firestoreBatchService.batchSet(
            favoriteProductDocRef,
            saveData,
            {
              merge: true,
            },
          );
        }),
      );

      await this.firestoreBatchService.batchCommit();
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${USERS_FAVORITES_COLLECTION_NAME}/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.debug('end save to firestore');
    }
  }

  public async fetchProductWithPrice(
    productIds: string[],
    storeCode: string,
    membershipRank: '0' | '1' | '2' | '3' | '4',
    accessToken: string,
  ): Promise<FavoriteProductsResponseObject[]> {
    // 1. define parameters
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    const params: ProductServiceApiRequest = {
      select: 'price',
      storeCodes: storeCode,
      membershipRank,
    };
    const url = `${this.env.get<string>(
      'BFF_PRODUCT_SERVICE_BASE_URL',
    )}/${productIds.join()}`;
    // 2. get data from products Service(BFF)
    this.logger.debug('start fetch products with price');
    const { data } = await firstValueFrom(
      this.httpService
        .get<ProductServiceApiResponse>(url, { headers, params })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('Mule API occurred Error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.FAVORITE_PRODUCTS_GET_FROM_BFF,
                message: ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_GET_FROM_BFF],
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    // 3. formatting from raw data to response
    return data.data.map(
      (product) =>
        ({
          productId: product.productId,
          name: product.name,
          thumbnailUrl: product.imageUrls[0],
          price: product.prices[0].priceIncludingTax,
        } as FavoriteProductsResponseObject),
    );
  }

  /**
   * muleから取得したものとfirestore内のデータの差分を見て古いデータを検出する
   */
  public extractNonUpdatedFavoritesProducts(
    favoriteProductsFromFirestore: UserFavoriteProduct[],
    favoriteProductsFromMule: MuleFavoriteProductReadResponseSuccess[],
  ): string[] {
    const productIdsFromMule = favoriteProductsFromMule.map(
      (product) => product.jan,
    );
    if (productIdsFromMule.length === 0) {
      return favoriteProductsFromFirestore.map((product) => product.productId);
    }
    const nonMatchedProductIds = favoriteProductsFromFirestore
      .filter(
        (product) =>
          // Mule側にないfirestoreの商品IDを更新できていないIDとする
          !productIdsFromMule.some((id) => id === product.productId),
      )
      .map((product) => product.id);
    return nonMatchedProductIds;
  }

  public async deleteFavoriteProductsFromFirestore(
    targetFavoritesProductCollection: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    productIds: string[],
  ) {
    this.logger.debug('start delete favorite products from firestore');
    try {
      if (productIds.length === 0) return;
      await Promise.all(
        productIds.map(async (productId) => {
          const favoriteProductDocRef =
            targetFavoritesProductCollection.doc(productId);
          await this.firestoreBatchService.batchDelete(favoriteProductDocRef);
        }),
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e) {
      this.commonService.logException(
        `delete data from firestore/${USERS_FAVORITES_COLLECTION_NAME}/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_DELETE_FROM_DB,
          message: ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_DELETE_FROM_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.debug('end delete favorite products from firestore');
    }
  }

  private async fetchDefaultFavorites(
    memberId: string,
  ): Promise<MuleFavoritesReadSuccessResponse | null> {
    const favoriteProductLists =
      await this.favoritesMuleApiService.fetchFavorites(memberId);
    return favoriteProductLists?.find((list) => list.isDefault) ?? null;
  }

  public isFavoriteProductsExpired(
    favoriteProductsFromFirestore: UserFavoriteProduct[],
    periodMs: number,
  ) {
    const nowMs = new Date().getTime();
    let isExpired = false;
    if (favoriteProductsFromFirestore.length === 0) {
      return true;
    }
    for (let i = 0; i < favoriteProductsFromFirestore.length; i++) {
      const castTimestamp = favoriteProductsFromFirestore[i]
        .updatedAt as Timestamp;
      const deadLineMs = new Date(
        castTimestamp.toMillis() + periodMs,
      ).getTime();
      if (nowMs >= deadLineMs) {
        isExpired = true;
        break;
      }
    }
    return isExpired;
  }

  public async getFavoriteProductIds(
    encryptedMemberId: string,
    memberId: string,
    url: string,
    method: string,
    save: boolean,
  ): Promise<string[]> {
    // get fovariteDoc from firestore
    const favoriteDocSnap =
      await this.commonFavoriteProductsService.getFavoritesDocSnapByUser(
        encryptedMemberId,
      );
    if (!favoriteDocSnap || !favoriteDocSnap.exists) {
      return [];
    }
    // get data from collection in users.favoriteProducts
    const targetFavoritesProductionCollection =
      await favoriteDocSnap.ref.collection(
        USERS_FAVORITES_PRODUCTS_COLLECTION_NAME,
      );
    const favoriteProductsFromFirestore: UserFavoriteProduct[] =
      await this.getFavoriteProductsFromFirestore(
        targetFavoritesProductionCollection,
      );
    // check TTL
    const periodMs = Number(this.env.get<string>('TTL_MS') ?? 0);
    const isExpired = this.isFavoriteProductsExpired(
      favoriteProductsFromFirestore,
      periodMs,
    );
    if (!isExpired) {
      return favoriteProductsFromFirestore.map(
        (favoriteProduct) => favoriteProduct.productId,
      );
    }
    // get data from mule
    const favoriteProductsResponse = await this.fetchFavoriteProduct(memberId);
    // save to firestore and delete unnecessary data from firestore
    if (save) {
      const favoriteProductIds = favoriteProductsResponse.map(
        (it): OmitTimestampUserFavoriteProduct => ({
          productId: it.jan,
          id: it.id,
          userCreatedAt: firestore.Timestamp.now(), // TODO:muleのresponseに日時のデータがないため保留
        }),
      );
      const operatorName = this.commonService.createFirestoreSystemName(
        url,
        method,
      );
      await this.saveToFirestore(
        favoriteProductIds,
        targetFavoritesProductionCollection,
        operatorName,
      );
      const nonUpdatedFirestoreFavoritesProductIds =
        this.extractNonUpdatedFavoritesProducts(
          favoriteProductsFromFirestore,
          favoriteProductsResponse,
        );
      await this.deleteFavoriteProductsFromFirestore(
        targetFavoritesProductionCollection,
        nonUpdatedFirestoreFavoritesProductIds,
      );
    }
    return favoriteProductsResponse.map((product) => product.jan);
  }
}
