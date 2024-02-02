import { HttpStatus, Injectable } from '@nestjs/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { ConfigService } from '@nestjs/config';
import { USERS_COLLECTION_NAME } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class UnregisterService {
  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreUtilsService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  async deleteFromFirestore(docId: string) {
    this.logger.info('start deleteFromFirestore(delete user)');
    const collectionName = USERS_COLLECTION_NAME;
    const collection =
      this.firestoreUtilsService.findCollection(collectionName);
    const docRef = collection.doc(docId);
    const user = (await docRef.get()).data();

    if (!user) {
      this.logger.error(`user data ${docId} is not exists`);
      this.commonService.createHttpException(
        ErrorCode.UNREGISTER_ALREADY_DELETED,
        ErrorMessage[ErrorCode.UNREGISTER_ALREADY_DELETED],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.firestoreUtilsService.batchDelete(docRef);
      await this.firestoreUtilsService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Delete from firestore/${collectionName} is failed`,
        e,
      );
      this.commonService.createHttpException(
        ErrorCode.UNREGISTER_DELETE_FROM_DB,
        ErrorMessage[ErrorCode.UNREGISTER_DELETE_FROM_DB],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end deleteFromFirestore(create user)');
  }
}
