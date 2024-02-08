import { Injectable } from '@nestjs/common';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';
import { UpdateAddressParamDto } from '../dto/update.address-param.dto';
import { UpdateAddressBodyDto } from '../dto/update.address-body.dto';

@Injectable()
export class UpdateAddressesService {
  constructor(
    private readonly addressesMuleApiService: AddressesMuleApiService,
  ) {}

  public async updateAddress(
    updateAddressParamDto: UpdateAddressParamDto,
    updateAddressBodyDto: UpdateAddressBodyDto,
  ) {
    return this.addressesMuleApiService.updateAddress(
      updateAddressParamDto,
      updateAddressBodyDto,
    );
  }
}
