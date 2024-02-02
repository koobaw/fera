import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import {
  USERS_COLLECTION_NAME,
  USERS_FAVORITES_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import firestore from '@google-cloud/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class CommonFavoriteProductsService {
  constructor(
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  public async getFavoritesDocSnapByUser(
    encryptedMemberId: string,
  ): Promise<firestore.DocumentSnapshot<firestore.DocumentData> | null> {
    let favoritesDocSnapshots: firestore.QuerySnapshot<firestore.DocumentData>;
    try {
      favoritesDocSnapshots = await this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(USERS_FAVORITES_COLLECTION_NAME)
        .where('isDefault', '==', true)
        .select()
        .get();
    } catch (e) {
      this.commonService.logException(
        `get from firestore/${USERS_FAVORITES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITE_PRODUCTS_GET_FROM_FIRESTORE,
          message: ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_GET_FROM_FIRESTORE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (favoritesDocSnapshots.docs.length > 1) {
      throw new HttpException(
        {
          errorCode: ErrorCode.FAVORITES_DEFAULT_EXISTS_MULTIPLE,
          message: ErrorMessage[ErrorCode.FAVORITES_DEFAULT_EXISTS_MULTIPLE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return favoritesDocSnapshots.docs[0];
  }
}
