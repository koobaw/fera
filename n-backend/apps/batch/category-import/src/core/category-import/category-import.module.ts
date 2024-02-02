import { Module } from '@nestjs/common';

import { CategoryImportService } from './category-import.service';
import { CategoriesMuleApiService } from './category-mule-api/categories-mule-api.service';

@Module({
  providers: [CategoryImportService, CategoriesMuleApiService],
})
export class CategoryImportModule {}
