import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckoutCommonValidation {
  isValidParamCreateCustomerInfo(isMember, member): boolean {
    if (typeof isMember !== 'boolean' || typeof isMember === 'undefined') {
      return false;
    }
    if (isMember === true && !member) {
      return false;
    }
    return true;
  }

  isValidParamCreateShippingInfo(
    isMember,
    member,
    addressBook,
    selectedAddressBookId,
    amazonInfo,
  ): boolean {
    if (!amazonInfo) {
      if (typeof isMember !== 'boolean' || typeof isMember === 'undefined') {
        return false;
      }
      if (isMember === true && selectedAddressBookId === null && !member) {
        return false;
      }
      if (isMember === true && selectedAddressBookId !== null && !addressBook) {
        return false;
      }
    }
    return true;
  }
}
