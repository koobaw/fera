import { OrderModule } from '@cainz-next-gen/order';
import { Module } from '@nestjs/common';
import { OrderServiceTestController } from './order-service-test.controller';
import { CartCommonService } from '../cart-common/cart-common.service';
import { CartService } from '../cart/cart.service';

@Module({
  imports: [OrderModule],
  controllers: [OrderServiceTestController],
  providers: [CartCommonService, CartService],
})
export class OrderServiceTestModule {}
