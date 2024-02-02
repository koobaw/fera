// eslint-disable-next-line max-classes-per-file
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  Matches,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export enum ReceivingMethod {
  DELIVERY_TO_SPECIFIED_ADDRESS = '1',
  STORE_RESERVE = '2',
}

class OrderSpecification {
  @IsNotEmpty()
  simulationNumber: string;

  @IsOptional()
  height: number;

  @IsOptional()
  width: number;

  @IsOptional()
  color: string;

  @IsOptional()
  hook: string;
}

export class CartAddItemDto {
  @IsEnum(ReceivingMethod)
  @IsNotEmpty()
  receivingMethod: string;

  @IsNotEmpty()
  @Matches(/^([0-9]{13})$/)
  productId: string;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @ValidateIf((o) => o.receivingMethod === ReceivingMethod.STORE_RESERVE)
  @Matches(/^([0-9]{4})$/)
  storeCode: string;

  @IsNotEmpty()
  @ValidateIf(
    (o) => o.receivingMethod === ReceivingMethod.DELIVERY_TO_SPECIFIED_ADDRESS,
  )
  // eslint-disable-next-line no-control-regex
  @Matches(/^([^\x01-\x7E]){3,4}$/)
  prefecture: string;

  @IsOptional()
  isWebBackOrder: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderSpecification)
  orderSpecification: OrderSpecification;
}
