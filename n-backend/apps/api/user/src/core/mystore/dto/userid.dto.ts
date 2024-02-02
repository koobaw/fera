import { IsNotEmpty, IsString } from 'class-validator';

export class UserIdDto {
  @IsNotEmpty()
  @IsString()
  sfdcUserId: string;

  @IsNotEmpty()
  @IsString()
  encryptedMemberId: string;
}
