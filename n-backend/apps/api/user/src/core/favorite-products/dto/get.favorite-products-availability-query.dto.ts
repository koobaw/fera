import { IsNotEmpty, IsString } from 'class-validator';

export class GetFavoriteProductsAvailabilityQueryDto {
  @IsNotEmpty()
  @IsString()
  productIds: string;
}
