import { of, throwError } from 'rxjs';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpModule, HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { Claims } from '@cainz-next-gen/types';
import { AxiosError } from 'axios';
import {
  RegisterCardRequest,
  RegisterCard,
} from '../interface/creditcards.response';
import { RegisterCardService } from './register.cards.service';
import { CreditUtilService } from '../../../utils/credit-util.service';

const mockOperatorName = 'sys-user-api';
const mockBrand = 'visa';
const dummyDeleteCard = { id: 1 };
const mockFirestoreBatchService = {
  findCollection: jest.fn(() => ({
    doc: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(),
        listDocuments: jest.fn().mockReturnValue([dummyDeleteCard]),
      })),
    })),
  })),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};
const mockClaims = {
  encryptedMemberId: 'NY8RNVDsEaNQLkRtH1LvvASZjVKJm4mn79K8+QMK3QU=',
} as Claims;
const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};
describe('CreditcardService', () => {
  let service: RegisterCardService;
  let creditUtilsService: CreditUtilService;
  let mockedEnv: jest.MockedObjectDeep<ConfigService>;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        RegisterCardService,
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
        {
          provide: CreditUtilService,
          useFactory: () => ({
            getMuleUrls: jest.fn(),
            getDecryptedMemberId: jest.fn(),
            handleException: jest.fn(),
          }),
        },
        {
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            info: jest.fn(),
          }),
        },
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
      ],
    }).compile();

    service = module.get<RegisterCardService>(RegisterCardService);
    creditUtilsService = module.get<CreditUtilService>(CreditUtilService);
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
    const configService = module.get<ConfigService>(ConfigService);
    mockedEnv = jest.mocked<ConfigService>(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.registerCreditCard).toBeDefined();
  });

  describe('register credit card', () => {
    const creditCardReq: RegisterCardRequest = {
      claims: mockClaims,
      token: '33538878188a32670fb63865403ad947a7bb88f71a7db13b5bf17e9007838a00',
    };
    const creditCard: RegisterCard = {
      memberId: '2710000018308',
      token: '33538878188a32670fb63865403ad947a7bb88f71a7db13b5bf17e9007838a00',
    };
    it('should register credit card by calling mule api', async () => {
      const mockData = { message: 'OK', code: HttpStatus.CREATED };
      jest
        .spyOn(mockedHttpService, 'post')
        .mockReturnValue(of({ data: mockData }));
      await expect(
        service.registerCreditCard(creditCardReq, mockBrand, mockOperatorName),
      ).resolves.toEqual(mockData);
    });

    it('should handle the errors', async () => {
      const mockErrorRes = {
        errCode: 'APIError.7002',
        errMessage: 'Bad Request',
        status: 400,
      };
      jest
        .spyOn(creditUtilsService, 'handleException')
        .mockImplementationOnce(() => mockErrorRes);
      await expect(
        service.registerCreditCard(creditCardReq, mockBrand, mockOperatorName),
      ).rejects.toThrow();
      jest.clearAllMocks();
    });

    it('should require {url, headers}', async () => {
      const jsonCreditCard = JSON.stringify(creditCard);
      const mockData = { message: 'OK', code: HttpStatus.CREATED };
      const spyHttpPost = jest
        .spyOn(mockedHttpService, 'post')
        .mockReturnValue(of({ data: mockData }));
      jest
        .spyOn(creditUtilsService, 'getDecryptedMemberId')
        .mockResolvedValue(creditCard.memberId);
      const mockUrl = 'mockedUrl';
      jest
        .spyOn(creditUtilsService, 'getMuleUrls')
        .mockResolvedValueOnce(mockUrl);
      await service.registerCreditCard(
        creditCardReq,
        mockBrand,
        mockOperatorName,
      );
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
        client_id: mockedEnv.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
        client_secret: mockedEnv.get<string>('MULE_POCKET_REGI_CLIENT_SECRET'),
      };
      expect(spyHttpPost).toBeCalledWith(mockUrl, jsonCreditCard, { headers });
      jest.clearAllMocks();
    });
  });
  describe('saveCardToFirestore method', () => {
    it('should be defined saveCardToFirestore', () => {
      expect(service.saveCardToFirestore).toBeDefined();
    });
    it('should be kickout if no cardSeqentialId', async () => {
      const cardSeq = '';
      await service.saveCardToFirestore(
        cardSeq,
        mockBrand,
        mockClaims.encryptedMemberId,
        mockOperatorName,
      );
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(0);
      jest.clearAllMocks();
    });
    it('should be saveCardToFirestore success', async () => {
      const cardSeq = '123';
      await service.saveCardToFirestore(
        cardSeq,
        mockBrand,
        mockClaims.encryptedMemberId,
        mockOperatorName,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
    it('should be throw error for saveCardToFirestore', async () => {
      const cardSeq = '1234';
      jest
        .spyOn(mockFirestoreBatchService, 'batchSet')
        .mockRejectedValue(() => {
          throwError(() => new AxiosError('Internal server error', '500'));
        });
      await service.saveCardToFirestore(
        cardSeq,
        mockBrand,
        mockClaims.encryptedMemberId,
        mockOperatorName,
      );
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalled();
      jest.clearAllMocks();
    });
  });
});
