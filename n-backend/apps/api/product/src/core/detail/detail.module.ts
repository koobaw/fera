import { Module } from '@nestjs/common';

import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';
import { DetailMuleApiService } from './detail-mule-api/detail-mule-api.service';

@Module({
  controllers: [DetailController],
  providers: [DetailService, DetailMuleApiService],
  exports: [DetailService, DetailMuleApiService],
})
export class DetailModule {}
