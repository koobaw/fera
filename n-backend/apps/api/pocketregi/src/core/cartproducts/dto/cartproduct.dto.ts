// eslint-disable-next-line max-classes-per-file
import { IsNotEmpty, IsString, IsNumberString } from 'class-validator';

export class CartProductsDto {
  @IsNotEmpty({ message: 'Store code is empty' })
  @IsString({ message: 'Store code not a string' })
  storeCode: string;
}
export class AddCartProductsDto {
  @IsNotEmpty({ message: 'Product Id is empty' })
  @IsString({ message: 'Product Id is not a string' })
  @IsNumberString()
  productId: string;

  @IsNotEmpty({ message: 'Store code is empty' })
  @IsString({ message: 'Store code not a string' })
  storeCode: string;
}

export class UpdateCartProductsDto {
  @IsNotEmpty({ message: 'Product Id is empty' })
  @IsString({ message: 'Product Id is not a string' })
  @IsNumberString()
  productId: string;

  @IsNotEmpty({ message: 'Quantity is empty or not a number' })
  @IsNumberString()
  quantity: number;
}

export class DeleteCartProductsDto {
  @IsNotEmpty({ message: 'Product Id is empty' })
  @IsString({ message: 'Product Id is not a string' })
  @IsNumberString()
  productId: string;
}
