import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  IsArray,
  IsBoolean,
} from 'class-validator';

export const SearchSortOrder = {
  recommend: {
    sortKey: '',
  },
  lowPrice: {
    sortKey: 'price',
  },
  highPrice: {
    sortKey: 'price desc',
  },
  popularity: {
    sortKey: 'attributes.sales_qty desc',
  },
};

export class FindSearchesDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  size?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  color?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    return false;
  })
  @IsBoolean()
  originalFlag?: boolean = false;

  @IsOptional()
  @IsString()
  categoryCode: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  @IsIn(Object.keys(SearchSortOrder))
  sortOrder?: string = 'recommend';
}
