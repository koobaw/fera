import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional } from 'class-validator';

export enum MembershipRank {
  A_rank = '0',
  B_rank = '1',
  C_rank = '2',
  D_rank = '3',
  E_rank = '4',
}

export class GetBonusPointsDto {
  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  productIds: string[];

  @ArrayNotEmpty()
  @IsArray()
  @Transform(({ value }) => value.split(','))
  storeCodes: string[];

  @IsOptional()
  @IsEnum(MembershipRank)
  membershipRank: string = MembershipRank.E_rank;
}
