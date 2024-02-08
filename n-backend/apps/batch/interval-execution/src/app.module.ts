import { Module } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { IntervalExecutionModule } from './core/interval-execution/interval-execution.module';

@Module({
  imports: [GlobalsModule, IntervalExecutionModule],
})
export class AppModule {}
