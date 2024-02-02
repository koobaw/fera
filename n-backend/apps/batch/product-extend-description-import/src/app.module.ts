import { Module } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { ProductExtendDescriptionImportModule } from './core/product-extend-description-import/product-extend-description-import.module';

@Module({
  imports: [GlobalsModule, ProductExtendDescriptionImportModule],
})
export class AppModule {}
