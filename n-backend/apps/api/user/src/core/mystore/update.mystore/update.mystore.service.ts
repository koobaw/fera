import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  Mystore,
  MyStores,
  USERS_COLLECTION_NAME,
  USERS_MYSTORES_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import firestore from '@google-cloud/firestore';

import { CommonService } from '@cainz-next-gen/common';

import { MystoreMuleApiService } from '../mystore-mule-api/mystore-mule-api.service';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { MuleMystore } from '../interface/mule-api-mystore.interface';

@Injectable()
export class UpdateMystoreService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly mystoreMuleApiService: MystoreMuleApiService,
  ) {}

  async saveToFirestoreMystore(
    encryptedMemberId: string,
    mystoreRecord: Array<Mystore>,
    operatorName: string,
  ) {
    this.logger.info('start save to Mystore');
    try {
      const mystoreDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(USERS_MYSTORES_COLLECTION_NAME)
        .doc(encryptedMemberId);
      const oldMystore = await mystoreDocRef.get();
      let saveMystoreData: MyStores;
      if (oldMystore.exists) {
        saveMystoreData = {
          myStores: mystoreRecord,
          createdBy: oldMystore.data()?.createdBy,
          createdAt: oldMystore.data()?.createdAt,
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      } else {
        saveMystoreData = {
          myStores: mystoreRecord,
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }
      await this.firestoreBatchService.batchSet(
        mystoreDocRef,
        saveMystoreData,
        {
          merge: true,
        },
      );

      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${USERS_COLLECTION_NAME}/${USERS_MYSTORES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_GET_FROM_DB,
          message: ErrorMessage[ErrorCode.MYSTORE_GET_FROM_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end save to Mystore');
  }

  async getMystoreFromMule(encryptedMemberId: string): Promise<Mystore[]> {
    this.logger.debug('start get mystore from mule');

    const muleMystoreRecord =
      await this.mystoreMuleApiService.getMystoreFromMule(encryptedMemberId);
    const res = this.generateMystoreFromMule(muleMystoreRecord);

    this.logger.debug('end get mystore from mule');
    return res;
  }

  async userExists(encryptedMemberId: string) {
    try {
      const snapShot = await this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .get();
      return snapShot.exists;
    } catch (e: unknown) {
      this.commonService.logException(`failed to check exists user`, e);

      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_GET_FROM_DB,
          message: ErrorMessage[ErrorCode.MYSTORE_GET_FROM_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async generateMystoreFromMule(muleMystoreRecord): Promise<Mystore[]> {
    const mystoreRecords: Mystore[] = [];
    const records = muleMystoreRecord as MuleMystore[];
    records.forEach((record) => {
      if (record.isDeleted === false) {
        // 削除フラグが立っていないもののみ登録
        const mystore: Mystore = {
          code: record.storeCode,
          isFavoriteStore: record.favoriteStoreFlag,
          originalCreatedAt: this.commonService.convertToTimestampWithNull(
            record.createdDate,
          ),
        };
        mystoreRecords.push(mystore);
      }
    });
    return mystoreRecords;
  }
}
