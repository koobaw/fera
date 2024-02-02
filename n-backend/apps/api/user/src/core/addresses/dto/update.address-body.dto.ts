import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateAddressBodyDto {
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[\u30A0-\u30FF]+$/)
  firstNameKana?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[\u30A0-\u30FF]+$/)
  lastNameKana?: string;

  @IsString()
  @IsOptional()
  @Length(7)
  zipCode?: string;

  @IsString()
  @IsOptional()
  prefecture?: string;

  @IsString()
  @IsOptional()
  address1?: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsOptional()
  address3?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  departmentName?: string;

  @IsString()
  @IsOptional()
  memo?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
