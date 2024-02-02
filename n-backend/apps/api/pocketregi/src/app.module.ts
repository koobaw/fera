import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { CheckinModule } from './core/checkin/checkin.module';
import { CartProductsModule } from './core/cartproducts/cartproducts.module';

@Module({
  imports: [GlobalsModule, CheckinModule, CartProductsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
