import { Module } from '@nestjs/common';

import { GlobalsModule } from './globals.module';
import { CategoryImportModule } from './core/category-import/category-import.module';

@Module({
  imports: [GlobalsModule, CategoryImportModule],
})
export class AppModule {}
