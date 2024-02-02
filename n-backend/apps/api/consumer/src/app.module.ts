import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { FavoriteProductsModule } from './core/favorite-products/favorite-products.module';
import { AnonymousModule } from './core/anonymous/anonymous.module';

@Module({
  imports: [GlobalsModule, FavoriteProductsModule, AnonymousModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
