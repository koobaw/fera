export interface TokenData {
  refreshToken: string;
  accessToken: string;
}

export interface MuleMembershipReadResponseSuccess {
  createdById: string;
  createdDate: string;
  firstName: string;
  isCustomerPortal: string;
  isPersonAccount: string;
  lastModifiedById: string;
  lastModified: string;
  lastName: string;
  name: string;
  ownerId: string;
  email: string;
  phoneHome: string;
  recordTypeId: string;
  salutation: string;
  address1: string;
  address2: string;
  address3: string;
  agricultureType1: string;
  architectureJobCategory: string;
  birthMonth: string;
  blackCustomerClass: string;
  blackCustomerReason: string;
  blackCustomerReviewer: string;
  blackCustomerSetter: string;
  businessForm: string;
  cardNoContact: string;
  clusterInformation: string;
  cropType1: string;
  croppingAcreage1: string;
  ecRestrictionClass: string;
  ecRestrictionReason: string;
  ecRestrictionReviewer: string;
  ecRestrictionSetter: string;
  excludeGroceriesClusterInformation: string;
  farmerClass: string;
  firstKana: string;
  gender: string;
  lastKana: string;
  otherJobName: string;
  postalCode: string;
  prefecture: string;
  propointCardClass: string;
  spareClusterInformation: string;
  job: string;
  agricultureType2: string;
  cropBrand2: string;
  cropType2: string;
  croppingAcreage2: string;
  memberRegistStatus: string;
  dmStatus: boolean;
  snsLastName: string;
  snsFirstName: string;
  mailMagazineFlag: string;
  cardType: string;
  memberStatus: string;
  ecbeingUserNo: string;
  membershipLevel: string;
}

export interface MuleMembershipReadResponseFailure {
  status: number;
  cid: string;
  timestamp: Date;
  description: string;
  detailedDescription?: string;
}
