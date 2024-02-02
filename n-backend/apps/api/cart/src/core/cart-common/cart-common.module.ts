import { Module } from '@nestjs/common';
import { CartCommonService } from './cart-common.service';

@Module({
  providers: [CartCommonService],
})
export class CartCommonModule {}
