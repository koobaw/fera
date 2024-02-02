import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '@cainz-next-gen/types';

export class AnonymousDto {
  @IsNotEmpty()
  @IsString()
  anonymousUserId: string;

  @IsNotEmpty()
  @IsString()
  userType: UserType;

  @IsNotEmpty()
  @IsString()
  myStoreCode: string;

  legacyMemberId: string | null;

  @IsNotEmpty()
  @IsArray()
  favoriteProducts: string[];

  @IsNotEmpty()
  @IsArray()
  pickupOrders: string[];
}
