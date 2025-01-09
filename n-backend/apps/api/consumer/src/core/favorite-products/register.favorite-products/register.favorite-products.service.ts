import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  PartialUserFavoriteProduct,
  USERS_COLLECTION_NAME,
  USERS_FAVORITES_COLLECTION_NAME,
  USERS_FAVORITES_PRODUCTS_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { firestore } from 'firebase-admin';
import { FavoriteProductsMuleApiService } from '../favorite-products-mule-api/favorite-products-mule-api.service';

@Injectable()
export class RegisterFavoriteProductsService {
  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly muleApiService: FavoriteProductsMuleApiService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
  ) {}

  public async registerFavoriteProduct(
    encryptedMemberId: string,
    productId: string,
    mylistId?: string,
  ): Promise<string> {
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');

    const decryptedMemberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    const result = await this.muleApiService.registerFavoriteProducts(
      decryptedMemberId,
      productId,
      mylistId,
    );
    return result.item.id;
  }

  public async updateFirestore(
    id: string,
    targetFavoriteProductDocRef: firestore.DocumentReference<firestore.DocumentData>,
  ): Promise<void> {
    this.logger.debug('start updateFirestore');
    const dataToUpdate: PartialUserFavoriteProduct = {
      id,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await this.firestoreBatchService.batchSet(
      targetFavoriteProductDocRef,
      dataToUpdate,
      { merge: true },
    );
    await this.firestoreBatchService.batchCommit();

    this.logger.debug('end updateFirestore');
  }

  public async getTargetFavoriteProductDoc(
    encryptedMemberId: string,
    productId: string,
    targetFavoriteDocId: string,
  ): Promise<firestore.DocumentSnapshot> {
    const targetFavoriteProductDocRef = this.firestoreBatchService
      .findCollection(USERS_COLLECTION_NAME)
      .doc(encryptedMemberId)
      .collection(USERS_FAVORITES_COLLECTION_NAME)
      .doc(targetFavoriteDocId)
      .collection(USERS_FAVORITES_PRODUCTS_COLLECTION_NAME)
      .doc(productId);

    return targetFavoriteProductDocRef.get();
  }
}
