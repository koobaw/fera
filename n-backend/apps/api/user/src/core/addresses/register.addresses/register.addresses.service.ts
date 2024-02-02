import { Injectable } from '@nestjs/common';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';
import { RegisterAddressesBodyDto } from '../dto/register.addresses-body.dto';

@Injectable()
export class RegisterAddressesService {
  constructor(private readonly addressesMuleApi: AddressesMuleApiService) {}

  public async registerAddressees(
    memberId: string,
    registerAddressRequestBody: RegisterAddressesBodyDto,
  ) {
    const createAddressesRequest = {
      accountId: memberId,
      ...registerAddressRequestBody,
    };
    await this.addressesMuleApi.createAddresses(createAddressesRequest);
  }
}
