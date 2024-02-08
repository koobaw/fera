/* eslint-disable no-control-regex */
/* eslint-disable-next-line max-classes-per-file */
import {
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Matches,
  ValidateNested,
  IsBoolean,
  isNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class CustomerInfo {
  @IsNotEmpty()
  customerLastName: string;

  @IsNotEmpty()
  customerFirstName: string;

  @IsNotEmpty()
  customerLastNameKana: string;

  @IsNotEmpty()
  customerFirstNameKana: string;

  @IsNotEmpty()
  @Matches(/^([0-9]{7})$/)
  customerZipCode: string;

  @IsNotEmpty()
  customerPrefecture: string;

  @IsNotEmpty()
  customerCity: string;

  @IsNotEmpty()
  customerAddress1: string;

  @IsOptional()
  customerAddress2: string;

  @IsOptional()
  customerCompanyName: string;

  @IsOptional()
  customerDepartmentName: string;

  @IsNotEmpty()
  @Matches(/^([0-9]{10,11})$/)
  customerPhone: string;

  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._+-@]{1,80}$/)
  customerEmail: string;

  @IsNotEmpty()
  isSameAsShippingInfo: boolean;
}

class GuestInputInfo {
  @IsOptional()
  shippingLastName: string;

  @IsOptional()
  shippingFirstName: string;

  @IsOptional()
  shippingLastNameKana: string;

  @IsOptional()
  shippingFirstNameKana: string;

  @IsOptional()
  @Matches(/^([0-9]{7})$/)
  shippingZipCode: string;

  @IsOptional()
  shippingPrefecture: string;

  @IsOptional()
  @Matches(/^([^\x01-\x7E]){1,80}$/)
  shippingCity: string;

  @IsOptional()
  shippingAddress1: string;

  @IsOptional()
  shippingAddress2: string;

  @IsOptional()
  shippingCompanyName: string;

  @IsOptional()
  shippingDepartmentName: string;

  @IsOptional()
  @Matches(/^([0-9]{10,11})$/)
  shippingPhone: string;
}

class ShippingInfo {
  @IsOptional()
  selectedAddressBookId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInputInfo)
  guestInputInfo: GuestInputInfo;

  @IsNotEmpty()
  desiredDeliveryDate: string;

  @IsNotEmpty()
  desiredDeliveryTimeZoneId: string;

  @IsNotEmpty()
  unattendedDeliveryFlag: boolean;

  @IsNotEmpty()
  isGift: boolean;
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
  @IsBoolean()
  isDelete: boolean;

  @IsOptional()
  selectedConvenienceCode: string;
}

class StoreInfo {
  @IsNotEmpty()
  @Matches(/^([0-9]{1,4})$/)
  selectedStoreCode: string;

  @IsOptional()
  selectedReceiptLocation: number;
}

export class CheckoutChangeDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerInfo)
  customerInfo: CustomerInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingInfo)
  shippingInfo: ShippingInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => StoreInfo)
  storeInfo: StoreInfo;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodInfo)
  paymentMethodInfo: PaymentMethodInfo;

  @IsOptional()
  @IsNumber()
  redeemedPoints: number;
}
