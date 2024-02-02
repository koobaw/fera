import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateAddressParamDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  addressId: string;
}
