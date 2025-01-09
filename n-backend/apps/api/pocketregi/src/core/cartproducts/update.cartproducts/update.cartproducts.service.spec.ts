import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { UpdateProductQuantityService } from './update.cartproducts.service';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchCommit: jest.fn(),
};
const mockPocketregiUtils = {
  getPocketRegiProductFromFirestore: jest.fn(),
};
const mockCommonService = {
  logException: jest.fn(),
  createHttpException: jest.fn(),
};
describe('UpdateProductQuantityService', () => {
  let service: UpdateProductQuantityService;
  let pocketRegiCartUtils: PocketRegiCartCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        UpdateProductQuantityService,
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

    service = module.get<UpdateProductQuantityService>(
      UpdateProductQuantityService,
    );
    pocketRegiCartUtils = module.get<PocketRegiCartCommonService>(
      PocketRegiCartCommonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.updateCartProduct).toBeDefined();
  });

  describe('pocketRegi cart update main function', () => {
    it('should successfully update cart product', async () => {
      // Mock FirestoreBatchService methods
      const mockUpdateRequest = {
        productId: '45478954991',
        quantity: 2,
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      // Create a spy for the saveToFirestore method
      const saveToFirestoreMock = jest
        .spyOn(service, 'updateProductDetailToFirestore')
        .mockResolvedValue();

      const result = await service.updateCartProduct(
        mockUpdateRequest.productId,
        mockUpdateRequest.quantity,
        claim,
      );
      const expectedResult = {
        code: 200,
        message: 'OK',
      };
      // Assertions for the successful product update
      expect(result).toEqual(expectedResult);
      expect(saveToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        mockUpdateRequest,
      );

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('updateProductInFirestore', () => {
    it('should update normal to firestore', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockCart = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
        },
        {
          isAlcoholic: false,
          priceIncludingTax: 7,
          productId: '49978992',
          productName: 'Test product B',
          quantity: 2,
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 2,
            },
          ],
        },
      ];

      const mockUpdateRequest = {
        productId: '45478991',
        quantity: 2,
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      await service.updateProductDetailToFirestore(
        encryptedMemberId,
        mockUpdateRequest,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should update subitems to firestore', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockCart = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
        },
        {
          isAlcoholic: false,
          priceIncludingTax: 7,
          productId: '49978992',
          productName: 'Test product B',
          quantity: 2,
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 4,
            },
          ],
        },
      ];

      const mockUpdateRequest = {
        productId: '49978993',
        quantity: 4,
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      await service.updateProductDetailToFirestore(
        encryptedMemberId,
        mockUpdateRequest,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(2);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should handle failure', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)

      const mockUpdateRequest = {
        productId: '49978993',
        quantity: 4,
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      const mockCart = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
        },
        {
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 4,
            },
          ],
        },
      ];
      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);
      await service.updateProductDetailToFirestore(
        encryptedMemberId,
        mockUpdateRequest,
      );
      expect(mockCommonService.logException).toHaveBeenCalled();
      expect(mockCommonService.createHttpException).toHaveBeenCalled();
    });
  });
  describe('getPocketRegiProductFromFirestore', () => {
    it('it should return product detail with success', async () => {
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      const mockCart = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
        },
        {
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
              quantity: 4,
            },
          ],
        },
      ];
      // Call the function being tested
      const response =
        await pocketRegiCartUtils.getPocketRegiProductFromFirestore(
          encryptedMemberId,
        );
      expect(response).toEqual(mockCart);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('it should throw error', async () => {
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      // Call the function being tested
      try {
        await pocketRegiCartUtils.getPocketRegiProductFromFirestore(
          encryptedMemberId,
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
      const mockCart = [
        {
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
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
          isAlcoholic: false,
          priceIncludingTax: 6,
          productId: '45478991',
          productName: 'Test Product',
          quantity: 2,
          subItems: [
            {
              productId: '45478881',
              productName: 'Test Product',
              quantity: 2,
            },
            {
              productId: '45478882',
              productName: 'Test Product',
              quantity: 4,
            },
          ],
        },
      ];

      const mockUpdateRequest = {
        productId: '45478882',
        quantity: 4,
      };

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      const resp = service.findSubProduct(mockCart, mockUpdateRequest);
      expect(resp).toEqual(mockResp);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
});
