export interface CreateCustomerInfoResponse {
  status: number;
  customerInfo: CustomerInfo;
}

export interface CustomerInfo {
  customerLastName: string;
  customerFirstName: string;
  customerLastNameKana: string;
  customerFirstNameKana: string;
  customerZipCode: string;
  customerPrefecture: string;
  customerCity: string;
  customerAddress1: string;
  customerAddress2: string;
  customerCompanyName: string;
  customerDepartmentName: string;
  customerPhone: string;
  customerEmail: string;
  errorCode: string;
  message: string;
  isMember: boolean;
  billPayment: boolean;
  memberRegistrationDate: string;
  isSameAsShippingInfo: boolean;
  typeOfAmazonPayAddress: number;
  errors: Array<unknown>;
}

export interface CreateShippingInfoResponse {
  status: number;
  shippingInfo: ShippingInfo;
}

export interface ShippingInfo {
  shippingLastName: string;
  shippingFirstName: string;
  shippingLastNameKana: string;
  shippingFirstNameKana: string;
  shippingZipCode: string;
  shippingPrefecture: string;
  shippingCity: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCompanyName: string;
  shippingDepartmentName: string;
  shippingPhone: string;
  selectedAddressBookId: string;
  desiredDeliveryDateList: [];
  desiredDeliveryTimeZoneList: [];
  isDeliveryBox: boolean;
  unattendedDeliveryFlag: boolean;
  isGift: boolean;
  isAmazonPayAddress: boolean;
  errors: Array<unknown>;
}
