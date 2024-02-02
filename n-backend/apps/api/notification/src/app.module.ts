import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SendModule } from './core/send/send.module';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [GlobalsModule, SendModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*', '');
  }
}
