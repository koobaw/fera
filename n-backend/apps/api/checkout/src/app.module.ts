import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CheckoutCommonModule } from './core/checkout-common/checkout-common.module';
import { CheckoutModule } from './core/checkout/checkout.module';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [GlobalsModule, CheckoutModule, CheckoutCommonModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*', '');
  }
}
