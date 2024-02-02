import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CheckoutComplete2Dto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  userId: string;

  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  shopId: string;

  @IsNotEmpty()
  receptionId: string;

  @IsIn(['AUTH', 'CAPTURE'])
  @IsNotEmpty()
  status: string;

  @IsOptional()
  @IsNotEmpty()
  docomoSettlementCode: string;

  @IsOptional()
  @IsNotEmpty()
  amazonChargePermissionID: string;

  @ValidateIf(
    (o) => o.amazonChargePermissionID && o.docomoSettlementCode == null,
  )
  @IsNotEmpty()
  checkString: string;

  @IsNotEmpty()
  tranDate: string;

  @IsOptional()
  errCode: string;

  @IsOptional()
  errInfo: string;
}
