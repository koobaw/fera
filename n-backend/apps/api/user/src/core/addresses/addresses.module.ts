import { Module } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesMuleApiService } from './addresses-mule-api/addresses-mule-api.service';
import { UpdateAddressesService } from './update.addresses/update.addresses.service';
import { FindAddressesService } from './find.addresses/find.addresses.service';
import { RegisterAddressesService } from './register.addresses/register.addresses.service';

@Module({
  providers: [
    FindAddressesService,
    RegisterAddressesService,
    UpdateAddressesService,
    AddressesMuleApiService,
  ],
  controllers: [AddressesController],
})
export class AddressesModule {}
