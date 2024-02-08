import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { HttpStatus } from '@nestjs/common';
import { ReturnService } from './return.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};

const mockLoggingService = {
  info: jest.fn(),
  warn: jest.fn(),
};

const mockFirestoreBatchService = {
  findCollectionGroup: jest.fn(),
  set: jest.fn(),
};

describe('PocketRegiReturnService', () => {
  let service: ReturnService;
  let mockOrderDetail;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnService,
        {
          provide: FirestoreBatchService,
          useValue: mockFirestoreBatchService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<ReturnService>(ReturnService);
    mockOrderDetail = {
      createdAt: '2023-07-2T00:00:00Z',
      createdBy: 'sys-user-api',
      orderId: '085920230825195117172',
      orderIdForCustomer: '72402177',
      paymentErrorCode: null,
      paymentMethod: 'CreditPay',
      totalGrantedPoints: 20,
      products: {
        code128DiscountDetails: [
          {
            discountMethod: 3,
            discount: 50,
            appliedCount: 1,
          },
          {
            discountMethod: 2,
            discount: 30,
            appliedCount: 1,
          },
        ],
        isAlcoholic: false,
        productId: '4549509858928',
        productName: '◆座布団にもなる背もたれイスＦーＬｅｐｏｃｏＧＹ',
        price: 4482,
        quantity: 3,
        taxRate: 10,
      },
      storeCode: 859,
      storeName: '朝霞店',
      subtotalConsumptionTaxByStandardRate: 407,
      subtotalPriceByStandardTaxRate: 4482,
      totalPointUse: 0,
      totalQuantity: 3,
      totalAmount: 4482,
      updatedAt: '2023-07-02T00:00:00Z',
      updatedBy: 'sys-user-api',
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be defined the methods', () => {
    expect(service.fetchAndSetReturnDate).toBeDefined();
    expect(service.fetchFirestoreData).toBeDefined();
  });
  describe('should save the the return to firestore', () => {
    it('should call the fetchAndSaveReturnDate', async () => {
      const returnReq = {
        orderId: '085920230615140830537',
      };
      const expectedResult = {
        message: 'OK',
        code: HttpStatus.CREATED,
      };
      const mockOrderData = [
        {
          ref: {
            set: jest.fn(),
          },
        },
      ];
      jest
        .spyOn(service, 'fetchFirestoreData')
        .mockResolvedValue(mockOrderDetail);
      mockFirestoreBatchService.findCollectionGroup.mockResolvedValue(
        mockOrderData,
      );
      const result = await service.fetchAndSetReturnDate(returnReq);
      expect(result).toEqual(expectedResult);
    });
    it('should handle the Set return date failed exception', async () => {
      const mockExpectedError = {
        errorCode: ErrorCode.SET_RETURN_DATE_FAILED,
        message: ErrorMessage[ErrorCode.SET_RETURN_DATE_FAILED],
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      };
      const returnReq = {
        orderId: '085920230615140830537',
      };

      await service.fetchAndSetReturnDate(returnReq);
      Object.defineProperty(service, 'handleException', {
        value: jest.fn(() => mockExpectedError),
      });
      jest
        .spyOn(service, <never>'handleException')
        .mockReturnValue(mockExpectedError as never);
      mockCommonService.createHttpException.mockImplementation();
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalled();
    });
    it('should fetch data from Firestore', async () => {
      const orderId = '085920230615140830537';
      const querySnapshotMock = {
        empty: false,
        docs: [mockOrderDetail],
      };
      jest
        .spyOn(mockFirestoreBatchService, 'findCollectionGroup')
        .mockImplementation(() => ({
          where: () => ({
            get: () => ({
              querySnapshotMock,
            }),
          }),
        }));
      await service.fetchFirestoreData(orderId);
      expect(mockFirestoreBatchService.findCollectionGroup).toHaveBeenCalled();
    });
    it('should throw non existing order Id data from Firestore', async () => {
      const orderId = '085920230615140830537';
      const querySnapshotMock = {
        empty: true,
        docs: [],
      };
      jest
        .spyOn(mockFirestoreBatchService, 'findCollectionGroup')
        .mockImplementation(() => ({
          where: () => ({
            get: () => querySnapshotMock,
          }),
        }));

      await service.fetchFirestoreData(orderId);
      mockCommonService.createHttpException.mockImplementation();
      mockCommonService.logException.mockImplementation();

      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.ORDER_ID_NOT_FOUND,
        ErrorMessage[ErrorCode.ORDER_ID_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    });
    it('should throw when fetching order data fails', async () => {
      const orderId = '085920230615140830537';
      const querySnapshotMock = {};
      mockFirestoreBatchService.findCollectionGroup.mockImplementation(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            querySnapshotMock,
          })),
        })),
      }));
      mockFirestoreBatchService.findCollectionGroup.mockResolvedValue({
        empty: true,
      } as never);
      await service.fetchFirestoreData(orderId);
      mockCommonService.createHttpException.mockImplementation();
      mockCommonService.logException.mockImplementation();
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.FETCH_ORDER_DOCUMENT_FAIL,
        ErrorMessage[ErrorCode.FETCH_ORDER_DOCUMENT_FAIL],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
    it('should handle exception', async () => {
      const mockError = {
        response: {
          errorCode: ErrorCode.SET_RETURN_DATE_FAILED,
          message: ErrorMessage[ErrorCode.SET_RETURN_DATE_FAILED],
        },
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
      const result = (service as any).handleException(mockError);
      expect(result.errCode).toBe(mockError.response.errorCode);
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
