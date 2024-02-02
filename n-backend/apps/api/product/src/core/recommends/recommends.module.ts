import { Module } from '@nestjs/common';
import { RecommendsController } from './recommends.controller';
import { RecommendsService } from './recommends.service';
import { UnionModule } from '../union/union.module';
import { RecommendGoogleApiService } from './recommend-google-api/recommend-google-api.service';

@Module({
  imports: [UnionModule],
  controllers: [RecommendsController],
  providers: [RecommendsService, RecommendGoogleApiService],
})
export class RecommendModule {}
