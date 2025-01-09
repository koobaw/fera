import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CommonService } from '@fera-next-gen/common';
import {
  USERS_COLLECTION_NAME,
  STORES_COLLECTION_NAME,
  STORES_DETAIL_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME,
  POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { FieldValue } from '@google-cloud/firestore';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

import { CheckinResponse } from './interfaces/checkin.interface';

import { PocketRegiCheckinCommonService } from '../../utils/checkin.utils';

@Injectable()
export class CheckinService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly checkInUtils: PocketRegiCheckinCommonService,
  ) {}

  /**
   * Main service method for pocket regi check in / ポケットレジチェックインの主なサービス方法
   * @param qrCodeData string value / 文字列値
   * @param encryptedMemberId string value / 文字列値
   * @param operatorName system name which gets saved in firestore / Firestoreに保存されるシステム名
   * @returns promise of object CheckinResponse / オブジェクト CheckinResponse の約束
   */
  public async pocketRegiCheckIn(
    qrCodeData: string,
    encryptedMemberId: string,
    operatorName: string,
  ): Promise<CheckinResponse> {
    this.logger.info('pocket regi check in starts');

    // validating proper qr code data format
    if (!this.checkInUtils.validateAllowedQrCodeData(qrCodeData)) {
      throw new HttpException(
        {
          errorCode: ErrorCode.INVALID_SHOP_CODE,
          message: ErrorMessage[ErrorCode.INVALID_SHOP_CODE],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // checking user is exists or not in users collection
    const userStatus = await this.checkInUtils.checkUserFromCollection(
      encryptedMemberId,
    );
    if (!userStatus) {
      throw new HttpException(
        {
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: ErrorMessage[ErrorCode.USER_NOT_FOUND],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // getting shop details, whether shopcode is valid or not
    const docs = await this.getShopDetails(qrCodeData);
    if (docs.errorCode && docs.status !== 200) {
      throw new HttpException(
        {
          errorCode: docs.errorCode,
          message: ErrorMessage[docs.errorCode],
        },
        docs.status,
      );
    }

    const resObj: CheckinResponse = {
      code: HttpStatus.CREATED,
      message: 'OK',
    };

    // アプリからのアクセスの場合firestoreに格納する
    const storeCode = docs.shopcode;
    this.saveToFirestore(encryptedMemberId, storeCode, operatorName);

    this.logger.info('pocket regi check in ends');

    return resObj;
  }

  /**
   * Check store is available for pocketregi or not & get shop details by shopcode(like '123') / 店舗がポケットリアルで利用できるかどうかを確認して、店舗コード（「123」など）で店舗の詳細を取得します
   * @param qrCodeData
   * @returns either { data, shopcode, data } for success or { status, errorCode } for error / 成功の場合は { data, shopcode, data }、エラーの場合は { status, errorCode }
   */
  public async getShopDetails(qrCodeData: string) {
    try {
      this.logger.info('getting shop details from firestore in starts');
      const shopcode = this.checkInUtils.getShopcodeFromQrData(qrCodeData);
      const docId = this.commonService.createMd5(shopcode);

      const { doc, docRef } = await this.checkInUtils.getDocumentFromCollection(
        STORES_COLLECTION_NAME,
        docId,
      );
      if (!doc) {
        return {
          errorCode: ErrorCode.INVALID_SHOP_CODE,
          status: HttpStatus.NOT_FOUND,
        };
      }

      const { subDoc } = await this.checkInUtils.getDocumentFromSubCollection(
        docRef,
        STORES_DETAIL_COLLECTION_NAME,
        shopcode,
      );
      if (!subDoc) {
        return {
          errorCode: ErrorCode.INVALID_SHOP_CODE,
          status: HttpStatus.NOT_FOUND,
        };
      }
      if (!subDoc.supportPocketRegi) {
        return {
          errorCode: ErrorCode.UNSUPPORTED_SHOP_CODE,
          status: HttpStatus.BAD_REQUEST,
        };
      }

      this.logger.info('getting shop details from firestore in ends');

      return {
        data: doc,
        shopcode,
        status: HttpStatus.OK,
      };
    } catch (e: unknown) {
      this.commonService.logException(
        `Getting data from to firestore/${STORES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.INTERAL_API_ERROR,
          message: ErrorMessage[ErrorCode.INTERAL_API_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * saving check in time to firestore database & empt cart products poket regi cart products collection / Firestore データベースへのチェックイン時間を節約し、カート製品を空にする ポケット レジ カート製品コレクション
   * @param docId string value / 文字列値
   * @param storeCode storecode string value /ストアコード文字列値
   * @param operatorName system name which gets saved in firestore / Firestoreに保存されるシステム名
   */
  public async saveToFirestore(
    docId: string,
    storeCode: string,
    operatorName: string,
  ) {
    this.logger.info('start saveToFirestore(pocket regi check in)');
    const collectionName = USERS_COLLECTION_NAME;
    const subCollectionName = POCKET_REGI_CART_PRODUCTS_COLLECTION_NAME;
    try {
      const docRef = this.checkInUtils.getFirestoreDocRef(
        collectionName,
        docId,
      );
      const subDocId = POCKET_REGI_CART_PRODUCTS_SUB_COLLECTION_NAME;
      const subDocRef = this.checkInUtils.getFirestoreSubDocRef(
        docRef,
        subCollectionName,
        subDocId,
      );

      const data = {
        products: [],
        totalAmount: 0,
        totalQuantity: 0,
        storeCode,
        cartLockUntil: null,
        productUpdatedAt: null,
        checkInAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        createdBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: operatorName,
      };

      await this.firestoreBatchService.batchSet(subDocRef, data, {
        merge: true,
      });

      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${collectionName} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.INTERAL_API_ERROR,
          message: ErrorMessage[ErrorCode.INTERAL_API_ERROR],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.info('end saveToFirestore(pocket regi check in)');
  }
}
