import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class SettlementDto {
  @IsString()
  @IsNotEmpty()
  @Length(21, 21)
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 4)
  storeCode: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(9999999999)
  totalAmount: number;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsNotEmpty()
  @IsString()
  cardSequentialNumber: string;

  @IsNotEmpty()
  @IsNumber()
  totalPointUse: number;

  @IsNotEmpty()
  @IsString()
  appVer: string;
}
