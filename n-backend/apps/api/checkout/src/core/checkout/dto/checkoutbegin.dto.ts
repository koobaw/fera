import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CheckoutBeginDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/)
  userId: string;

  @IsOptional()
  amazonCheckoutSessionId: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^[a-zA-Z0-9]{20}$/, { each: true })
  selectedItems: Array<string>;
}
