import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FindPricesDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];

  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  storeCodes: string[];

  @IsNotEmpty()
  @IsString()
  membershipRank: string;
}
