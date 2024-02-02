// eslint-disable-next-line max-classes-per-file
import { IsNotEmpty, Matches } from 'class-validator';

export class FromUserDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  fromUserId: string;
}

export class ToUserDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/)
  userId: string;
}
