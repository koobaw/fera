import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  MigrateTarget,
  UserType,
  MIGRATIONS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { Firestore } from '@google-cloud/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { MigrateData } from './interface/migrate-data.interface';
import { MigrateService } from './migrate/migrate.service';

@Injectable()
export class AnonymousService {
  private readonly DEFAULT_USER_TYPE: UserType = 'anonymous';

  private readonly DEFAULT_MYSTORE_CODE = '813';

  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreUtilsService: FirestoreBatchService,
    private readonly migrateService: MigrateService,
    private readonly commonService: CommonService,
  ) {}

  async getMigrateTarget(anonymousUserId: string): Promise<MigrateTarget> {
    this.logger.info(`start getMigrateTarget`);
    this.logger.debug(`anonymousUserId: ${anonymousUserId}`);
    const userDocRef = await this.firestoreUtilsService
      .findCollection(MIGRATIONS_COLLECTION_NAME)
      .doc(anonymousUserId);
    const data = (await userDocRef.get()).data();
    this.logger.debug(JSON.stringify(data));
    if (!data) {
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_MIGRATE_NO_USER_DATA,
          message: ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_NO_USER_DATA],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.info(`end getMigrateTarget`);
    return {
      legacyUserId: data.legacyUserId,
      migrated: data.migrated,
    };
  }

  async getMigrateData(legacyUserId: string): Promise<MigrateData> {
    this.logger.info(`start getMigrateData`);
    const legacyProjectId = this.env.get<string>('LEGACY_PROJECT_ID');
    const legacyFirestore = new Firestore({
      projectId: legacyProjectId,
    });

    const legacyUserDocRef = legacyFirestore
      .collection(USERS_COLLECTION_NAME)
      .doc(legacyUserId);
    const legacyUserData = (await legacyUserDocRef.get()).data();

    if (!legacyUserData) {
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_MIGRATE_MISSING_LEGACY_USER,
          message:
            ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_MISSING_LEGACY_USER],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const pickupRefs = await legacyFirestore
      .collection(`${USERS_COLLECTION_NAME}/${legacyUserId}/pickup`)
      .listDocuments();

    if (!legacyUserData.userType) {
      // userTypeが設定されていない場合はデフォルト値「0:匿名ユーザー」を設定する
      legacyUserData.userType = '0';
      this.logger.warn(
        `legacyUserId:${legacyUserId}  userTypeが設定されていません。匿名ユーザーとして移行します。`,
      );
    }
    const migrateData: MigrateData = {
      userType: String(legacyUserData.userType),
      myStoreCode: legacyUserData.myShopCode,
      legacyMemberId: legacyUserData.memberNo ?? null,
      favoriteProductCodes: legacyUserData.favoritedProducts.map(
        (item) => item.productCode,
      ),
      pickupOrderIds: pickupRefs.map((item) => item.id),
    };

    this.logger.info(JSON.stringify(migrateData));
    this.logger.info(`end getMigrateData`);
    return migrateData;
  }

  /**
   * 移行データを整形して、対象のfirestoreへ保存する
   */
  async migrate(
    migrateTargetId: string,
    migrateData: MigrateData,
    operatorName: string,
  ): Promise<void> {
    const anonymous = await this.migrateService.transformToAnonymous(
      migrateTargetId,
      migrateData,
    );
    await this.migrateService.saveToFirestore(anonymous, operatorName);
  }
}
