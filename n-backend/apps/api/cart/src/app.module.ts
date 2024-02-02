import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CartModule } from './core/cart/cart.module';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { OrderServiceTestModule } from './core/order-service-test/order-service-test.module';

@Module({
  imports: [GlobalsModule, CartModule, OrderServiceTestModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
