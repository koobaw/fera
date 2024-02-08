import request from 'supertest';
import { CommonService } from '@cainz-next-gen/common';
import {
  SalesforceApiModule,
  SalesforceApiService,
} from '@cainz-next-gen/salesforce-api';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MemberAuthGuard } from '@cainz-next-gen/guard';
import { MockAuthGuard } from '@cainz-next-gen/test';
import { GlobalsModule } from '../../globals.module';
import { MuleMembershipRecord } from './interface/private-profile.interface';
import { PrivateProfileController } from './private-profile.controller';
import { PrivateProfileService } from './private-profile.service';

describe('PrivateProfileController', () => {
  let app: INestApplication;
  let salesforceApiService: SalesforceApiService;
  let privateProfileService: PrivateProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule, SalesforceApiModule],
      controllers: [PrivateProfileController],
      providers: [
        PrivateProfileService,
        {
          provide: CommonService,
          useFactory: () => ({
            saveToFirebaseAuthClaims: jest.fn(),
            createFirestoreSystemName: () => 'test',
          }),
        },
      ],
    })
      .overrideGuard(MemberAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    salesforceApiService =
      module.get<SalesforceApiService>(SalesforceApiService);
    privateProfileService = module.get<PrivateProfileService>(
      PrivateProfileService,
    );

    jest
      .spyOn(privateProfileService, 'updateUserSchema')
      .mockImplementation(async () => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should success response when user have usable access_token', async () => {
    // define parameter
    const expectedResponseData = {
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
    // define mock
    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementation(async () => 'dummySalesForceUserId');
    jest
      .spyOn(privateProfileService, 'getMuleMembershipRecord')
      .mockImplementation(
        async () =>
          ({
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
          } as unknown as MuleMembershipRecord),
      );
    // check api
    const response = await request(app.getHttpServer())
      .get('/member/private-profile')
      .set({ Authorization: 'Bearer VALID_TOKEN' });
    expect({ ...response.body, timestamp: '' }).toEqual({
      code: HttpStatus.OK,
      data: expectedResponseData,
      message: 'ok',
      timestamp: '',
    });
  });

  it('should success response when user have expired access_token', async () => {
    // define parameter
    const expectedResponseData = {
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
    // define mock
    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementationOnce(async () => {
        console.log('one');
        throw new Error('here');
      })
      .mockImplementationOnce(async () => {
        console.log('two');
        return 'dummySalesForceUserId';
      });
    jest
      .spyOn(salesforceApiService, 'refreshAccessToken')
      .mockImplementation(async () => 'dummyAccessToken');
    jest
      .spyOn(privateProfileService, 'getMuleMembershipRecord')
      .mockImplementation(
        async () =>
          ({
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
          } as unknown as MuleMembershipRecord),
      );
    // check api
    const response = await request(app.getHttpServer())
      .get('/member/private-profile')
      .set({ Authorization: 'Bearer VALID_TOKEN' });
    expect({ ...response.body, timestamp: '' }).toEqual({
      code: HttpStatus.OK,
      data: expectedResponseData,
      message: 'ok',
      timestamp: '',
    });
  });

  it('should success response with select query', async () => {
    // define parameter
    const expectedResponseData = {
      memberId: 'dummyId',
      createdDate: '2023-10-24T02:00:00.000Z',
    };
    // define mock
    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockImplementation(async () => 'dummySalesForceUserId');
    jest
      .spyOn(privateProfileService, 'getMuleMembershipRecord')
      .mockImplementation(
        async () =>
          ({
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
          } as unknown as MuleMembershipRecord),
      );
    // check api
    const response = await request(app.getHttpServer())
      .get('/member/private-profile')
      .set({ Authorization: 'Bearer VALID_TOKEN' })
      .query({ select: 'memberId,createdDate' });
    expect({ ...response.body, timestamp: '' }).toEqual({
      code: HttpStatus.OK,
      data: expectedResponseData,
      message: 'ok',
      timestamp: '',
    });
  });
});
