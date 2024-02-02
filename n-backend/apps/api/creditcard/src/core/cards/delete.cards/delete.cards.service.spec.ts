import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { Claims } from '@cainz-next-gen/types';
import { AxiosError } from 'axios';
import { DeleteCardService } from './delete.cards.service';
import {
  DeleteCard,
  DeleteCardRequest,
} from '../interface/creditcards.response';
import { CreditUtilService } from '../../../utils/credit-util.service';

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
const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};
describe('CreditcardService', () => {
  let service: DeleteCardService;
  let creditUtilsService: CreditUtilService;
  let mockedEnv: jest.MockedObjectDeep<ConfigService>;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  let fireStoreService: FirestoreBatchService;
  const mockClaims = {
    encryptedMemberId: 'NY8RNVDsEaNQLkRtH1LvvASZjVKJm4mn79K8',
  } as Claims;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        DeleteCardService,
        ConfigService,
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

    service = module.get<DeleteCardService>(DeleteCardService);
    creditUtilsService = module.get<CreditUtilService>(CreditUtilService);
    fireStoreService = module.get<FirestoreBatchService>(FirestoreBatchService);
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
    const configService = module.get<ConfigService>(ConfigService);
    mockedEnv = jest.mocked<ConfigService>(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.deleteCreditCard).toBeDefined();
  });

  describe('delete credit card', () => {
    const deleteCreditCardReq: DeleteCardRequest = {
      userClaims: mockClaims,
      cardSequentialNumber: '2',
    };
    const deleteCreditCard: DeleteCard = {
      memberId: '2710000018308',
      cardSequentialNumber: '2',
    };
    it('should delete credit card by calling mule api', async () => {
      const mockData = { message: 'OK', code: HttpStatus.OK };
      jest
        .spyOn(mockedHttpService, 'delete')
        .mockReturnValue(of({ data: mockData }));
      expect(deleteCreditCard.cardSequentialNumber).toBeTruthy();
      await expect(
        service.deleteCreditCard(deleteCreditCardReq),
      ).resolves.toEqual(mockData);
      jest.clearAllMocks();
    });

    it('should handle the  errors', async () => {
      const mockErrorRes = {
        errCode: 'APIError.7002',
        errMessage: 'Bad Request',
        status: 400,
      };
      jest
        .spyOn(creditUtilsService, 'handleException')
        .mockImplementationOnce(() => mockErrorRes);
      await expect(
        service.deleteCreditCard(deleteCreditCardReq),
      ).rejects.toThrow();
      jest.clearAllMocks();
    });

    it('should require {url, headers}', async () => {
      const jsonDeleteCreditCard = JSON.stringify(deleteCreditCard);
      const mockData = { message: 'OK', code: HttpStatus.OK };
      const spyHttpDelete = jest
        .spyOn(mockedHttpService, 'delete')
        .mockReturnValue(of({ data: mockData }));

      const mockUrl = 'mockedUrl';
      jest
        .spyOn(creditUtilsService, 'getMuleUrls')
        .mockResolvedValueOnce(mockUrl);
      jest
        .spyOn(creditUtilsService, 'getDecryptedMemberId')
        .mockResolvedValue(deleteCreditCard.memberId);

      await service.deleteCreditCard(deleteCreditCardReq);
      const headers = {
        'Content-type': 'application/json; charset=UTF-8',
        client_id: mockedEnv.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
        client_secret: mockedEnv.get<string>('MULE_POCKET_REGI_CLIENT_SECRET'),
      };
      expect(spyHttpDelete).toBeCalledWith(mockUrl, {
        headers,
        data: jsonDeleteCreditCard,
      });
      jest.clearAllMocks();
    });
  });
  describe('deleteCardFromFireStore method', () => {
    it('should be defined deleteCardFromFireStore', () => {
      expect(service.deleteCardFromFireStore).toBeDefined();
    });
    it('should be kickout if no cardSeqentialId', async () => {
      const cardSeq = '';
      await service.deleteCardFromFireStore(
        mockClaims.encryptedMemberId,
        cardSeq,
      );
      expect(fireStoreService.batchDelete).toHaveBeenCalledTimes(0);
    });
    it('should be throw error for deleteCardFromFireStore', async () => {
      const cardSeq = '1234';
      jest
        .spyOn(mockFirestoreBatchService, 'batchDelete')
        .mockRejectedValue(() => {
          throwError(() => new AxiosError('Internal server error', '500'));
        });
      await service.deleteCardFromFireStore(
        mockClaims.encryptedMemberId,
        cardSeq,
      );
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalled();
      jest.clearAllMocks();
    });
  });
});
