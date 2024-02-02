import { Request } from 'express';

import { CommonService } from '@cainz-next-gen/common';
import { Claims, OmitTimestampPoint } from '@cainz-next-gen/types';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@cainz-next-gen/guard';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { PointResponse } from './interface/point.interface';
import { PointService } from './point.service';

@Controller('member/point')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async getPoint(
    @Req()
    req: Request & { claims?: Claims },
  ) {
    const userClaims: Claims = req.claims;

    if (typeof userClaims.encryptedMemberId === 'undefined') {
      throw new HttpException(
        {
          errorCode: ErrorCode.MEMBER_POINT_GET_CLAIM_MEMBER_NOT_FOUND,
          message:
            ErrorMessage[ErrorCode.MEMBER_POINT_GET_CLAIM_MEMBER_NOT_FOUND],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { encryptedMemberId } = userClaims;

    const fetchedPoint = await this.pointService.getPoint(encryptedMemberId);

    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    await this.pointService.saveToFirestore(
      encryptedMemberId,
      fetchedPoint,
      operatorName,
    );

    return this.transformToResponse(fetchedPoint);
  }

  private transformToResponse(
    pointResponse: OmitTimestampPoint,
  ): PointResponse {
    const lostDate = pointResponse?.lostDate?.toDate()?.toISOString();
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: JSON.parse(
        JSON.stringify({
          ...pointResponse,
          lostDate,
        }),
      ),
    };
  }
}
