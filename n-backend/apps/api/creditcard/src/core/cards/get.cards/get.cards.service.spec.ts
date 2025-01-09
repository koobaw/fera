import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { Claims } from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { HttpException } from '@nestjs/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { GetCardsService } from './get.cards.service';
import { Card, CardResult } from '../interface/creditcards.response';
import { GlobalsModule } from '../../../globals.module';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { CreditUtilService } from '../../../utils/credit-util.service';

const dummyServerError = {
  errCode: ErrorCode.MULE_API_SERVER_ERROR as string,
  errMessage: ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR] as any,
  status: 500,
};
const dummyDeleteCard = { id: 1 };
const operatorName = 'sys-user-api';
const CreditUtilServiceStub = {
  getDecryptedMemberId: jest.fn(),
  getMuleUrls: jest.fn(),
  handleException: jest.fn().mockReturnValue(dummyServerError),
};
const mockFirestoreBatchService = {
  findCollection: jest.fn(() => ({
    doc: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(() => ({
            exists: true,
          })),
        })),
        listDocuments: jest.fn().mockReturnValue([dummyDeleteCard]),
      })),
    })),
  })),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};
const mockFindCollection = {
  doc: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          exists: false,
          ref: jest.fn(() => ({
            path: 'demo/path',
          })),
        })),
      })),
      listDocuments: jest.fn().mockReturnValue([dummyDeleteCard]),
    })),
  })),
};
const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};
const mockLoggingService = {
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};
describe('CardsService', () => {
  let service: GetCardsService;
  let creditUtilService: CreditUtilService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        GetCardsService,
        {
          provide: CreditUtilService,
          useValue: CreditUtilServiceStub,
        },
        {
          provide: LoggingService,
          useFactory: () => mockLoggingService,
        },
        {
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
      ],
    }).compile();

    service = module.get<GetCardsService>(GetCardsService);
    mockedHttpService = jest.mocked<HttpService>(
      module.get<HttpService>(HttpService),
    );
    creditUtilService = module.get<CreditUtilService>(CreditUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be defined method', () => {
    expect(service.getCreditCards).toBeDefined();
  });
  it('should be return credit cards', async () => {
    const dummyCreditCards = [
      {
        cardSequentialNumber: '001',
        isSelected: true,
        cardNumber: '12345',
        expirationDate: '03/26',
        isDeleted: false,
      },
    ] as Card[];
    const claim = {
      encryptedMemberId:
        '6abce34d9ead469eb5eb617d5229eaaabbeb4b6a69114e32e79a4208a90abcb405',
    } as Claims;

    const mockMemberId = new Promise<string>((resolve) => {
      resolve('01234567');
    });
    const mockMuleUrl = new Promise<string>((resolve) => {
      resolve('http://testmule.com');
    });
    jest
      .spyOn(creditUtilService, 'getDecryptedMemberId')
      .mockReturnValue(mockMemberId);
    jest.spyOn(creditUtilService, 'getMuleUrls').mockReturnValue(mockMuleUrl);
    jest
      .spyOn(mockedHttpService, 'get')
      .mockReturnValue(of({ data: dummyCreditCards }));
    const res = await service.getCreditCards(claim, operatorName);
    expect(res.data.cards.length).toEqual(dummyCreditCards.length);
    jest.clearAllMocks();
  });
  it('should be return internal mule server error #1', async () => {
    const claim = {
      encryptedMemberId:
        '6abce34d9ead469eb5eb617d5229eaaabbeb4b6a69114e32e79a4208a90abcb405',
    } as Claims;
    const mockMemberId = new Promise<string>((resolve) => {
      resolve('01234567');
    });
    const mockMuleUrl = new Promise<string>((resolve) => {
      resolve('http://testmule.com');
    });
    jest
      .spyOn(creditUtilService, 'getDecryptedMemberId')
      .mockReturnValue(mockMemberId);
    jest.spyOn(creditUtilService, 'getMuleUrls').mockReturnValue(mockMuleUrl);
    jest
      .spyOn(mockedHttpService, 'get')
      .mockImplementationOnce(() =>
        throwError(() => new AxiosError('Internal mule server error', '500')),
      );
    await expect(service.getCreditCards(claim, operatorName)).rejects.toThrow(
      HttpException,
    );
    await expect(service.getCreditCards(claim, operatorName)).rejects.toThrow(
      ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR],
    );
    jest.clearAllMocks();
  });
  describe('saveCardsToFirestore', () => {
    it('should be saveCardsToFirestore define', async () => {
      expect(service.updateCardsToFirestore).toBeDefined();
    });
    it('should be called saveCardsToFirestore with all values', async () => {
      const encryptedMemberId =
        '6abce34d9ead469eb5eb617d5229eaaabbeb4b6a69114e32e79a4208a90abcb405';
      const cards: Array<CardResult> = [
        {
          cardSequentialNumber: '1',
          isPrimary: true,
          maskedCardNumber: '000000001245',
          expirationDate: '03/04',
          isDeleted: false,
        },
        {
          cardSequentialNumber: '2',
          isPrimary: true,
          maskedCardNumber: '000000001246',
          expirationDate: '03/05',
          isDeleted: false,
        },
      ];
      await service.updateCardsToFirestore(
        cards,
        'operatorName',
        encryptedMemberId,
      );
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalled();
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(2);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    it('should be called saveCardsToFirestore with null encryptedMemberId', async () => {
      const encryptedMemberId = null;
      const cards: Array<CardResult> = [];
      await service.updateCardsToFirestore(
        cards,
        'operatorName',
        encryptedMemberId,
      );
      expect(mockFirestoreBatchService.findCollection).not.toHaveBeenCalled();
      jest.clearAllMocks();
    });
    it('should be throw error when saving cards', async () => {
      const encryptedMemberId =
        '6abce34d9ead469eb5eb617d5229eaaabbeb4b6a69114e32e79a4208a90abcb405';
      const cards: Array<CardResult> = [
        {
          cardSequentialNumber: '1',
          isPrimary: true,
          maskedCardNumber: '000000001245',
          expirationDate: '03/04',
          isDeleted: false,
        },
        {
          cardSequentialNumber: '2',
          isPrimary: true,
          maskedCardNumber: '000000001246',
          expirationDate: '03/05',
          isDeleted: false,
        },
      ];

      jest
        .spyOn(mockFirestoreBatchService, 'batchCommit')
        .mockRejectedValue(() => {
          throwError(() => new AxiosError('Internal server error', '500'));
        });
      await service.updateCardsToFirestore(
        cards,
        'operatorName',
        encryptedMemberId,
      );
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalled();
      jest.clearAllMocks();
    });
    it('should be warn for card is not available', async () => {
      const encryptedMemberId =
        '6abce34d9ead469eb5eb617d5229eaaabbeb4b6a69114e32e79a4208a90abcb405';
      const cards: Array<CardResult> = [
        {
          cardSequentialNumber: '1',
          isPrimary: true,
          maskedCardNumber: '000000001245',
          expirationDate: '03/04',
          isDeleted: false,
        },
      ];

      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockReturnValue(mockFindCollection);
      await service.updateCardsToFirestore(
        cards,
        'operatorName',
        encryptedMemberId,
      );
      expect(mockLoggingService.warn).toHaveBeenCalled();
    });
  });
});
