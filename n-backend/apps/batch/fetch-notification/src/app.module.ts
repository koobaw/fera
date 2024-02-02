import { Module } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { FlyerImportModule } from './core/flyer-import/flyer-import.module';

@Module({
  imports: [GlobalsModule, FlyerImportModule],
})
export class AppModule {}
