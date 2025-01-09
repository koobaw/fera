import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  USERS_COLLECTION_NAME,
  USERS_FAVORITES_COLLECTION_NAME,
  USERS_FAVORITES_PRODUCTS_COLLECTION_NAME,
} from '@fera-next-gen/types';
import firestore from '@google-cloud/firestore';
import { protos } from '@google-cloud/tasks';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { QUEUES } from '../interfaces/favorite-products-task-queue.interface';

@Injectable()
export class DeleteFavoriteProductsService {
  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
  ) {}

  public async existsMylist(encryptedMemberId: string, mylistId: string) {
    this.logger.info('start exists mylist');
    let snapShot: firestore.DocumentSnapshot<firestore.DocumentData>;
    try {
      const userCollection = this.firestoreBatchService.findCollection(
        USERS_COLLECTION_NAME,
      );
      snapShot = await userCollection
        .doc(encryptedMemberId)
        .collection(USERS_FAVORITES_COLLECTION_NAME)
        .doc(mylistId)
        .get();
    } catch (e) {
      this.commonService.logException(
        `Get from firestore/${USERS_COLLECTION_NAME}/${USERS_FAVORITES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode:
            ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB,
          message:
            ErrorMessage[
              ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB
            ],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end exists mylist');
    return snapShot.exists;
  }

  public async pushToTaskQueue(
    docs: Array<firestore.DocumentSnapshot<firestore.DocumentData>>,
    correlationId: string,
  ) {
    this.logger.info('start push to task queue');
    const queueName = QUEUES.FAVORITE_PRODUCTS_DELETE;
    const baseUrl = this.env.get<string>('CONSUMER_BASE_URL');
    const endPoint = this.env.get<string>(
      'CONSUMER_FAVORITE_PRODUCTS_ENDPOINT',
    );

    const targetDocs = docs.filter((doc) => {
      if (doc.data()?.id) {
        return true;
      }
      this.logger.warn(`${doc.ref.path}:id is null`);
      return false;
    });

    if (targetDocs.length > 0) {
      const objectIds = targetDocs.map((doc) => doc.data()?.id);
      const url = `${baseUrl}${endPoint}?objectIds=${objectIds.join(',')}`;
      try {
        await this.commonService.createTask(
          queueName,
          url,
          undefined,
          this.env.get<string>('feraAPP_API_KEY'),
          correlationId,
          protos.google.cloud.tasks.v2.HttpMethod.DELETE,
          undefined,
        );
      } catch (e) {
        this.commonService.logException(
          `Push to delete task queue is failed`,
          e,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.FAVORITE_PRODUCTS_DELETE_PUSH_TO_TASK_QUEUE,
            message:
              ErrorMessage[
                ErrorCode.FAVORITE_PRODUCTS_DELETE_PUSH_TO_TASK_QUEUE
              ],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      this.logger.warn('objectIds is empty');
    }
    this.logger.info('end push to task queue');
  }

  public async getDeleteTargetDocs(
    encryptedMemberId: string,
    mylistId: string,
    productIds: Array<string>,
  ): Promise<Array<firestore.DocumentSnapshot<firestore.DocumentData>>> {
    this.logger.info('start get delete target from firestore');
    try {
      const userCollection = this.firestoreBatchService.findCollection(
        USERS_COLLECTION_NAME,
      );
      const userDocRef = userCollection.doc(encryptedMemberId);

      const targetDocs = await Promise.all(
        productIds.map(async (productId) => {
          const favoriteDocRef = userDocRef
            .collection(USERS_FAVORITES_COLLECTION_NAME)
            .doc(mylistId)
            .collection(USERS_FAVORITES_PRODUCTS_COLLECTION_NAME)
            .doc(productId);
          return favoriteDocRef.get();
        }),
      );
      return targetDocs;
    } catch (e) {
      this.commonService.logException(
        `Delete from firestore/${USERS_COLLECTION_NAME}/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode:
            ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB,
          message:
            ErrorMessage[
              ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB
            ],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.info('end get delete target from firestore');
    }
  }

  public async deleteFromFirestore(
    docs: Array<firestore.DocumentSnapshot<firestore.DocumentData>>,
  ) {
    this.logger.info('start delete from firestore');
    try {
      await Promise.all(
        docs.map(async (doc) => {
          await this.firestoreBatchService.batchDelete(doc.ref);
        }),
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e) {
      this.commonService.logException(
        `Delete from firestore/${USERS_COLLECTION_NAME}/${USERS_FAVORITES_PRODUCTS_COLLECTION_NAME} is failed`,
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
      this.logger.info('end delete from firestore');
    }
  }
}
