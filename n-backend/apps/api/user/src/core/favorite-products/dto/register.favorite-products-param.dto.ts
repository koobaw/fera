import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterFavoriteProductsParamDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  mylistId?: string;
}
