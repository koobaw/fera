export interface MuleAddressesFindResponseSuccess {
  id: string;
  name: string;
  accountId: string;
  isFavorite?: boolean;
  title?: string;
  firstName?: string;
  lastName?: string;
  firstNameKana?: string;
  lastNameKana?: string;
  zipCode?: string;
  prefecture?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  companyName?: string;
  departmentName?: string;
  memo?: string;
}

export type MuleAddressesFindErrorResponse = MuleAddressesServerErrorResponse;

export interface MuleAddressesServerErrorResponse {
  status: string;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
