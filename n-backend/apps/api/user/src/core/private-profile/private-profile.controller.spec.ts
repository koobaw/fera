import { CommonModule, CommonService } from '@cainz-next-gen/common';
import {
  SalesforceApiModule,
  SalesforceApiService,
} from '@cainz-next-gen/salesforce-api';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { PrivateProfile } from './interface/private-profile.interface';
import { PrivateProfileController } from './private-profile.controller';
import { PrivateProfileService } from './private-profile.service';

describe('PrivateProfileController', () => {
  let controller: PrivateProfileController;
  let commonService: CommonService;
  let salesforceApiService: SalesforceApiService;
  let privateProfileService: PrivateProfileService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule, SalesforceApiModule, CommonModule],
      providers: [PrivateProfileService],
      controllers: [PrivateProfileController],
    }).compile();

    controller = module.get<PrivateProfileController>(PrivateProfileController);
    commonService = module.get<CommonService>(CommonService);
    salesforceApiService =
      module.get<SalesforceApiService>(SalesforceApiService);
    privateProfileService = module.get<PrivateProfileService>(
      PrivateProfileService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should success response when user have usable access_token', async () => {
    const mockedClaims = {
      claims: {
        userId: 'dummyUserId',
        encryptedMemberId: 'dummyEncryptedMemberId',
        accessToken: 'dummyAccessToken',
        refreshToken: 'dummyRefreshToken',
      },
    };
    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementation(async () => 'dummySalesForceUserId');

    jest
      .spyOn(privateProfileService, 'getPrivateProfile')
      .mockImplementation(async () => {
        const privateProfile: PrivateProfile = {};
        return privateProfile;
      });

    await expect(
      controller.getPrivateProfile(<never>mockedClaims),
    ).resolves.toEqual({
      code: HttpStatus.OK,
      data: expect.anything(),
      message: 'ok',
    });
  });

  it('should success response when user have expired access_token', async () => {
    const mockedClaims = {
      claims: {
        userId: 'dummyUserId',
        encryptedMemberId: 'dummyEncryptedMemberId',
        accessToken: 'dummyAccessToken',
        refreshToken: 'dummyRefreshToken',
      },
    };
    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementationOnce(async () => {
        throw new Error();
      });
    jest
      .spyOn(salesforceApiService, 'refreshAccessToken')
      .mockImplementation(async () => 'dummyAccessToken');

    jest
      .spyOn(commonService, 'saveToFirebaseAuthClaims')
      .mockImplementation(jest.fn());

    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementationOnce(async () => 'dummySalesForceUserId');

    jest
      .spyOn(privateProfileService, 'getPrivateProfile')
      .mockImplementation(async () => {
        const privateProfile: PrivateProfile = {};
        return privateProfile;
      });
    await expect(
      controller.getPrivateProfile(<never>mockedClaims),
    ).resolves.toEqual({
      code: HttpStatus.OK,
      data: expect.anything(),
      message: 'ok',
    });
  });
});
