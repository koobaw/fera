// eslint-disable-next-line max-classes-per-file
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Matches,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerInfo {
  @IsNotEmpty()
  @Matches(/^([0-9]{7})$/)
  customerZipCode: string;

  @IsNotEmpty()
  customerPrefecture: string;

  @IsNotEmpty()
  customerCity: string;
}

class ShippingInfo {
  @IsNotEmpty()
  isSameAsPurchaser: string;

  @IsNotEmpty()
  selectedAddressBookId: string;

  @IsNotEmpty()
  @Matches(/^([0-9]{7})$/)
  shippingPostalCode: string;

  @IsNotEmpty()
  shippingPrefecture: string;

  @IsNotEmpty()
  shippingCity: string;
}

class PaymentMethodInfo {
  @IsNotEmpty()
  isStorePaymentSelected: boolean;

  @IsOptional()
  selectedPaymentMethodId: string;

  @IsOptional()
  @IsNumber()
  cardSequentialNumber: number;

  @IsOptional()
  @IsBoolean()
  isSaveCard: boolean;

  @IsOptional()
  selectedConvenienceCode: string;
}

export class CheckoutChangeDto {
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerInfo)
  customerInfo: CustomerInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingInfo)
  shippingInfo: ShippingInfo;

  @IsOptional()
  @Matches(/^([0-9]{4})$/)
  selectedStoreCode: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodInfo)
  paymentMethodInfo: PaymentMethodInfo;

  @IsOptional()
  @IsNumber()
  redeemedPoints: number;
}
