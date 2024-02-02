import { Module } from '@nestjs/common';

import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { PricesMuleApiService } from './prices-mule-api/prices-mule-api.service';

@Module({
  controllers: [PricesController],
  providers: [PricesService, PricesMuleApiService],
  exports: [PricesService, PricesMuleApiService],
})
export class PricesModule {}
