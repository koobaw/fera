import { validate } from 'class-validator';
import { FieldValue } from 'firebase-admin/firestore';

import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { DocumentReference } from '@google-cloud/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import {
  AnonymousUserFavoriteProduct,
  AnonymousUserPickupOrder,
  MigrateAnonymousUser,
  UpdateMigrated,
  ANONYMOUSUSERS_COLLECTION_NAME,
  MIGRATIONS_COLLECTION_NAME,
  ANONYMOUSUSERS_PICKUPORDERS_COLLECTION_NAME,
  ANONYMOUSUSERS_FAVORITEPRODUCTS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { AnonymousDto } from '../dto/anonymous.dto';
import { MigrateData } from '../interface/migrate-data.interface';

@Injectable()
export class MigrateService {
  private readonly NumberMappingUserType = {
    anonymous: '0',
    pasha: '1',
    member: '2',
  };

  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  async transformToAnonymous(
    migrateTargetId: string,
    migrateData: MigrateData,
  ) {
    const anonymous = new AnonymousDto();
    anonymous.anonymousUserId = migrateTargetId;
    switch (migrateData.userType) {
      case this.NumberMappingUserType.anonymous:
        anonymous.userType = 'anonymous';
        break;
      case this.NumberMappingUserType.pasha:
        anonymous.userType = 'pasha';
        break;
      case this.NumberMappingUserType.member:
        anonymous.userType = 'member';
        break;
      default:
        this.logger.error(
          `migrateTargetId:${migrateTargetId} 指定されているUserType: ${migrateData.userType} が存在しません`,
        );
        throw new HttpException(
          {
            errorCode: ErrorCode.ANONYMOUS_MIGRATE_INVALID_USER_TYPE,
            message:
              ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_INVALID_USER_TYPE],
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    anonymous.myStoreCode = migrateData.myStoreCode;
    anonymous.legacyMemberId = migrateData.legacyMemberId;
    anonymous.favoriteProducts = migrateData.favoriteProductCodes;
    anonymous.pickupOrders = migrateData.pickupOrderIds;

    const errors = await validate(anonymous);

    if (errors.length > 0) {
      this.logger.error(`anonymousの必須項目が存在していません`);
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_MIGRATE_MISSING_NEED_PARAM,
          message: ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_MISSING_NEED_PARAM],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      this.logger.debug('validated anonymous');
    }

    return anonymous;
  }

  async saveToFirestore(anonymous: AnonymousDto, operatorName: string) {
    this.logger.info('start SaveToFirestore');

    const anonymousCollection = this.firestoreBatchService.findCollection(
      ANONYMOUSUSERS_COLLECTION_NAME,
    );
    const anonymousDocRef = anonymousCollection.doc(anonymous.anonymousUserId);

    const migrateCollection = this.firestoreBatchService.findCollection(
      MIGRATIONS_COLLECTION_NAME,
    );
    const migrateDocRef = migrateCollection.doc(anonymous.anonymousUserId);

    try {
      await Promise.all([
        this.batchSetAnonymous(anonymousDocRef, anonymous, operatorName),
        this.batchSetAnonymousFavorites(
          anonymousDocRef,
          anonymous.favoriteProducts,
          operatorName,
        ),
        this.batchSetAnonymousPickupOrders(
          anonymousDocRef,
          anonymous.pickupOrders,
          operatorName,
        ),
      ]);
      await this.firestoreBatchService.batchCommit();
      const updateMigratedStatus: UpdateMigrated = {
        migrated: true,
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };
      await this.firestoreBatchService.batchSet(
        migrateDocRef,
        updateMigratedStatus,
        {
          merge: true,
        },
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${ANONYMOUSUSERS_COLLECTION_NAME},
      firestore/${ANONYMOUSUSERS_FAVORITEPRODUCTS_COLLECTION_NAME},
      firestore/${ANONYMOUSUSERS_PICKUPORDERS_COLLECTION_NAME},
      are failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('end SaveToFirestore');
  }

  private async batchSetAnonymous(
    anonymousDocRef: DocumentReference,
    anonymous: AnonymousDto,
    operatorName: string,
  ) {
    this.logger.info('start batchSetAnonymous');
    try {
      const anonymousData: MigrateAnonymousUser = {
        userType: anonymous.userType,
        legacyMemberId: anonymous.legacyMemberId,
        storeCodeInUse: anonymous.myStoreCode,
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await this.firestoreBatchService.batchSet(
        anonymousDocRef,
        anonymousData,
        {
          merge: true,
        },
      );
    } catch (e: unknown) {
      this.logger.error(
        `Set firestore/${ANONYMOUSUSERS_COLLECTION_NAME} is failed`,
      );
      throw e;
    }
    this.logger.info('end batchSetAnonymous');
  }

  private async batchSetAnonymousFavorites(
    anonymousDocRef: DocumentReference,
    favoriteProducts: string[],
    operatorName: string,
  ) {
    this.logger.info('start batchSetAnonymousFavorites');
    try {
      const anonymousCollection = anonymousDocRef.collection(
        ANONYMOUSUSERS_FAVORITEPRODUCTS_COLLECTION_NAME,
      );
      await Promise.all(
        favoriteProducts.map((productCodes) => {
          const docRef = anonymousCollection.doc();
          const favoritedProductsData: AnonymousUserFavoriteProduct = {
            productId: productCodes,
            createdBy: operatorName,
            createdAt: FieldValue.serverTimestamp(),
            updatedBy: operatorName,
            updatedAt: FieldValue.serverTimestamp(),
          };
          return this.firestoreBatchService.batchSet(
            docRef,
            favoritedProductsData,
            {
              merge: true,
            },
          );
        }),
      );
    } catch (e: unknown) {
      this.logger.error(
        `Set firestore/${ANONYMOUSUSERS_FAVORITEPRODUCTS_COLLECTION_NAME} is failed`,
      );
      throw e;
    }
    this.logger.info('end batchSetAnonymousFavorites');
  }

  private async batchSetAnonymousPickupOrders(
    anonymousDocRef: DocumentReference,
    pickupOrders: string[],
    operatorName: string,
  ) {
    this.logger.info('start batchSetAnonymousPickupOrders');
    try {
      const anonymousCollection = anonymousDocRef.collection(
        ANONYMOUSUSERS_PICKUPORDERS_COLLECTION_NAME,
      );

      await Promise.all(
        pickupOrders.map((pickupOrder) => {
          const docRef = anonymousCollection.doc(pickupOrder);
          const pickupOrderData: AnonymousUserPickupOrder = {
            orderId: pickupOrder,
            createdBy: operatorName,
            createdAt: FieldValue.serverTimestamp(),
            updatedBy: operatorName,
            updatedAt: FieldValue.serverTimestamp(),
          };
          return this.firestoreBatchService.batchSet(docRef, pickupOrderData, {
            merge: true,
          });
        }),
      );
    } catch (e: unknown) {
      this.logger.error(
        `Set firestore/${ANONYMOUSUSERS_PICKUPORDERS_COLLECTION_NAME} is failed`,
      );
      throw e;
    }
    this.logger.info('end batchSetAnonymousPickupOrders');
  }
}
