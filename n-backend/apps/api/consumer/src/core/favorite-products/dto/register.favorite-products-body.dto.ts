import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterFavoriteProductsBodyDto {
  @IsNotEmpty()
  @IsString()
  encryptedMemberId: string;

  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  mylistId?: string;

  @IsNotEmpty()
  @IsString()
  targetFavoriteDocId: string;
}
