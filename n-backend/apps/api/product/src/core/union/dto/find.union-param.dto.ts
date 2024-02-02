import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class FindUnionParamDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];
}
