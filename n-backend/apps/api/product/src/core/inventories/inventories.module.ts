import { Module } from '@nestjs/common';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { InventoriesMuleApiService } from './inventories-mule-api/inventories-mule-api.service';

@Module({
  controllers: [InventoriesController],
  providers: [InventoriesService, InventoriesMuleApiService],
  exports: [InventoriesService, InventoriesMuleApiService],
})
export class InventoriesModule {}
