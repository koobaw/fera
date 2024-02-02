import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './location.dto';

export class SearchStoreDto {
  @IsOptional()
  @IsArray()
  keywords: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  landscape: LocationDto;

  @IsOptional()
  @IsString()
  prefectureCode: string;
}
