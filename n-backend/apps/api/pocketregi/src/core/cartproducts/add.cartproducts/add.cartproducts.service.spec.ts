import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { AddProductDetailService } from './add.cartproducts.service';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

const mockPocketregiUtils = {
  getPocketRegiProductFromFirestore: jest.fn(),
  handleException: jest.fn(),
};
const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};
const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchCommit: jest.fn(),
};
const mockCart = [
  {
    isAlcoholic: false,
    priceIncludingTax: 6,
    productId: '45478991',
    productName: 'Test Product',
    quantity: 2,
    code128DiscountDetails: null,
  },
  {
    setItemCode: '6492',
    subItems: [
      {
        isAlcoholic: false,
        priceIncludingTax: 6,
        productId: '49978993',
        productName: 'Test sub item prod',
        quantity: 2,
        code128DiscountDetails: null,
      },
    ],
  },
];
const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
const bearerToken =
  'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNWM1ZTlmNTdjOWI2NDYzYzg1ODQ1YTA4OTlhOWQ0MTI5MmM4YzMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUY4X09qZ3NtdjVHWWhGVlBoZVVRbmx5d05YcVR0Ykd1V1R3eVNmVld1NEU3Y1NETmxNdFkxbEhXZmxtTm0xb3hCQ2JaVm4uNFpaazhRYWdvRFl0bFZ1QkhUcUMiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbFcuakxVY2FLeDNEX3FhS3ZZaG9OWHNLcHRoRkpsVHFxTmZJbHUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkFTWmpWS0ptNG1uNzlLOCtRTUszUVU9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTk4NzY2MiwidXNlcl9pZCI6IjFPdFFYemNabWZoOWV5SklxYUdEMk9jajdwSjIiLCJzdWIiOiIxT3RRWHpjWm1maDlleUpJcWFHRDJPY2o3cEoyIiwiaWF0IjoxNjk1OTg3NzA3LCJleHAiOjE2OTU5OTEzMDcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.vyd1vOQAjxhYP8AMUio1rQkbRCT_yZWNJ-odH5ouDiHlVfCeGx2TkVp6gT1wo71b5KyV9KlN8Q2OTEaEUOGsDyNUADBPEJlcKXiFLc_IG0d_mVCC7hPBrea1-RUlO0fyhqOXjL4yw1z8pVO4d222AFilhG985mS4qZA0y97SHKU_jx437w2n6Bs1nrQ_3znubqn9yt25rVUFbKuBnxBz_AGkbTnpYrPiZzycQsQ5MApQ81vAAXArNPkU3DdDV_QxadVyVrhRxajLOIkkE5ew_0ocXzrb3R1x-TRWsu9zA_aUfwGZebdCZAPiAVc9M7a2UtMZVKQ4Yy0rrbp9kAT4AQ';
// GetProductDetailService test cases
describe('GetProductDetailService', () => {
  let service: AddProductDetailService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  let pocketRegiCartUtils: PocketRegiCartCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProductDetailService,
        {
          provide: HttpService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(),
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
          provide: PocketRegiCartCommonService,
          useFactory: () => mockPocketregiUtils,
        },
      ],
    }).compile();

    service = module.get<AddProductDetailService>(AddProductDetailService);
    mockedHttpService = jest.mocked<HttpService>(
      module.get<HttpService>(HttpService),
    );
    pocketRegiCartUtils = module.get<PocketRegiCartCommonService>(
      PocketRegiCartCommonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.fetchProductDetails).toBeDefined();
  });

  describe('Fetch product details', () => {
    it('should successfully get product details', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
      };
      const mockPriceDetails = {
        data: [
          {
            priceIncludingTax: 698,
          },
        ],
      };
      const mockProductDetailsResp = {
        data: [
          {
            productId: '45478954991',
            name: 'Test',
            departmentCode: '074',
            consumptionTaxRate: 1,
            imageUrls: ['test 1', 'test 2'],
          },
        ],
      };
      const mockSaveProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '45478954991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 1,
        code128DiscountDetails: [],
        subItems: [],
        mixMatchCode: null,
        setItemCode: null,
        subtotalAmount: null,
        unitPrice: null,
      };
      const mockResp = {
        data: {
          productId: '45478954991',
          productName: 'Test',
          quantity: 1,
          priceIncludingTax: 698,
          isAlcoholic: false,
          taxRate: 1,
          imageUrls: ['test 1', 'test 2'],
          code128DiscountDetails: [],
          subItems: [],
          mixMatchCode: null,
          setItemCode: null,
          subtotalAmount: null,
          unitPrice: null,
        },
        code: HttpStatus.CREATED,
        message: 'OK',
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };

      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockProductDetailsResp }));
      jest
        .spyOn(service, 'getPriceDetails')
        .mockResolvedValue(mockPriceDetails);
      const saveToFirestoreMock = jest
        .spyOn(service, 'saveProductDetailToFirestore')
        .mockResolvedValue();
      const result = await service.fetchProductDetails(
        mockGetProductDetails,
        bearerToken,
        claim,
      );
      expect(result).toEqual(mockResp);
      expect(saveToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        mockSaveProductDetails,
      );
    });
    it('should successfully get product details with code128 details', async () => {
      const mockGetProductDetails = {
        productId: '454789415499103000030',
        storeCode: '777',
      };
      const mockPriceDetails = {
        data: [
          {
            priceIncludingTax: 698,
          },
        ],
      };
      const mockProductDetailsResp = {
        data: [
          {
            productId: '45478954991',
            name: 'Test',
            departmentCode: '074',
            consumptionTaxRate: 1,
            imageUrls: ['test 1', 'test 2'],
            subItems: [],
            mixMatchCode: null,
            setItemCode: null,
            subtotalAmount: null,
            unitPrice: null,
          },
        ],
      };
      const mockSaveProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '45478954991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 1,
        code128DiscountDetails: [
          {
            discountMethod: 'percent',
            discount: 30,
            appliedCount: 1,
          },
        ],
        subItems: [],
        mixMatchCode: null,
        setItemCode: null,
        subtotalAmount: null,
        unitPrice: null,
      };
      const mockResp = {
        data: {
          productId: '45478954991',
          productName: 'Test',
          quantity: 1,
          priceIncludingTax: 698,
          isAlcoholic: false,
          taxRate: 1,
          imageUrls: ['test 1', 'test 2'],
          code128DiscountDetails: [
            {
              discountMethod: 'percent',
              discount: 30,
              appliedCount: 1,
            },
          ],
          subItems: [],
          mixMatchCode: null,
          setItemCode: null,
          subtotalAmount: null,
          unitPrice: null,
        },
        code: HttpStatus.CREATED,
        message: 'OK',
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };

      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockProductDetailsResp }));
      jest
        .spyOn(service, 'getPriceDetails')
        .mockResolvedValue(mockPriceDetails);
      const saveToFirestoreMock = jest
        .spyOn(service, 'saveProductDetailToFirestore')
        .mockResolvedValue();
      const result = await service.fetchProductDetails(
        mockGetProductDetails,
        bearerToken,
        claim,
      );
      expect(result).toEqual(mockResp);
      expect(saveToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        mockSaveProductDetails,
      );
    });
    it('should successfully get product details if sales price include tax field is not available', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
      };
      const mockPriceDetails = {
        data: [
          {
            priceIncludingTax: 698,
          },
        ],
      };
      const mockProductDetailsResp = {
        data: [
          {
            productId: '45478954991',
            name: 'Test',
            departmentCode: '074',
            consumptionTaxRate: 1,
            imageUrls: ['test 1', 'test 2'],
            subItems: [],
          },
        ],
      };
      const mockSaveProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '45478954991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 1,
        code128DiscountDetails: [],
        subItems: [],
        mixMatchCode: null,
        setItemCode: null,
        subtotalAmount: null,
        unitPrice: null,
      };
      const mockResp = {
        data: {
          productId: '45478954991',
          productName: 'Test',
          quantity: 1,
          priceIncludingTax: 698,
          isAlcoholic: false,
          taxRate: 1,
          imageUrls: ['test 1', 'test 2'],
          code128DiscountDetails: [],
          subItems: [],
          mixMatchCode: null,
          setItemCode: null,
          subtotalAmount: null,
          unitPrice: null,
        },
        code: HttpStatus.CREATED,
        message: 'OK',
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };

      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockProductDetailsResp }));
      jest
        .spyOn(service, 'getPriceDetails')
        .mockResolvedValue(mockPriceDetails);
      const saveToFirestoreMock = jest
        .spyOn(service, 'saveProductDetailToFirestore')
        .mockResolvedValue();
      const result = await service.fetchProductDetails(
        mockGetProductDetails,
        bearerToken,
        claim,
      );
      expect(result).toEqual(mockResp);
      expect(saveToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        mockSaveProductDetails,
      );
    });
    it('Throw error for get product details', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
      };
      const mockPriceDetails = {
        data: [
          {
            priceIncludingTax: 698,
          },
        ],
      };
      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };

      try {
        jest.spyOn(mockedHttpService, 'get').mockReturnValue(of(HttpException));
      } catch (error) {
        // Assert that the exception is thrown correctly
        expect(error).toBeInstanceOf(HttpException);
      }

      jest
        .spyOn(service, 'getPriceDetails')
        .mockResolvedValue(mockPriceDetails);
      try {
        await service.fetchProductDetails(
          mockGetProductDetails,
          bearerToken,
          claim,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(mockCommonService.logException).toHaveBeenCalled();
        expect(mockCommonService.createHttpException).toHaveBeenCalled();
      }
    });
    it('Should throw mule error', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
      };
      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };
      const mockErrorRes = {
        errCode: ErrorCode.MULE_API_BAD_REQUEST,
        errMessage: ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST],
        status: HttpStatus.BAD_REQUEST,
      };
      jest
        .spyOn(mockedHttpService, 'get')
        .mockImplementationOnce(() =>
          throwError(
            () =>
              new AxiosError(
                ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST],
                ErrorCode.MULE_API_BAD_REQUEST,
              ),
          ),
        );
      jest
        .spyOn(mockPocketregiUtils, 'handleException')
        .mockReturnValue(of(mockErrorRes));

      await expect(
        service.fetchProductDetails(mockGetProductDetails, bearerToken, claim),
      ).rejects.toThrow();
    });
    it('Throw error if product id empty or not string', async () => {
      const mockGetProductDetails = {
        productId: '',
        storeCode: '777',
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };

      try {
        await service.fetchProductDetails(
          mockGetProductDetails,
          bearerToken,
          claim,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(mockCommonService.logException).toHaveBeenCalled();
        expect(mockCommonService.createHttpException).toHaveBeenCalled();
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
  describe('Fetch product price details', () => {
    it('should successfully get product price details', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
        stickerDiscountCode: '',
      };
      const mockPriceDetails = {
        data: [
          {
            productId: '45478954991',
            priceIncludingTax: 698,
            storeCode: '777',
            membershipRank: '4',
          },
        ],
      };
      const userData = { rank: '4' };
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              data: jest.fn().mockReturnValue(userData),
            })),
          })),
        }));
      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockPriceDetails }));
      const result = await service.getPriceDetails(
        bearerToken,
        mockGetProductDetails,
        encryptedMemberId,
      );
      expect(result).toEqual(mockPriceDetails);
    });
    it('should throw error', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
        stickerDiscountCode: '',
      };
      jest.spyOn(mockedHttpService, 'get').mockReturnValue(of(HttpException));
      try {
        await service.getPriceDetails(
          bearerToken,
          mockGetProductDetails,
          encryptedMemberId,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
    it('Throw error mule error', async () => {
      const mockGetProductDetails = {
        productId: '45478954991',
        storeCode: '777',
        stickerDiscountCode: '',
      };

      const mockErrorRes = {
        errCode: ErrorCode.MULE_API_BAD_REQUEST,
        errMessage: ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST],
        status: HttpStatus.BAD_REQUEST,
      };
      jest
        .spyOn(mockedHttpService, 'get')
        .mockImplementationOnce(() =>
          throwError(
            () =>
              new AxiosError(
                ErrorMessage[ErrorCode.MULE_API_BAD_REQUEST],
                ErrorCode.MULE_API_BAD_REQUEST,
              ),
          ),
        );
      jest
        .spyOn(mockPocketregiUtils, 'handleException')
        .mockReturnValue(of(mockErrorRes));
      await expect(
        service.getPriceDetails(
          bearerToken,
          mockGetProductDetails,
          encryptedMemberId,
        ),
      ).rejects.toThrow();
    });
  });

  describe('saveProductDetailInFirestore', () => {
    it('should save new product to firestore', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockSaveProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '54991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 1,
        code128DiscountDetails: null,
      };

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      await service.saveProductDetailToFirestore(
        encryptedMemberId,
        mockSaveProductDetails,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should update product to firestore if already exist', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockUpdateProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '54991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 2,
        code128DiscountDetails: null,
      };
      const mockExistingCart = [
        {
          imageUrls: ['test 1', 'test 2'],
          isAlcoholic: false,
          taxRate: 1,

          productId: '54991',
          priceIncludingTax: 698,
          productName: 'Test',
          quantity: 1,
        },
      ];

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockExistingCart);

      await service.saveProductDetailToFirestore(
        encryptedMemberId,
        mockUpdateProductDetails,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(2);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should update product to firestore if already sub item exist', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockUpdateProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '54991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 2,
        code128DiscountDetails: null,
      };
      const mockExistingCart = [
        {
          imageUrls: ['test 1', 'test 2'],
          isAlcoholic: false,
          taxRate: 1,

          productId: '54993',
          priceIncludingTax: 698,
          productName: 'Test',
          quantity: 1,
        },
        {
          salesType: 'MixMatch',
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '54991',
              productName: 'Test sub item prod',
              quantity: 2,
            },
          ],
        },
      ];

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockExistingCart);

      await service.saveProductDetailToFirestore(
        encryptedMemberId,
        mockUpdateProductDetails,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(3);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should save product to firestore with code128 details with existing discount', async () => {
      const mockCart1 = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
          code128DiscountDetails: [
            {
              discountMethod: '03',
              discount: 30,
              appliedCount: 1,
            },
          ],
        },
        {
          setItemCode: '6492',
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 2,
              code128DiscountDetails: null,
            },
          ],
        },
      ];
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const code128Discount = [
        {
          discountMethod: '03',
          discount: 30,
          appliedCount: 1,
        },
      ];

      const mockProductDetails = {
        productId: '45478991',
        productName: 'test',
        imageUrls: [
          'https://imgix.cainz.com/4547894154991/product/4547894154991_01.jpg',
        ],
        quantity: 1,
        taxRate: 8,
        priceIncludingTax: 698,
        isAlcoholic: false,
        code128DiscountDetails: null,
      };
      mockProductDetails.code128DiscountDetails = code128Discount;

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart1);
      await service.saveProductDetailToFirestore(
        encryptedMemberId,
        mockProductDetails,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(4);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should save product to firestore with code128 details without existing discount', async () => {
      const mockCart1 = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
          code128DiscountDetails: [
            {
              discountMethod: '02',
              discount: 160,
              appliedCount: 1,
            },
          ],
        },
        {
          setItemCode: '6492',
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 2,
              code128DiscountDetails: null,
            },
          ],
        },
      ];
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const code128Discount = [
        {
          discountMethod: '03',
          discount: 30,
          appliedCount: 1,
        },
      ];

      const mockProductDetails = {
        productId: '45478991',
        productName: 'test',
        imageUrls: [
          'https://imgix.cainz.com/4547894154991/product/4547894154991_01.jpg',
        ],
        quantity: 1,
        taxRate: 8,
        priceIncludingTax: 698,
        isAlcoholic: false,
        code128DiscountDetails: null,
      };
      mockProductDetails.code128DiscountDetails = code128Discount;

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart1);
      await service.saveProductDetailToFirestore(
        encryptedMemberId,
        mockProductDetails,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(5);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should throw error', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockSaveProductDetails = {
        imageUrls: ['test 1', 'test 2'],
        isAlcoholic: false,
        taxRate: 1,
        productId: '54991',
        priceIncludingTax: 698,
        productName: 'Test',
        quantity: 1,
        code128DiscountDetails: null,
      };

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(undefined);

      try {
        await service.saveProductDetailToFirestore(
          encryptedMemberId,
          mockSaveProductDetails,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
          message: ErrorMessage[ErrorCode.INTERNAL_SERVER_ERROR],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
  describe('getSubItems', () => {
    it('Get sub items', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockCarts = [
        {
          setItemCode: '6942',
          subItems: [
            {
              productId: '45478881',
              productName: 'Test Product',
              quantity: 2,
            },
            {
              productId: '45478882',
              productName: 'Test Product',
              quantity: 2,
            },
          ],
        },
      ];
      const mockResp = [
        {
          setItemCode: '6942',
          subItems: [
            {
              productId: '45478881',
              productName: 'Test Product',
              quantity: 2,
            },
            {
              productId: '45478882',
              productName: 'Test Product',
              quantity: 3,
              code128DiscountDetails: [
                {
                  appliedCount: 1,
                  discount: 50,
                  discountMethod: '03',
                },
              ],
            },
          ],
        },
      ];
      const mockProductDiscount = [
        {
          discountMethod: '03',
          discount: 50,
          appliedCount: 1,
        },
      ];

      const productId = '45478882';

      const resp = service.findSubProduct(
        mockCarts,
        productId,
        mockProductDiscount,
      );
      expect(resp).toEqual(mockResp);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
});
