import { Module } from '@nestjs/common';
import { BonusPointsController } from './bonus-points.controller';
import { BonusPointsService } from './bonus-points.service';
import { PointAwardCalculationApiService } from './pac-api/point-award-calculation-api.service';

@Module({
  controllers: [BonusPointsController],
  providers: [BonusPointsService, PointAwardCalculationApiService],
})
export class BonusPointsModule {}
