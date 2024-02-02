import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { DetailModule } from './core/detail/detail.module';
import { InventoriesModule } from './core/inventories/inventories.module';
import { PricesModule } from './core/prices/prices.module';
import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { UnionModule } from './core/union/union.module';
import { CategoriesModule } from './core/categories/categories.module';
import { SearchModule } from './core/searches/searches.module';
import { RecommendModule } from './core/recommends/recommends.module';

@Module({
  imports: [
    SearchModule,
    RecommendModule,
    CategoriesModule,
    UnionModule,
    InventoriesModule,
    PricesModule,
    GlobalsModule,
    DetailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
