import { Injectable } from '@nestjs/common';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';

@Injectable()
export class UpdateAddressesService {
  constructor(
    private readonly addressesMuleApiService: AddressesMuleApiService,
  ) {}

  public async updateAddress(updateAddressParamDto, updateAddressBodyDto) {
    return this.addressesMuleApiService.updateAddress(
      updateAddressParamDto,
      updateAddressBodyDto,
    );
  }
}
