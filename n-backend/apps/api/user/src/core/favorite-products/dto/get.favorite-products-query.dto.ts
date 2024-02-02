import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class GetFavoriteProductsQueryDto {
  @IsInt()
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string = 'asc';

  @IsBoolean()
  @Type(() => Boolean)
  save?: boolean = true;
}
