import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import {
  OmitTimestampPoint,
  Point,
  USERS_COLLECTION_NAME,
  USERS_POINTS_COLLECTION_NAME,
} from '@fera-next-gen/types';
import firestore from '@google-cloud/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CommonService } from '@fera-next-gen/common';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { CryptoUtilsService } from '../../utils/crypto.service';
import { MulePointSuccessResponse } from './interface/mule-api.interface';
import { PointMuleApiService } from './point-mule-api/point-mule-api.service';

@Injectable()
export class PointService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly muleApi: PointMuleApiService,
    private readonly crypto: CryptoUtilsService,
  ) {}

  public async getPoint(
    encryptedMemberId: string,
  ): Promise<OmitTimestampPoint> {
    const memberId = this.crypto.decryptAES256(encryptedMemberId);

    const fetchedPoint = await this.muleApi.fetchPoint(memberId);
    return this.transformToPointFirestore(fetchedPoint);
  }

  public async saveToFirestore(
    encryptedMemberId: string,
    pointResponse: OmitTimestampPoint,
    operatorName: string,
  ): Promise<void> {
    this.logger.info('start saveToFirestore(point stepUp)');

    try {
      const pointDocRef = this.firestoreBatchService
        .findCollection(USERS_COLLECTION_NAME)
        .doc(encryptedMemberId)
        .collection(USERS_POINTS_COLLECTION_NAME)
        .doc(encryptedMemberId);

      const oldPoint = await pointDocRef.get();

      let saveData: Point;

      if (oldPoint.exists) {
        saveData = {
          ...pointResponse,
          createdAt: oldPoint.data()?.createdAt,
          createdBy: oldPoint.data()?.createdBy,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      } else {
        saveData = {
          ...pointResponse,
          createdAt: firestore.FieldValue.serverTimestamp(),
          createdBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
        };
      }

      await this.firestoreBatchService.batchSet(pointDocRef, saveData, {
        merge: true,
      });

      await this.firestoreBatchService.batchCommit();
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${USERS_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.MEMBER_POINT_GET_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.MEMBER_POINT_GET_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.info('end saveToFirestore(point stepUp)');
  }

  private transformToPointFirestore(
    fetchedPoint: MulePointSuccessResponse,
  ): OmitTimestampPoint {
    let lostDate;
    let lostPoints;

    // 失効日が一番早いものを返却する
    if (fetchedPoint.lost.length !== 0) {
      lostDate = firestore.Timestamp.fromDate(
        new Date(fetchedPoint.lost[0].date),
      );
      lostPoints = fetchedPoint.lost[0].points;
    }

    return {
      totalAmountExcludingTax: fetchedPoint?.stepUp?.totalAmount,
      stageName: fetchedPoint?.stepUp?.thisStage?.name,
      stageGrantRate: fetchedPoint?.stepUp?.thisStage?.grantRate,
      nextStageName: fetchedPoint?.stepUp?.nextStage?.name,
      nextStageGrantRate: fetchedPoint?.stepUp?.nextStage?.grantRate,
      targetAmountExcludingTax: fetchedPoint?.stepUp?.targetAmount,
      term: fetchedPoint?.stepUp?.term,
      points: fetchedPoint.points,
      lostDate,
      lostPoints,
    };
  }
}
