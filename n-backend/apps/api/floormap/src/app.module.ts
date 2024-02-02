import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { FloormapModule } from './core/floormap/floormap.module';

@Module({
  imports: [GlobalsModule, FloormapModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
