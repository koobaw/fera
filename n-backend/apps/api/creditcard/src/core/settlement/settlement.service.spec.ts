import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { FieldValue } from '@google-cloud/firestore';
import { SettlementService } from './settlement.service';
import { SettlementUtilsService } from '../../utils/settlement.utils';
import { CreditUtilService } from '../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

const mockFirestoreBatchService = {
  findCollection: jest.fn(() => ({
    doc: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(),
      })),
    })),
  })),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};
const mockMemberId = '1234567890';
const dummyServerError = {
  errCode: ErrorCode.MULE_API_SERVER_ERROR as string,
  errMessage: ErrorMessage[ErrorCode.MULE_API_SERVER_ERROR] as string,
  status: 500,
};
const mockSettlementUtils = {
  getShopcodeFromQrData: jest.fn(),
  getFirestoreDocRef: jest.fn(),
  getFirestoreSubDocRef: jest.fn(),
  getDocumentFromCollection: jest.fn(),
  getDocumentFromSubCollection: jest.fn(),
  getShopDetails: jest.fn(),
  getCeditCardDetails: jest.fn(),
  getPocketRegiCartProducts: jest.fn(),
  errorHandling: jest.fn().mockReturnValue(dummyServerError),
  muleApiRequestPayload: jest.fn(),
};
const mocksettlementDto = {
  orderId: '081320230831153447723',
  storeCode: '813',
  totalAmount: 1780,
  paymentMethod: '1',
  cardSequentialNumber: '38',
  totalPointUse: 10,
  appVer: '3.5.14',
};

const mockuserClaims = {
  userId: 'abac233',
  encryptedMemberId:
    '6fe0d9ead469eb5eb617d5119e108cbbeb4b6a69114e32e79a4208a90ccbb405',
};

const mockSettlementMuleResponse = {
  cid: '0',
  timestamp: '2023-05-24T02:00:10.000Z',
  status: 200,
  shortOrderId: '40110593',
};

const mockMuleResponse = {
  data: {
    status: 200,
    muleRequestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
    shortOrderId: '40110593',
  },
  message: 'OK',
  code: 201,
  requestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
  timestamp: '2023-05-24T02:00:10.000Z',
};

describe('SettlementService', () => {
  let settlementService: SettlementService;
  let settlementUtils: SettlementUtilsService;
  let commonService: CommonService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        SettlementService,
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
            createMd5: jest.fn(),
          }),
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
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
        {
          provide: SettlementUtilsService,
          useFactory: () => mockSettlementUtils,
        },
        {
          provide: CreditUtilService,
          useFactory: () => ({
            getDecryptedMemberId: jest.fn().mockResolvedValue(mockMemberId),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
      ],
    }).compile();

    settlementService = module.get<SettlementService>(SettlementService);

    settlementUtils = module.get<SettlementUtilsService>(
      SettlementUtilsService,
    );
    commonService = module.get<CommonService>(CommonService);
    mockedHttpService = jest.mocked<HttpService>(
      module.get<HttpService>(HttpService),
    );
  });

  it('should be defined', () => {
    expect(settlementService).toBeDefined();
    expect(settlementService.creditMuleOrder).toBeDefined();
    expect(settlementService.callMuleApiForSettlement).toBeDefined();
    expect(settlementService.saveOrderDataToFireStore).toBeDefined();
  });

  describe('creditMuleOrder main function', () => {
    it('should create creditMuleOrder', async () => {
      const mockCartProducts = {
        data: {
          products: [
            {
              salesType: 'storePrice',
              productId: '4936695872499',
              unitPrice: 120,
              quantity: 4,
              subtotalAmount: 480,
              productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
              imageUrls: [
                'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
              ],
              taxRate: 10,
            },
          ],
        },
        status: 200,
      };
      const mockOperatorName = 'mockOperator';

      jest
        .spyOn(settlementUtils, 'getPocketRegiCartProducts')
        .mockResolvedValue(mockCartProducts);
      jest
        .spyOn(settlementService, 'callMuleApiForSettlement')
        .mockResolvedValue(mockMuleResponse);
      const res = settlementService.creditMuleOrder(
        mocksettlementDto,
        mockuserClaims,
        mockOperatorName,
      );
      await expect(res).resolves.toBe(mockMuleResponse);
    });
    it('should return creditMuleOrder error #1', async () => {
      const mockCartProducts = {
        errorCode: ErrorCode.CART_PRODUCTS_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      };
      const mockOperatorName = 'mockOperator';

      jest
        .spyOn(settlementUtils, 'getPocketRegiCartProducts')
        .mockResolvedValue(mockCartProducts);

      const res = settlementService.creditMuleOrder(
        mocksettlementDto,
        mockuserClaims,
        mockOperatorName,
      );
      await expect(res).rejects.toThrow(HttpException);
      await expect(res).rejects.toThrow(
        ErrorMessage[ErrorCode.CART_PRODUCTS_NOT_FOUND],
      );
    });

    it('should return creditMuleOrder error #2', async () => {
      const mockCartProducts = {
        data: {
          products: [],
        },
        status: 200,
      };
      const mockOperatorName = 'mockOperator';

      jest
        .spyOn(settlementUtils, 'getPocketRegiCartProducts')
        .mockResolvedValue(mockCartProducts);

      const res = settlementService.creditMuleOrder(
        mocksettlementDto,
        mockuserClaims,
        mockOperatorName,
      );
      await expect(res).rejects.toThrow(HttpException);
      await expect(res).rejects.toThrow(
        ErrorMessage[ErrorCode.CART_PRODUCTS_NOT_FOUND],
      );
    });
  });
  describe('saveOrderDataToFireStore', () => {
    it('should save data to firestore', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      const mockOperatorName = 'mockOperator';

      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');
      jest
        .spyOn(settlementUtils, 'getShopDetails')
        .mockResolvedValue({ status: 200, data: { name: 'abcd' } });
      jest.spyOn(settlementUtils, 'getCeditCardDetails').mockResolvedValue({
        status: 200,
        data: {
          expirationDate: '23/02',
          maskedCardNumber: '3243',
          brand: 'visa',
          isPrimary: false,
          createdBy: mockOperatorName,
          createdAt: FieldValue.serverTimestamp(),
          updatedBy: mockOperatorName,
          updatedAt: FieldValue.serverTimestamp(),
        },
      });
      const memberId = '1234567890';
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];

      await settlementService.saveOrderDataToFireStore(
        mockOperatorName,
        mockuserClaims.encryptedMemberId,
        memberId,
        mockPayload.entry.orderId,
        mockPayload,
        mockProducts,
        '1234',
        '',
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should throw error #1', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      const mockOperatorName = 'mockOperator';

      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');
      jest.spyOn(settlementUtils, 'getShopDetails').mockRejectedValueOnce({
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });
      jest.spyOn(settlementUtils, 'getCeditCardDetails').mockResolvedValue({
        status: 200,
        data: {
          expirationDate: '23/02',
          maskedCardNumber: '3243',
          brand: 'visa',
          isPrimary: false,
          createdBy: mockOperatorName,
          createdAt: FieldValue.serverTimestamp(),
          updatedBy: mockOperatorName,
          updatedAt: FieldValue.serverTimestamp(),
        },
      });
      const memberId = '1234567890';
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];
      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
        ),
      ).rejects.toThrow(HttpException);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should throw error #2', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      const mockOperatorName = 'mockOperator';

      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');
      jest.spyOn(settlementUtils, 'getShopDetails').mockResolvedValueOnce({
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });
      jest.spyOn(settlementUtils, 'getCeditCardDetails').mockResolvedValue({
        status: 200,
        data: {
          expirationDate: '23/02',
          maskedCardNumber: '3243',
          brand: 'visa',
          isPrimary: false,
          createdBy: mockOperatorName,
          createdAt: FieldValue.serverTimestamp(),
          updatedBy: mockOperatorName,
          updatedAt: FieldValue.serverTimestamp(),
        },
      });
      const memberId = '1234567890';
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];
      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
          '1234',
          '',
        ),
      ).rejects.toThrow(HttpException);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should throw error #3', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });

      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');
      jest
        .spyOn(settlementUtils, 'getShopDetails')
        .mockResolvedValue({ status: 200, data: { name: 'abcd' } });
      jest.spyOn(settlementUtils, 'getCeditCardDetails').mockResolvedValueOnce({
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });
      const mockOperatorName = 'mockOperator';
      const memberId = '1234567890';
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];
      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
          '1234',
          '',
        ),
      ).rejects.toThrow(HttpException);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
  describe('callMuleApiForSettlement', () => {
    it('should return callMuleApiForSettlement', async () => {
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];
      const mockOperatorName = 'mockOperator';
      jest
        .spyOn(settlementUtils, 'muleApiRequestPayload')
        .mockReturnValue(mockPayload);
      jest
        .spyOn(mockedHttpService, 'post')
        .mockReturnValue(of({ data: mockSettlementMuleResponse }));
      await expect(
        settlementService
          .callMuleApiForSettlement(
            mockuserClaims,
            mocksettlementDto,
            mockProducts,
            mockOperatorName,
          )
          .then((z) => z.message),
      ).resolves.toBe('OK');
    });
    it('should throw callMuleApiForSettlement error #1', async () => {
      const mockPayload = {
        entry: { orderId: '12345', storeCode: '3456' },
      };
      const mockProducts = [
        {
          salesType: 'storePrice',
          productId: '4936695872499',
          unitPrice: 120,
          quantity: 4,
          subtotalAmount: 480,
          productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
          imageUrls: [
            'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
          ],
          taxRate: 10,
        },
      ];
      const mockOperatorName = 'mockOperator';
      jest
        .spyOn(settlementUtils, 'muleApiRequestPayload')
        .mockReturnValue(mockPayload);
      jest.spyOn(settlementService, 'saveOrderDataToFireStore');
      jest
        .spyOn(mockedHttpService, 'post')
        .mockImplementationOnce(() =>
          throwError(() => new AxiosError('Internal mule server error', '500')),
        );
      await expect(
        settlementService.callMuleApiForSettlement(
          mockuserClaims,
          mocksettlementDto,
          mockProducts,
          mockOperatorName,
        ),
      ).rejects.toThrow(HttpException);
    });
  });
});
