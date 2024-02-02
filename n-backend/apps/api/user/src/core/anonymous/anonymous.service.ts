import { FieldValue } from 'firebase-admin/firestore';
import { protos } from '@google-cloud/tasks';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  AnonymousUser,
  UserType,
  ANONYMOUSUSERS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { QUEUES } from './interface/anonymos-task-queue.interface';

@Injectable()
export class AnonymousService {
  private readonly DEFAULT_USER_TYPE: UserType = 'anonymous';

  private readonly DEFAULT_MYSTORE_CODE = '813';

  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreUtilsService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  async isUserExist(anonymousUserId: string): Promise<boolean> {
    this.logger.debug(`start isUserExist`);
    this.logger.debug(`anonymousUserId: ${anonymousUserId}`);
    const userDocRef = await this.firestoreUtilsService
      .findCollection(ANONYMOUSUSERS_COLLECTION_NAME)
      .doc(anonymousUserId);
    const data = (await userDocRef.get()).data();
    if (!data) {
      this.logger.debug(`user data (id:${anonymousUserId}) is not exist`);
      return false;
    }
    this.logger.debug(`user data is exist: ${JSON.stringify(data)}`);
    this.logger.debug(`end isUserExist`);
    return true;
  }

  public createDefaultUserData(
    anonymousUserId: string,
    operatorName: string,
  ): AnonymousUser {
    const userData: AnonymousUser = {
      id: anonymousUserId,
      userType: this.DEFAULT_USER_TYPE,
      storeCodeInUse: this.DEFAULT_MYSTORE_CODE,
      legacyMemberId: null,
      lastApplicationStartDate: null,
      lastCheckCampaignTime: null,
      lastCheckAnnouncementTime: null,
      lastCheckTonakaiTime: null,
      lastCheckTvTime: null,
      reviewDisable: false,
      reviewSkipAt: null,
      cartInUse: null,
      createdBy: operatorName,
      createdAt: FieldValue.serverTimestamp(),
      updatedBy: operatorName,
      updatedAt: FieldValue.serverTimestamp(),
    };
    return userData;
  }

  async saveToFirestore(docId: string, userData: AnonymousUser) {
    this.logger.info('start saveToFirestore(create user)');
    const collectionName = ANONYMOUSUSERS_COLLECTION_NAME;

    try {
      const collection =
        this.firestoreUtilsService.findCollection(collectionName);
      const docRef = collection.doc(docId);

      this.logger.debug(`${JSON.stringify(userData)}`);
      await this.firestoreUtilsService.batchSet(docRef, userData, {
        merge: true,
      });
      await this.firestoreUtilsService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${collectionName} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_CREATE_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.ANONYMOUS_CREATE_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end saveToFirestore(create user)');
  }

  async pushToTaskQueue(
    userId: string,
    bearerHeader: string,
    correlationId: string,
  ) {
    const url =
      this.env.get<string>('CONSUMER_BASE_URL') +
      this.env.get<string>('CONSUMER_ANONYMOUS_MIGRATE_ENDPOINT');

    await this.commonService.createTask(
      QUEUES.ANONYMOUS_MIGRATE,
      url,
      bearerHeader,
      undefined,
      correlationId,
      protos.google.cloud.tasks.v2.HttpMethod.POST,
      undefined,
    );
  }
}
