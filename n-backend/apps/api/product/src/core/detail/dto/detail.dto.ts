import { ArrayNotEmpty, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class DetailDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];
}
