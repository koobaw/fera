import { Test, TestingModule } from '@nestjs/testing';
import {
  SalesforceApiModule,
  SalesforceApiService,
} from '@fera-next-gen/salesforce-api';
import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { GlobalsModule } from '../../globals.module';
import { MuleMembershipReadResponseSuccess } from './interface/login.interface';

describe('LoginController', () => {
  let controller: LoginController;
  let loginService: LoginService;
  let commonService: CommonService;
  let salesforceApiService: SalesforceApiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule, SalesforceApiModule],
      controllers: [LoginController],
      providers: [
        LoginService,
        {
          provide: FirestoreBatchService,
          useFactory: () => {},
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
    commonService = module.get<CommonService>(CommonService);
    salesforceApiService =
      module.get<SalesforceApiService>(SalesforceApiService);
    loginService = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call these methods', async () => {
    jest
      .spyOn(commonService, 'getClaims')
      .mockReturnValue({ userId: 'dummyUserId' });
    jest.spyOn(commonService, 'encryptAES256').mockReturnValue('dummyUserId');

    jest.spyOn(salesforceApiService, 'getUserToken').mockResolvedValue({
      accessToken: 'dummyAccessToken',
      refreshToken: 'dummyRefreshToken',
    });

    jest
      .spyOn(salesforceApiService, 'getSalesforceUserId')
      .mockResolvedValue('dummySalesforceUserId');

    jest.spyOn(loginService, 'getUserInfo').mockResolvedValue({
      cardNoContact: 'dummyMemberId',
      address1: 'dummyAddress1',
      address2: 'dummyAddress2',
      address3: 'dummyAddress3',
      membershipLevel: '4',
    } as MuleMembershipReadResponseSuccess);

    jest.spyOn(loginService, 'saveToFirebaseAuthClaims').mockResolvedValue();

    jest
      .spyOn(commonService, 'createFirestoreSystemName')
      .mockReturnValue('dummyOperatorName');

    jest.spyOn(loginService, 'transferToMember').mockResolvedValue();

    await expect(
      controller.login(<never>{ claims: { userId: 'dummyUserId' } }, <never>{}),
    ).resolves.toEqual({
      code: 201,
      data: {
        memberId: 'dummyMemberId',
        address1: 'dummyAddress1',
        address2: 'dummyAddress2',
        address3: 'dummyAddress3',
      },
      message: 'ok',
    });
  });
});
