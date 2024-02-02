import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { DeleteProductService } from './delete.cartproducts.service';
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
describe('DeleteProductService', () => {
  let service: DeleteProductService;
  let pocketRegiCartUtils: PocketRegiCartCommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        DeleteProductService,
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

    service = module.get<DeleteProductService>(DeleteProductService);
    pocketRegiCartUtils = module.get<PocketRegiCartCommonService>(
      PocketRegiCartCommonService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.deleteCartProduct).toBeDefined();
  });

  describe('pocketRegi cart delete main function', () => {
    it('should successfully delete cart product', async () => {
      // Mock FirestoreBatchService methods
      const mockDeleteRequest = {
        productId: '45478954991',
      };

      const claim = {
        userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
        encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';
      // Create a spy for the saveToFirestore method
      const deleteToFirestoreMock = jest
        .spyOn(service, 'deleteProductDetailToFirestore')
        .mockResolvedValue();

      const result = await service.deleteCartProduct(mockDeleteRequest, claim);
      const expectedResult = {
        code: 200,
        message: 'OK',
      };
      // Assertions for the successful product update
      expect(result).toEqual(expectedResult);
      expect(deleteToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        mockDeleteRequest,
      );

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('deleteProductInFirestore', () => {
    it('should delete normal product from firestore', async () => {
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
          productName: 'Test product A',
        },
        {
          subtotalAmount: 1654,
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
            },
          ],
        },
      ];

      const mockDeleteRequest = {
        productId: '45478991',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      await service.deleteProductDetailToFirestore(
        encryptedMemberId,
        mockDeleteRequest,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should delete sub item product from firestore', async () => {
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
          productName: 'Test product A',
        },
        {
          subtotalAmount: 1654,
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
            },
          ],
        },
      ];

      const mockDeleteRequest = {
        productId: '49978993',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      await service.deleteProductDetailToFirestore(
        encryptedMemberId,
        mockDeleteRequest,
      );
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(2);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should handle error', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      const mockDeleteRequest = {
        productId: '45478994',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(undefined);

      try {
        await service.deleteProductDetailToFirestore(
          encryptedMemberId,
          mockDeleteRequest,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(mockCommonService.logException).toHaveBeenCalled();
        expect(mockCommonService.createHttpException).toHaveBeenCalled();
      }
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
    it('should throw error when product id is empty', async () => {
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
          productName: 'Test product A',
        },
        {
          subtotalAmount: 1654,
          subItems: [
            {
              isAlcoholic: false,
              priceIncludingTax: 6,
              productId: '49978993',
              productName: 'Test sub item prod',
            },
          ],
        },
      ];

      const mockDeleteRequest = {
        productId: '',
      };
      const encryptedMemberId = 'pk6fe0d9ead469eb5eb617d5119e108cb';

      jest
        .spyOn(pocketRegiCartUtils, 'getPocketRegiProductFromFirestore')
        .mockResolvedValue(mockCart);

      try {
        await service.deleteProductDetailToFirestore(
          encryptedMemberId,
          mockDeleteRequest,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.BAD_REQUEST_PRODUCT_ID,
          message: ErrorMessage[ErrorCode.BAD_REQUEST_PRODUCT_ID],
        });
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
});
