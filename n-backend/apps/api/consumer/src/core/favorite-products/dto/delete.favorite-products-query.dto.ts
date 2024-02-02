import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DeleteFavoriteProductsQueryDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  objectIds: string[];

  @IsNotEmpty()
  @IsString()
  encryptedMemberId: string;
}
