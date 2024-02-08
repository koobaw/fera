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
import { Store } from '@cainz-next-gen/types';
import { SettlementService } from './settlement.service';
import { SettlementUtilsService } from '../../utils/settlement.utils';
import { CreditUtilService } from '../../utils/credit-util.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { OrderedProduct, SaveProduct } from './interface/settlement.interface';
import { SettlementDto } from './dto/settlement.dto';

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
  setPurchaseLog: jest.fn(),
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

const mockProductDetail = {
  data: [
    {
      productId: '4547894154991',
      departmentCode: '001',
    },
  ],
  message: 'OK',
  code: 201,
  requestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
  timestamp: '2023-05-24T02:00:10.000Z',
};
const mockProducts = [
  {
    code128DiscountDetails: [], // Array of discount stickers
    isAlcoholic: false,
    productId: '4936695872499',
    price: 480,
    quantity: 4,
    productName: '◆消臭昆虫ゼリーフルーツ１００Ｐ',
    imageUrls: [
      'https://imgix.cainz.com/4936695872499/product/4936695872499_01.jpg',
    ],
    taxRate: 10,
  },
] as SaveProduct[];
const mockPayload = {
  entry: {
    orderId: '12345',
    storeCode: '3456',
    cainzCardNumber: '144343',
    isReturned: false,
    returnedDate: null,
    totalAmount: 100,
    subtotalPriceByStandardTaxRate: 0,
    subtotalConsumptionTaxByStandardRate: 0,
    subtotalPriceByReducedTaxRate: 0,
    subtotalConsumptionTaxByReducedRate: 0,
    subtotalPriceByTaxExempt: 0,
    totalGrantedPoints: 0,
    totalPointUse: 0,
    totalProductQuantity: 0,
    paymentMethod: '',
    numberOfPayments: 1,
    cardSequentialNumber: '',
    cardPassword: '',
    clientField1: 'pocketregi=0003',
    clientField2: `app=ShopApp,ver=0`,
    clientField3: '',
    taxAndShippingCost: 0,
    items: [],
  },
};

const shopDetail = { code: '004', name: 'store1' } as Store;
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
            createHttpException: jest.fn(),
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
      jest.spyOn(settlementService, 'deleteCollection').mockImplementation();
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
      await settlementService.saveOrderDataToFireStore(
        mockOperatorName,
        mockuserClaims.encryptedMemberId,
        memberId,
        mockPayload.entry.orderId,
        mockPayload,
        mockProducts,
        shopDetail,
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
      jest
        .spyOn(mockFirestoreBatchService, 'batchCommit')
        .mockRejectedValueOnce({
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

      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
          shopDetail,
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
      jest
        .spyOn(mockFirestoreBatchService, 'batchCommit')
        .mockRejectedValueOnce({
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

      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
          shopDetail,
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

      jest.spyOn(settlementUtils, 'getCeditCardDetails').mockResolvedValueOnce({
        errorCode: ErrorCode.MULE_API_RESOURCE_NOT_FOUND,
        status: HttpStatus.NOT_FOUND,
      });
      const mockOperatorName = 'mockOperator';
      const memberId = '1234567890';
      await expect(
        settlementService.saveOrderDataToFireStore(
          mockOperatorName,
          mockuserClaims.encryptedMemberId,
          memberId,
          mockPayload.entry.orderId,
          mockPayload,
          mockProducts,
          shopDetail,
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
      const mockOperatorName = 'mockOperator';
      const mockOrderedProduct = [
        {
          code128DiscountDetails: null,
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154990',
          productName: 'test for log',
          price: 100,
          taxRate: 0,
          quantity: 1,
          departmentCode: '001',
        },
      ] as OrderedProduct[];

      jest
        .spyOn(settlementUtils, 'muleApiRequestPayload')
        .mockReturnValue(mockPayload);
      jest
        .spyOn(settlementService, 'getOrderedProducts')
        .mockResolvedValue(mockOrderedProduct);
      jest
        .spyOn(settlementUtils, 'getShopDetails')
        .mockResolvedValue(shopDetail);
      jest.spyOn(settlementUtils, 'setPurchaseLog');
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
            'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQxNjg5NDE1ZWMyM2EzMzdlMmJiYW',
          )
          .then((z) => z.message),
      ).resolves.toBe('OK');
    });
    it('should throw callMuleApiForSettlement error #1', async () => {
      const mockOperatorName = 'mockOperator';
      const mockOrderedProduct = [
        {
          code128DiscountDetails: null,
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154990',
          productName: 'test for log',
          price: 100,
          taxRate: 0,
          quantity: 1,
          departmentCode: '001',
        },
      ] as OrderedProduct[];
      jest
        .spyOn(settlementUtils, 'muleApiRequestPayload')
        .mockReturnValue(mockPayload);
      jest
        .spyOn(settlementService, 'getOrderedProducts')
        .mockResolvedValue(mockOrderedProduct);
      jest
        .spyOn(settlementUtils, 'getShopDetails')
        .mockResolvedValue(shopDetail);
      jest.spyOn(settlementUtils, 'setPurchaseLog');
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
          'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQxNjg5NDE1ZWMyM2EzMzdlMmJiYW',
        ),
      ).rejects.toThrow(HttpException);
    });
  });
  describe('getOrderedProducts', () => {
    it('should return Ordered Products', async () => {
      const mockRowProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '41424344454647',
          productName: 'product1',
          subtotalAmount: 100,
          quantity: 1,
          taxRate: 0,
        },
        {
          setItemCode: '6492',
          subItems: [
            {
              code128DiscountDetails: null, // Array of discount stickers
              imageUrls: [],
              isAlcoholic: false,
              productId: '41424344454648',
              productName: 'product2',
              salePrice: 200,
              quantity: 1,
              taxRate: 0,
            },
          ],
          subtotalAmount: 200,
        },
      ];
      const resolvesPrdocts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '41424344454647',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
          departmentCode: '001',
        },
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '41424344454648',
          productName: 'product2',
          price: 200,
          quantity: 1,
          taxRate: 0,
          departmentCode: '002',
        },
      ] as OrderedProduct[];
      jest
        .spyOn(settlementService, 'getProductsWithBumon')
        .mockResolvedValue(resolvesPrdocts);
      await expect(
        settlementService.getOrderedProducts(
          mockRowProducts,
          'yJhbGciOiJSUzI1',
        ),
      ).resolves.toBe(resolvesPrdocts);
      jest.restoreAllMocks();
    });
    it('should return empty Products', async () => {
      const mockRowProducts = [];
      await expect(
        settlementService.getOrderedProducts(
          mockRowProducts,
          'yJhbGciOiJSeeI1',
        ),
      ).resolves.toStrictEqual(mockRowProducts);
    });
    it('should return only subTotalAmount or salesPrice Products', async () => {
      const mockRowProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '41424344454647',
          productName: 'product1',
          quantity: 1,
          taxRate: 0,
        },
      ];
      const resultMock = [] as OrderedProduct[];
      jest
        .spyOn(settlementService, 'getProductsWithBumon')
        .mockResolvedValue(resultMock);
      await expect(
        settlementService.getOrderedProducts(
          mockRowProducts,
          'yJhbGciOiJSeeI1',
        ),
      ).resolves.toStrictEqual(resultMock);
    });
  });
  describe('getProductsWithBumon', () => {
    it('should return empty Products', async () => {
      const mockOrderProducts = [] as OrderedProduct[];

      const mockResult = [] as OrderedProduct[];
      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockProductDetail }));
      await expect(
        settlementService.getProductsWithBumon(
          mockOrderProducts,
          'yJhbGciOiJSeeI1',
        ),
      ).resolves.toStrictEqual(mockResult);
    });
    it('should return Products with department code', async () => {
      const mockOrderProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154991',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
        },
      ] as OrderedProduct[];

      const mockResult = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154991',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
          departmentCode: '001',
        },
      ] as OrderedProduct[];
      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockProductDetail }));
      await expect(
        settlementService.getProductsWithBumon(
          mockOrderProducts,
          'yJhbGciOiJSeeI1',
        ),
      ).resolves.toStrictEqual(mockResult);
    });
    it('should return http exception #1', async () => {
      const mockOrderProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154991',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
        },
      ] as OrderedProduct[];

      jest
        .spyOn(mockedHttpService, 'get')
        .mockImplementationOnce(() =>
          throwError(() => new AxiosError('Internal mule server error', '500')),
        );
      try {
        await settlementService.getProductsWithBumon(
          mockOrderProducts,
          'yJhbGciOiJSeeI1',
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(commonService.logException).toHaveBeenCalled();
        expect(commonService.createHttpException).toHaveBeenCalled();
      }
    });
    it('should return http exception #2', async () => {
      const mockOrderProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154991',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
        },
      ] as OrderedProduct[];

      jest.spyOn(mockedHttpService, 'get').mockReturnValue(of({ data: null }));
      try {
        await settlementService.getProductsWithBumon(
          mockOrderProducts,
          'yJhbGciOiJSeeI1',
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(commonService.logException).toHaveBeenCalled();
        expect(commonService.createHttpException).toHaveBeenCalled();
      }
    });
    it('should return same products if product detail data not available', async () => {
      const mockOrderProducts = [
        {
          code128DiscountDetails: null, // Array of discount stickers
          imageUrls: [],
          isAlcoholic: false,
          productId: '4547894154991',
          productName: 'product1',
          price: 100,
          quantity: 1,
          taxRate: 0,
        },
      ] as OrderedProduct[];

      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: { data: [] } }));
      await expect(
        settlementService.getProductsWithBumon(
          mockOrderProducts,
          'yJhbGciOiJSeeI1',
        ),
      ).resolves.toStrictEqual(mockOrderProducts);
    });
  });
  describe('logPurchaseEvent', () => {
    it('no return logPurchaseEvent', async () => {
      const mockRowProducts = [];
      const payload = [];
      const request = {} as SettlementDto;
      await expect(
        settlementService.logPurchaseEvent(
          '',
          payload,
          mockRowProducts,
          request,
          shopDetail,
        ),
      );
    });
  });
  describe('Call delete collection method', () => {
    it('should delete the pocketRegiProducts collection', async () => {
      const encryptedMemberId = 'VALID_MEMBER_ID';
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(),
          })),
        })),
      });
      await settlementService.deleteCollection(encryptedMemberId);
      expect(mockFirestoreBatchService.findCollection).toBeCalled();
      expect(mockFirestoreBatchService.batchDelete).toBeCalled();
    });
    it('should throw error if deleting collection fails', async () => {
      const encryptedMemberId = 'VALID_MEMBER_ID';
      mockFirestoreBatchService.batchDelete.mockRejectedValue(
        new Error('Error Occured'),
      );
      await settlementService.deleteCollection(encryptedMemberId);

      expect(commonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.FAILED_TO_DELETE_COLLECTION,
        ErrorMessage[ErrorCode.FAILED_TO_DELETE_COLLECTION],
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(commonService.logException).toBeCalled();
    });
  });
});
