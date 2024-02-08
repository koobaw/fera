import { Request } from 'express';

import { CommonService } from '@cainz-next-gen/common';
import { Claims, OmitTimestampPoint } from '@cainz-next-gen/types';
import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';

import { MemberAuthGuard } from '@cainz-next-gen/guard';
import { PointResponse } from './interface/point.interface';
import { PointService } from './point.service';

@Controller('member/point')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/')
  @UseGuards(MemberAuthGuard)
  async getPoint(
    @Req()
    req: Request & { claims?: Claims },
  ) {
    const userClaims: Claims = req.claims;
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
