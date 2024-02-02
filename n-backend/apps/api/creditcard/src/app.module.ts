import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { MembersModule } from './core/members/members.module';
import { CardsModule } from './core/cards/cards.module';
import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { SettlementModule } from './core/settlement/settlement.module';

@Module({
  imports: [GlobalsModule, MembersModule, CardsModule, SettlementModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
