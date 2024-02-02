import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import {
  MuleMembershipRecord,
  PrivateProfile,
} from './interface/private-profile.interface';
import { PrivateProfileService } from './private-profile.service';

describe('PrivateProfileService', () => {
  let service: PrivateProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [PrivateProfileService],
    }).compile();

    service = module.get<PrivateProfileService>(PrivateProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(service.getPrivateProfile).toBeDefined();
  });

  it('should transform to response type', async () => {
    const dummyResponse: MuleMembershipRecord = {
      createdById: '',
      createdDate: '',
      isCustomerPortal: '',
      isPersonAccount: '',
      lastModifiedById: '',
      lastModified: '',
      name: '',
      ownerId: '',
      email: '',
      phoneHome: '495251000',
      recordTypeId: '',
      salutation: '',
      address1: '本庄市',
      address2: '早稲田の杜一丁目2番1号',
      address3: 'カインズマンション100号室',
      agricultureType1: '',
      architectureJobCategory: '',
      birthMonth: '',
      blackCustomerClass: '',
      blackCustomerReason: '',
      blackCustomerReviewer: '',
      blackCustomerSetter: '',
      bussinessForm: '',
      cardNoContact: '00000000000002710000018216',
      clusterInformation: '',
      cropBrand1: '',
      cropType1: '',
      croppingAcreage1: '',
      ecRestrictionClass: '',
      ecRestrictionReason: '',
      ecRestrictionReviewer: '',
      ecRestrictionSetter: '',
      excludeGroceriesClusterInformation: '',
      farmerClass: '',
      firstKana: 'タロウ',
      lastKana: 'ヤマダ',
      firstName: '太郎',
      lastName: '山田',
      gender: '',
      otherJobName: '',
      postalCode: '3670030',
      prefecture: '埼玉県',
      propointCardClass: '',
      spareClusterInformation: '',
      job: '',
      agricultureType2: '',
      cropBrand2: '',
      cropType2: '',
      croppingAcreage2: '',
      memberRegistStatus: '',
      dmStatus: false,
      snsLastName: '',
      snsFirstName: '',
      mailMagazineFlag: '',
      cardType: '',
      memberStatus: '',
      ecbeingUserNo: '',
      membershipLevel: '',
    };

    // WARNING: Override method
    Object.defineProperty(service, 'getMuleMembershipRecord', {
      value: jest.fn(() => dummyResponse),
    });

    const result: PrivateProfile = {
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      lastName: '山田',
      firstName: '太郎',
      phoneNumber: '495251000',
      postalCode: '3670030',
      prefecture: '埼玉県',
      address1: '本庄市',
      address2: '早稲田の杜一丁目2番1号',
      address3: 'カインズマンション100号室',
      memberId: '00000000000002710000018216',
    };

    expect(await service.getPrivateProfile('dummyId')).toEqual(result);
  });
});
