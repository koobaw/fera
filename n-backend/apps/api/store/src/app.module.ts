import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { DetailModule } from './core/detail/detail.module';
import { SearchModule } from './core/search/search.module';

@Module({
  imports: [GlobalsModule, DetailModule, SearchModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
