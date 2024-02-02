import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FloorMapDto {
  @IsNotEmpty()
  @IsString()
  storeCode: string;

  @IsOptional()
  @IsString()
  productIds: string;
}
