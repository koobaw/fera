import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { USERS_COLLECTION_NAME, User } from '@fera-next-gen/types';
import { FieldValue } from '@google-cloud/firestore';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  MuleMembershipRecord,
  PrivateProfile,
} from './interface/private-profile.interface';

@Injectable()
export class PrivateProfileService {
  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  public convertProfileFromUMembershipRecord(
    membershipRecord: MuleMembershipRecord,
    targets?: string[],
  ): PrivateProfile {
    const privateProfile: PrivateProfile = {
      lastNameKana: membershipRecord.lastKana,
      firstNameKana: membershipRecord.firstKana,
      lastName: membershipRecord.lastName,
      firstName: membershipRecord.firstName,
      phoneNumber: membershipRecord.phoneHome,
      postalCode: membershipRecord.postalCode,
      prefecture: membershipRecord.prefecture,
      address1: membershipRecord.address1,
      address2: membershipRecord.address2,
      address3: membershipRecord.address3,
      memberId: membershipRecord.cardNoContact,
      createdDate: membershipRecord.createdDate,
    };
    // select response parameter based on query
    if (targets?.length) {
      Object.keys(privateProfile)
        .filter((key) => !targets.includes(key))
        .forEach((target) => {
          delete privateProfile[target];
        });
    }
    return privateProfile;
  }

  public async updateUserSchema(
    rank: string,
    encryptedMemberId: string,
    operatorName: string,
  ) {
    try {
      this.logger.info('start updateUserSchema');
      const userDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId);
      const userSchemaData: User = (await userDocRef.get()).data() as User;
      const userUpdateSchema: User = {
        ...userSchemaData,
        rank,
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };
      await this.firestoreBatchService.batchSet(userDocRef, userUpdateSchema, {
        merge: true,
      });
      await this.firestoreBatchService.batchCommit();
    } catch (e) {
      throw new HttpException(
        {
          errorCode: ErrorCode.FAILED_FIRESTORE_OPERATION,
          message: ErrorMessage[ErrorCode.FAILED_FIRESTORE_OPERATION],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      this.logger.info('end updateUserSchema');
    }
  }

  public async getMuleMembershipRecord(
    salesforceUserId: string,
  ): Promise<MuleMembershipRecord> {
    this.logger.info('start getMuleMembershipRecord');

    const muleCrmApiBaseUrl = this.env.get<string>('MULE_CRM_API_BASE_URL');
    const muleCrmApiUserEndpoint = this.env.get<string>(
      'MULE_CRM_API_USER_ENDPOINT',
    );
    const clientId = this.env.get<string>('MULE_CRM_API_CLIENT_ID');
    const clientSecret = this.env.get<string>('MULE_CRM_API_CLIENT_SECRET');

    const { data } = await firstValueFrom(
      this.httpService
        .get(
          `${muleCrmApiBaseUrl}${muleCrmApiUserEndpoint}/${salesforceUserId}`,
          {
            headers: {
              client_id: clientId,
              client_secret: clientSecret,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
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
    const muleMembershipRecord: MuleMembershipRecord =
      data as MuleMembershipRecord;

    this.logger.debug(
      `getMuleMembershipRecord response: ${JSON.stringify(data)}`,
    );

    this.logger.info('end getMuleMembershipRecord');
    return muleMembershipRecord;
  }
}
