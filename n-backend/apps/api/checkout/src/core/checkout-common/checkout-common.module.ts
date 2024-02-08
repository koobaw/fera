import { Module } from '@nestjs/common';
import { CheckoutCommonService } from './checkout-common.service';
import { CheckoutCommonValidation } from './checkout-common-validation';
import { CheckoutServiceTestController } from '../checkout-service-test/checkout-service-test.controller';

@Module({
  providers: [CheckoutCommonService, CheckoutCommonValidation],
  controllers: [CheckoutServiceTestController],
})
export class CheckoutCommonModule {}
