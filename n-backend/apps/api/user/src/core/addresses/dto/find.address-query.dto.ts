import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FindAddressesQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFavorite?: boolean;
}
