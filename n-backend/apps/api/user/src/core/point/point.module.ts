import { FirestoreBatchModule } from '@cainz-next-gen/firestore-batch';
import { Module } from '@nestjs/common';

import { PointMuleApiService } from './point-mule-api/point-mule-api.service';
import { PointController } from './point.controller';
import { PointService } from './point.service';

@Module({
  imports: [FirestoreBatchModule],
  controllers: [PointController],
  providers: [PointService, FirestoreBatchModule, PointMuleApiService],
})
export class PointModule {}
