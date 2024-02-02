import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export enum EventType {
  HOME = 'home-page-view',
  SEARCH = 'search',
  CATEGORY = 'category-page-view',
  DETAIL = 'detail-page-view',
}

export enum RecommendType {
  RECENT_VIEW = 'recentViews',
  RECOMMEND = 'customRecommendations',
}

export class FindRecommendQueryDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(EventType)
  eventType: EventType;

  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  @IsIn(Object.values(RecommendType), { each: true })
  recommendType: RecommendType[];

  @ValidateIf((obj) => obj.eventType === EventType.SEARCH)
  @IsNotEmpty()
  @IsString()
  query?: string;

  @ValidateIf((obj) => obj.eventType === EventType.CATEGORY)
  @IsNotEmpty()
  @IsString()
  categoryCode?: string;

  @ValidateIf((obj) => obj.eventType === EventType.DETAIL)
  @IsNotEmpty()
  @IsString()
  productId?: string;
}
