import { Module } from '@nestjs/common';
import { UnionController } from './union.controller';
import { UnionService } from './union.service';
import { DetailModule } from '../detail/detail.module';
import { PricesModule } from '../prices/prices.module';
import { InventoriesModule } from '../inventories/inventories.module';

@Module({
  imports: [DetailModule, PricesModule, InventoriesModule],
  controllers: [UnionController],
  providers: [UnionService],
  exports: [UnionService],
})
export class UnionModule {}
