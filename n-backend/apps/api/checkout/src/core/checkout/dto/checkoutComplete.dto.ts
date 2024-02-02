// eslint-disable-next-line max-classes-per-file
import {
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsString,
  Matches,
  ValidateNested,
  IsBoolean,
  IsObject,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class TokenList {
  @IsNotEmpty()
  @IsString({ each: true })
  creditCardToken: string;
}

class HttpHeader {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  accept: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  acceptCharset: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  acceptEncoding: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  acceptLanguage: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  clientIp: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  connection: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  dnt: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  host: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  referrer: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  userAgent: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  keepAlive: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  uaCpu: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  via: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  xForwardedFor: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  endUserIp: string | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  imei: string | null;
}

class CustomerInfoValidate {
  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,10}$/)
  customerLastName: string;

  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,10}$/)
  customerFirstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[ァ-ヶー]{1,10}$/)
  customerLastNameKana: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[ァ-ヶー]{1,10}$/)
  customerFirstNameKana: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-9]{7})$/)
  customerPostalCode: string;

  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){3,4}$/)
  customerPrefecture: string;

  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,80}$/)
  customerCity: string;

  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,40}$/)
  customerAddress1: string;

  @IsString()
  @IsOptional()
  customerAddress2: string;

  @IsString()
  @IsOptional()
  customerCompanyName: string;

  @IsString()
  @IsOptional()
  customerDepartmentName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-9]{10,11})$/)
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[a-zA-Z0-9_+-]+[a-zA-Z0-9._+-]*@([a-zA-Z0-9.-]*[a-zA-Z0-9])+\.[a-zA-Z]{2,6}$/,
  )
  customerEmail: string;
}

class ShippingInfoValidate {
  @IsNotEmpty()
  @IsBoolean()
  isSameAsPurchaser: boolean;

  @IsNotEmpty()
  @IsString()
  selectedAddressBookId: string;

  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,10}$/)
  shippingLastName: string;

  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,10}$/)
  shippingFirstName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[ァ-ヶー]{1,10}$/)
  shippingLastNameKana: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[ァ-ヶー]{1,10}$/)
  shippingFirstNameKana: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9]{7})$/)
  shippingPostalCode: string;

  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){3,4}$/)
  shippingPrefecture: string;

  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,80}$/)
  shippingCity: string;

  @IsNotEmpty()
  @IsString()
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){1,40}$/)
  shippingAddress1: string;

  @IsOptional()
  @IsString()
  shippingAddress2: string;

  @IsOptional()
  @IsString()
  shippingCompanyName: string;

  @IsOptional()
  @IsString()
  shippingDepartmentName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-9]{10,11})$/)
  shippingPhone: string;

  @IsOptional()
  @IsString()
  desiredDeliveryDate: string | null;

  @IsOptional()
  @IsString()
  desiredDeliveryTimeZoneId: string | null;

  @IsNotEmpty()
  @IsBoolean()
  isDeliveryBox: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isGift: boolean;
}
export class CheckoutCompleteDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/)
  userId: string;

  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => CustomerInfoValidate)
  customerInfo: CustomerInfoValidate;

  @ValidateNested()
  @IsOptional()
  @IsObject()
  @Type(() => ShippingInfoValidate)
  shippingInfo: ShippingInfoValidate;

  @IsOptional()
  @IsString()
  @Matches(/^([a-zA-Z0-9_./*-]{1,34})$/)
  affiliateTrackingId: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-9]{4}-[0-9]{2}-[0-9]{2}T+([0-9]{2}:[0-9]{2}:[0-9]{2}Z))$/)
  affiliateVisitDateTime: string;

  @IsOptional()
  @IsArray()
  creditCardTokenList: TokenList[] | null;

  @IsOptional()
  @IsObject()
  httpHeader: HttpHeader | null;
}
