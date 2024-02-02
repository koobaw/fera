import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  IsIn,
  ValidateIf,
  IsNumber,
} from 'class-validator';

export enum ProductSelect {
  PRICE = 'price',
  DETAIL = 'detail',
  INVENTORY = 'inventory',
}

export class FindUnionQueryDto {
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  @IsIn(Object.values(ProductSelect), { each: true })
  select?: string[] = [];

  @ValidateIf(
    (obj) =>
      Array.isArray(obj.select) &&
      (obj.select.includes(ProductSelect.PRICE) ||
        obj.select.includes(ProductSelect.INVENTORY)),
  )
  @IsArray()
  @Transform(({ value }) => value.split(','))
  storeCodes?: string[];

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value) || 1.0)
  coefficient?: number = 1.0;

  @ValidateIf(
    (obj) =>
      Array.isArray(obj.select) && obj.select.includes(ProductSelect.PRICE),
  )
  @IsString()
  membershipRank?: string;
}
