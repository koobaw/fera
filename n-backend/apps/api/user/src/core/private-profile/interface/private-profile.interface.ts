export interface PrivateProfile {
  lastNameKana?: string;
  firstNameKana?: string;
  lastName?: string;
  firstName?: string;
  phoneNumber?: string;
  postalCode?: string;
  prefecture?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  memberId?: string;
}

export interface MuleMembershipRecord {
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
  bussinessForm: string;
  cardNoContact: string;
  clusterInformation: string;
  cropBrand1: string;
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
