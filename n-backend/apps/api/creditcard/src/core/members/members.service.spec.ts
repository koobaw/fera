import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { GlobalsModule } from '../../globals.module';
import {
  RegisterMemberIdMuleResponse,
  RegisterMemberIdResponse,
} from './interfaces/registerMemberIdMule';
import { MembersService } from './members.service';
import { CreditUtilService } from '../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

describe('RegisterMemberIdService', () => {
  let membersService: MembersService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  let creditUtilsService: CreditUtilService;
  let mockClaims;
  const dummyServerError = {
    errCode: ErrorCode.MULE_API_SERVER_ERROR as string,
    errMessage: ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR] as any,
    status: 500,
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        MembersService,
        {
          provide: CreditUtilService,
          useFactory: () => ({
            getMuleUrls: jest.fn(),
            getDecryptedMemberId: jest.fn(),
            handleException: jest.fn().mockReturnValue(dummyServerError),
          }),
        },
      ],
    }).compile();
    membersService = module.get<MembersService>(MembersService);
    mockedHttpService = jest.mocked(module.get<HttpService>(HttpService));
    creditUtilsService = module.get<CreditUtilService>(CreditUtilService);
    mockClaims = {
      encryptedMemberId: 'NY8RNVDsEaNQLkRtH1LvvASZjVKJm4mn79K8+QMK3QU=',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RegisterMemberIdService', () => {
    const muleResponse: RegisterMemberIdMuleResponse = {
      status: 200,
      cid: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
      timestamp: '2023-05-24T11:00:10+09:00',
    };
    const registerMemberIdServiceResponse: RegisterMemberIdResponse = {
      code: 201,
      message: 'OK',
      data: {
        muleRequestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
      },
    };
    it('should be defined', () => {
      expect(membersService).toBeDefined();
      expect(membersService.registerMemberId).toBeDefined();
    });

    it('should register memberId with mule', async () => {
      jest
        .spyOn(creditUtilsService, 'getDecryptedMemberId')
        .mockResolvedValue('2710000018308');
      jest
        .spyOn(mockedHttpService, 'post')
        .mockReturnValue(of({ data: muleResponse }));

      expect(await membersService.registerMemberId(mockClaims)).toEqual(
        registerMemberIdServiceResponse,
      );
    });

    it('should throw error if any error is returned from api', async () => {
      jest.spyOn(mockedHttpService, 'post').mockImplementationOnce(() =>
        throwError(
          () =>
            new AxiosError(null, null, null, null, {
              status: 500,
              data: {
                status: 500,
                errors: [{ code: 'error code', message: 'error message' }],
              },
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
        ),
      );
      await expect(membersService.registerMemberId(mockClaims)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
