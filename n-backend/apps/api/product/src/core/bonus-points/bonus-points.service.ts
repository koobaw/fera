import { Injectable } from '@nestjs/common';

import { CommonService } from '@fera-next-gen/common';
import { GetBonusPointsDto } from './dto/get.bonus-point-query.dto';
import { PointAwardCalculationApiService } from './pac-api/point-award-calculation-api.service';
import { BonusPointResponse } from './interfaces/bonus-points.interface';

@Injectable()
export class BonusPointsService {
  constructor(
    private readonly pointAwardCalculationApiService: PointAwardCalculationApiService,
    private readonly commonService: CommonService,
  ) {}

  public async getPoints(
    dto: GetBonusPointsDto,
  ): Promise<BonusPointResponse[]> {
    const data = await this.pointAwardCalculationApiService.getPoint(
      dto.storeCodes,
      dto.productIds,
      dto.membershipRank,
    );
    const bonusPoints: BonusPointResponse[] = [];

    if (data?.MEMBER_INFO?.PROMOTION_INFO) {
      data.MEMBER_INFO.PROMOTION_INFO.forEach((promotion) => {
        promotion.ITERM_INFO?.forEach((item) => {
          bonusPoints.push({
            productId: item.JAN_CODE,
            storeCode: item.STORE_CODE.toString(),
            point: Number(item.POINT_PLUS),
            description: promotion.PROMOTION_DESC,
            endDate: this.commonService.convertDateStringToJstTimestampString(
              promotion.PROMOTION_EDT.substring(0, 8),
            ),
          });
        });
      });
    }

    return bonusPoints;
  }
}
