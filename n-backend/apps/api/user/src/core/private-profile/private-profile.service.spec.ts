import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { MuleMembershipRecord } from './interface/private-profile.interface';
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

  describe('convertProfileFromUMembershipRecord', () => {
    // define common parameter
    const membershipRecord = {
      lastKana: 'テスト',
      firstKana: 'タロウ',
      lastName: 'テスト',
      firstName: '太郎',
      phoneHome: '09099999999',
      postalCode: '100-0005',
      prefecture: '東京都',
      address1: '千代田区',
      address2: '丸の内1丁目',
      address3: '東京駅',
      cardNoContact: 'dummyId',
      createdDate: '2023-10-24T02:00:00.000Z',
    } as unknown as MuleMembershipRecord;
    it('should return correct response with undefined targets', () => {
      // define parameter
      const targets = undefined;
      const expectedResponse = {
        lastNameKana: 'テスト',
        firstNameKana: 'タロウ',
        lastName: 'テスト',
        firstName: '太郎',
        phoneNumber: '09099999999',
        postalCode: '100-0005',
        prefecture: '東京都',
        address1: '千代田区',
        address2: '丸の内1丁目',
        address3: '東京駅',
        memberId: 'dummyId',
        createdDate: '2023-10-24T02:00:00.000Z',
      };
      // check method
      expect(
        service.convertProfileFromUMembershipRecord(membershipRecord, targets),
      ).toEqual(expectedResponse);
    });
    it('should return correct response with miss targets', () => {
      // define parameter
      const targets = ['miss'];
      const expectedResponse = {};
      // check method
      expect(
        service.convertProfileFromUMembershipRecord(membershipRecord, targets),
      ).toEqual(expectedResponse);
    });
    it('should return correct response with targets', () => {
      // define parameter
      const targets = ['memberId', 'createdDate'];
      const expectedResponse = {
        memberId: 'dummyId',
        createdDate: '2023-10-24T02:00:00.000Z',
      };
      // check method
      expect(
        service.convertProfileFromUMembershipRecord(membershipRecord, targets),
      ).toEqual(expectedResponse);
    });
  });
});
