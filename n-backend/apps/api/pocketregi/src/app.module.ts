import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { CheckinModule } from './core/checkin/checkin.module';
import { CartProductsModule } from './core/cartproducts/cartproducts.module';
import { PocketRegiReturnModule } from './core/return/return.module';

@Module({
  imports: [
    GlobalsModule,
    CheckinModule,
    CartProductsModule,
    PocketRegiReturnModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
