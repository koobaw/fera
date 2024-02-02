import { Module } from '@nestjs/common';
import { SearchController } from './searches.controller';
import { SearchesService } from './searches.service';
import { SearchGoogleApiService } from './search-google-api/search-google-api.service';
import { UnionModule } from '../union/union.module';

@Module({
  imports: [UnionModule],
  controllers: [SearchController],
  providers: [SearchesService, SearchGoogleApiService],
})
export class SearchModule {}
