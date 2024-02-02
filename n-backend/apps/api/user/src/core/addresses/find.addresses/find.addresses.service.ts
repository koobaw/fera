import { Injectable } from '@nestjs/common';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';
import { FindAddressApiResponseObject } from '../interfaces/addresses.interface';

@Injectable()
export class FindAddressesService {
  constructor(
    private readonly addressesMuleApiService: AddressesMuleApiService,
  ) {}

  /**
   * 住所取得
   */
  public async getAddresses(
    memberId: string,
    isFavorite?: boolean,
  ): Promise<FindAddressApiResponseObject[]> {
    const addressLists = await this.addressesMuleApiService.fetchAddresses(
      memberId,
      isFavorite,
    );

    const transformedAddressLists = addressLists.map((address) => ({
      addressId: address.id,
      isFavorite: address.isFavorite,
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      firstNameKana: address.firstNameKana,
      lastNameKana: address.lastNameKana,
      zipCode: address.zipCode,
      prefecture: address.prefecture,
      address1: address.address1,
      address2: address.address2,
      address3: address.address3,
      phone: address.phone,
      phone2: address.phone2,
      email: address.email,
      companyName: address.companyName,
      departmentName: address.departmentName,
      memo: address.memo,
    }));

    return transformedAddressLists;
  }
}
