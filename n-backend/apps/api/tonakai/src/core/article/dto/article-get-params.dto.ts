import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export const sortByAllowedList = ['date'];
export type OrderAllowedValue = 'asc' | 'desc';
const orderAllowedList: OrderAllowedValue[] = ['asc', 'desc'];

export class ArticleGetParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(sortByAllowedList)
  sortBy: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(orderAllowedList)
  order: 'asc' | 'desc';
}
