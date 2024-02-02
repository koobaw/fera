import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class RegisterAddressesBodyDto {
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Matches(/^[\u30A0-\u30FF]+$/) // カナ文字の正規表現
  firstNameKana?: string;

  @IsOptional()
  @Matches(/^[\u30A0-\u30FF]+$/) // カナ文字の正規表現
  lastNameKana?: string;

  @IsOptional()
  @Matches(/^\d{7}$/) // 7文字の正規表現
  zipCode?: string;

  @IsOptional()
  @IsString()
  prefecture?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  address3?: string;

  @IsOptional()
  @IsPhoneNumber('JP')
  phone?: string;

  @IsOptional()
  @IsPhoneNumber('JP')
  phone2?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
