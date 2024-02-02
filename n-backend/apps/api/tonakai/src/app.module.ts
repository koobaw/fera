import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { ArticleModule } from './core/article/article.module';

@Module({
  imports: [GlobalsModule, ArticleModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
