import { AxiosError } from 'axios';
import { getAuth } from 'firebase-admin/auth';
import { catchError, firstValueFrom } from 'rxjs';

import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CommonService } from '@cainz-next-gen/common';
import {
  AnonymousUser,
  User,
  MyStores,
  ANONYMOUSUSERS_COLLECTION_NAME,
  USERS_COLLECTION_NAME,
  USERS_MYSTORES_COLLECTION_NAME,
  USERS_OPENEDANNOUNCEMENTS_COLLECTION_NAME,
  ANONYMOUSUSERS_OPENEDNOTIFICATIONS_COLLECTION_NAME,
  USERS_OPENEDTONAKAIIDS_COLLECTION_NAME,
  USERS_PICKUPORDERS_COLLECTION_NAME,
  USERS_PRODUCTSEARCHQUERIES_COLLECTION_NAME,
  USERS_PRODUCTVIEWS_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { FieldValue } from 'firebase-admin/firestore';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  MuleMembershipReadResponseFailure,
  MuleMembershipReadResponseSuccess,
  TokenData,
} from './interface/login.interface';

@Injectable()
export class LoginService {
  private readonly DEFAULT_MYSTORE_CODE = '813';

  private readonly DEFAULT_USER_RANK = '4';

  // TODO カートの移行?
  constructor(
    private readonly httpService: HttpService,
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  public async getUserInfo(
    salesforceUserId: string,
  ): Promise<MuleMembershipReadResponseSuccess> {
    // salesforce_userIdをmule APIに渡して、ユーザー情報を取得
    this.logger.info('start getUserInfo');
    const muleCrmApiBaseUrl = this.env.get<string>('MULE_CRM_API_BASE_URL');
    const muleCrmApiUserEndpoint = this.env.get<string>(
      'MULE_CRM_API_USER_ENDPOINT',
    );
    const clientId = this.env.get<string>('MULE_CRM_API_CLIENT_ID');
    const clientSecret = this.env.get<string>('MULE_CRM_API_CLIENT_SECRET');

    const { data } = await firstValueFrom(
      this.httpService
        .get<MuleMembershipReadResponseSuccess>(
          `${muleCrmApiBaseUrl}${muleCrmApiUserEndpoint}/${salesforceUserId}`,
          {
            headers: {
              client_id: clientId,
              client_secret: clientSecret,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError<MuleMembershipReadResponseFailure>) => {
            this.commonService.logException('Mule API occurred Error', error);
            throw new HttpException(
              {
                errorCode: ErrorCode.LOGIN_NG_SALESFORCE_USER_ID,
                message: ErrorMessage[ErrorCode.LOGIN_NG_SALESFORCE_USER_ID],
              },
              HttpStatus.BAD_REQUEST,
            );
          }),
        ),
    );
    this.logger.info('end getUserInfo');
    return data;
  }

  public async saveToFirebaseAuthClaims(
    userId: string,
    encryptedMemberId: string,
    tokenData: TokenData,
  ) {
    // cainzIdやaccess_tokenなどをfirebase authのclaimに保存
    this.logger.info('start saveToFirebaseAuthClaims');
    await getAuth().setCustomUserClaims(userId, {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      encryptedMemberId,
    });
    this.logger.info('end saveToFirebaseAuthClaims');
  }

  /**
   * 匿名ユーザーのfirebase documentを会員用のfirebase documentに移す
   * @param userId
   * @param encryptedMemberId
   * @param operatorName
   */
  public async transferToMember(
    userId: string,
    encryptedMemberId: string,
    operatorName: string,
    userInfo: MuleMembershipReadResponseSuccess,
  ) {
    this.logger.info('start transferToMember');

    const anonymousUsersCollection = this.firestoreBatchService.findCollection(
      ANONYMOUSUSERS_COLLECTION_NAME,
    );
    const usersCollection = this.firestoreBatchService.findCollection(
      USERS_COLLECTION_NAME,
    );
    const anonymousUserDocumentRef = anonymousUsersCollection.doc(userId);
    const userDocumentRef = usersCollection.doc(encryptedMemberId);
    const myStoreDocumentRef = userDocumentRef
      .collection(USERS_MYSTORES_COLLECTION_NAME)
      .doc(encryptedMemberId);

    const userDocumentSnapshot = await userDocumentRef.get();
    if (userDocumentSnapshot.exists) {
      // rankの更新
      await this.updateUserSchema(userDocumentRef, userInfo, operatorName);
      // 初回会員ログイン時のみ、匿名ユーザーのdocumentを会員用のdocumentに移す。２回目移行以降はスキップ
      this.logger.info(
        `${encryptedMemberId}:user document exists, which means already transferred to member once, so skip`,
      );
    } else {
      const anonymousUserDocumentSnapshot =
        await anonymousUserDocumentRef.get();

      if (anonymousUserDocumentSnapshot.exists) {
        await this.initialUserFromAnonymousUser(
          userDocumentRef,
          anonymousUserDocumentSnapshot.data() as AnonymousUser,
          operatorName,
          userInfo,
        );

        await Promise.all(
          [
            USERS_OPENEDANNOUNCEMENTS_COLLECTION_NAME,
            ANONYMOUSUSERS_OPENEDNOTIFICATIONS_COLLECTION_NAME,
            USERS_OPENEDTONAKAIIDS_COLLECTION_NAME,
            USERS_PICKUPORDERS_COLLECTION_NAME,
            USERS_PRODUCTSEARCHQUERIES_COLLECTION_NAME,
            USERS_PRODUCTVIEWS_COLLECTION_NAME,
          ].map(async (subCollectionName) => {
            await this.copyAndDeleteOriginalCollection(
              anonymousUserDocumentRef.collection(subCollectionName),
              userDocumentRef.collection(subCollectionName),
              operatorName,
            );
          }),
        );
      } else {
        // 基本的にここの処理は通らないはず
        this.logger.warn(`${userId}:anonymous user document does not exist!!!`);
        await this.initialUser(
          anonymousUserDocumentRef,
          operatorName,
          userInfo,
        );
      }
      await this.initialMyStore(myStoreDocumentRef, operatorName);
      await this.firestoreBatchService.batchCommit();
    }
    this.logger.info('end transferToMember');
  }

  private async initialUserFromAnonymousUser(
    userDocumentRef: FirebaseFirestore.DocumentReference,
    anonymousUserData: AnonymousUser,
    operatorName: string,
    userInfo?: MuleMembershipReadResponseSuccess,
  ) {
    this.logger.info('start initialUserFromAnonymousUser');
    const userData: User = {
      storeCodeInUse:
        anonymousUserData.storeCodeInUse ?? this.DEFAULT_MYSTORE_CODE,
      lastApplicationStartDate:
        anonymousUserData.lastApplicationStartDate ?? null,
      lastCheckCampaignTime: anonymousUserData.lastCheckCampaignTime ?? null,
      lastCheckAnnouncementTime:
        anonymousUserData.lastCheckAnnouncementTime ?? null,
      lastCheckTonakaiTime: anonymousUserData.lastCheckTonakaiTime ?? null,
      lastCheckTvTime: anonymousUserData.lastCheckTvTime ?? null,
      reviewDisable: anonymousUserData.reviewDisable ?? false,
      reviewSkipAt: anonymousUserData.reviewSkipAt ?? null,
      rank: userInfo.membershipLevel ?? this.DEFAULT_USER_RANK,
      cartInUse: null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: operatorName,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    };
    await this.firestoreBatchService.batchSet(userDocumentRef, userData, {
      merge: true,
    });
    this.logger.info('end initialUserFromAnonymousUser');
  }

  private async initialUser(
    userDocumentRef: FirebaseFirestore.DocumentReference,
    operatorName: string,
    userInfo: MuleMembershipReadResponseSuccess,
  ) {
    this.logger.info('start initialUser');
    const userData: User = {
      storeCodeInUse: this.DEFAULT_MYSTORE_CODE,
      lastApplicationStartDate: null,
      lastCheckCampaignTime: null,
      lastCheckAnnouncementTime: null,
      lastCheckTonakaiTime: null,
      lastCheckTvTime: null,
      reviewDisable: false,
      reviewSkipAt: null,
      rank: userInfo.membershipLevel ?? this.DEFAULT_USER_RANK,
      cartInUse: null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: operatorName,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    };
    await this.firestoreBatchService.batchSet(userDocumentRef, userData, {
      merge: true,
    });
    this.logger.info('end initialUser');
  }

  private async initialMyStore(
    myStoreDocumentRef: FirebaseFirestore.DocumentReference,
    operatorName: string,
  ) {
    const myStore: MyStores = {
      myStores: [],
      createdAt: FieldValue.serverTimestamp(),
      createdBy: operatorName,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    };

    await this.firestoreBatchService.batchSet(myStoreDocumentRef, myStore, {
      merge: true,
    });
  }

  private async copyAndDeleteOriginalCollection(
    sourceCollectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    targetCollectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
    operatorName: string,
  ) {
    this.logger.info(
      `start copyAndDeleteOriginalCollection(${sourceCollectionRef.id})`,
    );
    const sourceQuerySnapshots = await sourceCollectionRef.get();

    await Promise.all(
      sourceQuerySnapshots.docs.map(async (doc) => {
        const data = {
          ...doc.data(),
          createdAt: FieldValue.serverTimestamp(),
          createdBy: operatorName,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
        await this.firestoreBatchService.batchSet(
          targetCollectionRef.doc(doc.id),
          data,
          { merge: true },
        );
        await this.firestoreBatchService.batchDelete(doc.ref);
      }),
    );
    this.logger.info(
      `end copyAndDeleteOriginalCollection(${sourceCollectionRef.id})`,
    );
  }

  private async updateUserSchema(
    userDocRef: FirebaseFirestore.DocumentReference,
    userInfo: MuleMembershipReadResponseSuccess,
    operatorName: string,
  ) {
    const userSchemaData = (await userDocRef.get()).data() as User;
    const updateUserSchema: User = {
      ...userSchemaData,
      rank: userInfo.membershipLevel,
      updatedBy: operatorName,
      updatedAt: FieldValue.serverTimestamp(),
    };
    await this.firestoreBatchService.batchSet(userDocRef, updateUserSchema, {
      merge: true,
    });
    await this.firestoreBatchService.batchCommit();
  }
}
