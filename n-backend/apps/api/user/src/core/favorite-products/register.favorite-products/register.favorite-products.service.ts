import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { protos } from '@google-cloud/tasks';
import {
  OmitTimestampUserFavorite,
  USERS_COLLECTION_NAME,
  USERS_FAVORITES_COLLECTION_NAME,
  USERS_FAVORITES_PRODUCTS_COLLECTION_NAME,
  UserFavoriteProduct,
} from '@cainz-next-gen/types';
import firestore from '@google-cloud/firestore';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { CommonFavoriteProductsService } from '../common.favorite-products.service';

@Injectable()
export class RegisterFavoriteProductsService {
  constructor(
    private readonly commonService: CommonService,
    private readonly commonFavoriteProductsService: CommonFavoriteProductsService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
  ) {}

  public async getTargetFavoriteDoc(
    mylistId: string | null,
    encryptedMemberId: string,
  ): Promise<firestore.DocumentSnapshot> {
    this.logger.debug('start getTargetFavoriteDoc');

    let targetFavoriteDoc: firestore.DocumentSnapshot<firestore.DocumentData>;
    if (mylistId) {
      targetFavoriteDoc = await this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(USERS_FAVORITES_COLLECTION_NAME)
        .doc(mylistId)
        .get();
    } else {
      targetFavoriteDoc =
        await this.commonFavoriteProductsService.getFavoritesDocSnapByUser(
          encryptedMemberId,
        );
      // defaultFavoriteが存在しない場合は臨時用のdefaultFavoriteを作成する(TODO：臨時処理なので後で変えるかもしれません)
      if (!targetFavoriteDoc || !targetFavoriteDoc.exists) {
        targetFavoriteDoc = await this.createDummyDefaultFavoriteDoc(
          encryptedMemberId,
        );
      }
    }
    this.logger.debug('end getTargetFavoriteDoc');
    return targetFavoriteDoc;
  }

  public async saveToFirestore(
    targetFavoriteDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
    favoriteProductId: string,
    operatorName: string,
  ) {
    this.logger.debug('start save to firestore');

    try {
      const favoriteProductDocRef = targetFavoriteDoc.ref
        .collection(USERS_FAVORITES_PRODUCTS_COLLECTION_NAME)
        .doc(favoriteProductId);

      const favoriteProductDoc = await favoriteProductDocRef.get();

      if (favoriteProductDoc.exists) {
        this.logger.warn(
          `${favoriteProductDoc.id}favorite product is already exists!`,
        );
      } else {
        const saveData: UserFavoriteProduct = {
          productId: favoriteProductId,
          id: null,
          userCreatedAt: firestore.Timestamp.now(),
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
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

        await this.firestoreBatchService.batchCommit();
      }
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_REGISTER_STORE_TO_DB,
          message:
            ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_REGISTER_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.debug('end save to firestore');
    }
  }

  public async createFavoriteProductTaskToRegister(
    encryptedMemberId: string,
    targetFavoriteDocId: string,
    mylistId: string | null,
    productId: string,
    correlationId: string,
  ) {
    this.logger.debug('start createFavoriteProductTaskToRegister');
    const QUEUE = 'register-favorite-products';
    const url =
      this.env.get<string>('CONSUMER_BASE_URL') +
      this.env.get<string>('CONSUMER_FAVORITE_PRODUCTS_ENDPOINT');

    let payload;
    if (mylistId) {
      payload = {
        encryptedMemberId,
        productId,
        mylistId,
        targetFavoriteDocId,
      };
    } else {
      payload = {
        encryptedMemberId,
        productId,
        targetFavoriteDocId,
      };
    }

    try {
      await this.commonService.createTask(
        QUEUE,
        url,
        undefined,
        this.env.get<string>('CAINZAPP_API_KEY'),
        correlationId,
        protos.google.cloud.tasks.v2.HttpMethod.POST,
        payload,
      );
    } catch (e) {
      this.commonService.logException(`create task is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_REGISTER_CREATE_TASK,
          message:
            ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_REGISTER_CREATE_TASK],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.debug('end createFavoriteProductTaskToRegister');
  }

  private async createDummyDefaultFavoriteDoc(
    encryptedMemberId: string,
  ): Promise<firestore.DocumentSnapshot<firestore.DocumentData>> {
    this.logger.debug('start createDummyDefaultFavoriteDoc');
    const DUMMY_DEFAULT_FAVORITE_DOC_NAME = 'dummy_default';
    const dummyDefaultFavoriteDocRef = this.firestoreBatchService
      .findCollection(USERS_COLLECTION_NAME)
      .doc(encryptedMemberId)
      .collection(USERS_FAVORITES_COLLECTION_NAME)
      .doc(DUMMY_DEFAULT_FAVORITE_DOC_NAME);

    const dummyDefaultFavoriteDocData: OmitTimestampUserFavorite = {
      comment: 'dummy default favorite',
      name: DUMMY_DEFAULT_FAVORITE_DOC_NAME,
      title: DUMMY_DEFAULT_FAVORITE_DOC_NAME,
      isPublish: false,
      ownerId: null,
      isDefault: true,
      userCreatedAt: firestore.Timestamp.now(),
    };
    await dummyDefaultFavoriteDocRef.set(dummyDefaultFavoriteDocData, {
      merge: true,
    });
    this.logger.debug('end createDummyDefaultFavoriteDoc');
    return dummyDefaultFavoriteDocRef.get();
  }
}
