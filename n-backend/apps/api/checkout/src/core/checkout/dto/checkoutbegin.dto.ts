import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CheckoutBeginDto {
  @IsOptional()
  amazonCheckoutSessionId: string;

  @IsArray()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9]{20}$/, { each: true })
  selectedItems: Array<string>;
}
