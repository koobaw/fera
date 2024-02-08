import { Module } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { ProductExtendDescriptionImportModule } from './core/description-import/description-import.module';

@Module({
  imports: [GlobalsModule, ProductExtendDescriptionImportModule],
})
export class AppModule {}
