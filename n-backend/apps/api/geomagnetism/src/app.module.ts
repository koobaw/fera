import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { GeomagnetismModule } from './core/geomagnetism/geomagnetism.module';

@Module({
  imports: [GlobalsModule, GeomagnetismModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
