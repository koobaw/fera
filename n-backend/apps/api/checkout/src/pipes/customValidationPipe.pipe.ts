import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
} from '@nestjs/common';
import { CheckoutComplete2Dto } from '../core/checkout/dto/checkoutComplete2.dto';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  transform(value: CheckoutComplete2Dto, metadata: ArgumentMetadata) {
    if (
      value.docomoSettlementCode == null &&
      value.amazonChargePermissionID == null
    )
      throw new HttpException(
        'You must provide any one of docomoSettlementCode or amazonChargePermissionID',
        400,
      );
    if (value.docomoSettlementCode && value.amazonChargePermissionID)
      throw new HttpException(
        'You must provide any one of docomoSettlementCode or amazonChargePermissionID',
        400,
      );
    else return value;
  }
}
