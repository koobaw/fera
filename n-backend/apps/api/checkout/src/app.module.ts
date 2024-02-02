import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CheckoutModule } from './core/checkout/checkout.module';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [GlobalsModule, CheckoutModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*', '');
  }
}
