import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class FindInventoriesDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];

  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  storeCodes: string[];
}
