import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class DeleteFavoriteProductsParamDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];

  @IsOptional()
  @IsString()
  mylistId?: string;
}
