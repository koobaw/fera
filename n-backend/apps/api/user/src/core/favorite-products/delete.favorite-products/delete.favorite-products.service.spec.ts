import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { initializeApp } from 'firebase-admin/app';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { DocumentReference, DocumentSnapshot } from '@google-cloud/firestore';
import { DeleteFavoriteProductsService } from './delete.favorite-products.service';
import { GlobalsModule } from '../../../globals.module';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { CommonFavoriteProductsService } from '../common.favorite-products.service';

describe('DeleteFavoriteProductsService', () => {
  let deleteFavoriteProductsService: DeleteFavoriteProductsService;
  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(() => ({ get: jest.fn() })),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  const mockCommonFavoriteProductsService = {
    getFavoritesDocSnapByUser: jest.fn(),
  };

  const mockCommonService = {
    logException: jest.fn(),
    createTask: jest.fn(),
  };

  beforeAll(() => {
    initializeApp();
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        DeleteFavoriteProductsService,
        {
          provide: CommonFavoriteProductsService,
          useFactory: () => mockCommonFavoriteProductsService,
        },
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
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
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
      ],
    }).compile();

    deleteFavoriteProductsService = module.get<DeleteFavoriteProductsService>(
      DeleteFavoriteProductsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(deleteFavoriteProductsService).toBeDefined();
  });

  it('should be defined methods', () => {
    expect(deleteFavoriteProductsService.deleteFromFirestore).toBeDefined();
    expect(deleteFavoriteProductsService.existsMylist).toBeDefined();
    expect(deleteFavoriteProductsService.getDeleteTargetDocs).toBeDefined();
    expect(deleteFavoriteProductsService.pushToTaskQueue).toBeDefined();
  });

  describe('existsMylist', () => {
    it('should be return true', async () => {
      const encryptedMemberId = 'encryptedMemberId';
      const mylistId = 'mylistId';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;

      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockedSnapshot),
              })),
            })),
          })),
        }));

      const exists = await deleteFavoriteProductsService.existsMylist(
        encryptedMemberId,
        mylistId,
      );

      expect(exists).toBe(true);
    });

    it('should be return false', async () => {
      const encryptedMemberId = 'encryptedMemberId';
      const mylistId = 'mylistId';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: false,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                get: jest.fn().mockResolvedValue(mockedSnapshot),
              })),
            })),
          })),
        }));

      const exists = await deleteFavoriteProductsService.existsMylist(
        encryptedMemberId,
        mylistId,
      );

      expect(exists).toBe(false);
    });

    it('should be thrown error', async () => {
      const encryptedMemberId = 'encryptedMemberId';
      const mylistId = 'mylistId';
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(new Error('error')),
              })),
            })),
          })),
        }));

      await expect(
        deleteFavoriteProductsService.existsMylist(encryptedMemberId, mylistId),
      ).rejects.toThrow(
        ErrorMessage[
          ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB
        ],
      );
    });
  });

  describe('pushToTaskQueue', () => {
    it('should be called method', async () => {
      const mockedCorrelationId = 'mockedCorrelationId';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const targetDocs = [mockedSnapshot];

      await deleteFavoriteProductsService.pushToTaskQueue(
        targetDocs,
        mockedCorrelationId,
      );
      expect(mockCommonService.createTask).toBeCalled();
    });

    it('should be not called method', async () => {
      const mockedCorrelationId = 'mockedCorrelationId';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot1 = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: null,
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const targetDocs = [mockedSnapshot1];

      await deleteFavoriteProductsService.pushToTaskQueue(
        targetDocs,
        mockedCorrelationId,
      );
      expect(mockCommonService.createTask).not.toBeCalled();
    });

    it('should be return error', async () => {
      const mockedCorrelationId = 'mockedCorrelationId';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const targetDocs = [mockedSnapshot];

      jest
        .spyOn(mockCommonService, 'createTask')
        .mockRejectedValue(new Error('error'));

      await expect(
        deleteFavoriteProductsService.pushToTaskQueue(
          targetDocs,
          mockedCorrelationId,
        ),
      ).rejects.toThrow(
        ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_DELETE_PUSH_TO_TASK_QUEUE],
      );
    });
  });

  describe('getDeleteTargetDocs', () => {
    it('should be get docs', async () => {
      const encryptedMemberId = 'encryptedMemberId';
      const mylistId = 'mylistId';
      const productIds = ['productId1', 'productId2', 'productId3'];

      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                collection: jest.fn().mockImplementation(() => ({
                  doc: jest.fn().mockImplementation(() => ({
                    get: jest.fn().mockResolvedValue(mockedSnapshot),
                  })),
                })),
              })),
            })),
          })),
        }));

      const results = await deleteFavoriteProductsService.getDeleteTargetDocs(
        encryptedMemberId,
        mylistId,
        productIds,
      );

      expect(results).toHaveLength(3);
    });

    it('should be thrown error', async () => {
      const encryptedMemberId = 'encryptedMemberId';
      const mylistId = 'mylistId';
      const productIds = ['productId1', 'productId2', 'productId3'];
      // serviceのprivate methodをmockに上書き
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                get: jest.fn().mockRejectedValue(new Error('error')),
              })),
            })),
          })),
        }));

      await expect(
        deleteFavoriteProductsService.getDeleteTargetDocs(
          encryptedMemberId,
          mylistId,
          productIds,
        ),
      ).rejects.toThrow(
        ErrorMessage[
          ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB
        ],
      );
    });
  });

  describe('deleteFromFirestore', () => {
    it('should be called methods', async () => {
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'mockedId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const targetDocs = [mockedSnapshot];
      await deleteFavoriteProductsService.deleteFromFirestore(targetDocs);
      expect(mockFirestoreBatchService.batchDelete).toBeCalled();
      expect(mockFirestoreBatchService.batchCommit).toBeCalled();
    });
  });

  it('should be thrown error', async () => {
    const mockedDocRef = {
      id: 'id',
      path: 'user/favorite/products/45454545',
    } as DocumentReference;
    const mockedSnapshot = {
      exists: true,
      id: 'mockedId1',
      data: jest.fn(() => ({
        id: 'objectId1',
      })),
      ref: mockedDocRef,
      readTime: null,
      get: jest.fn(),
      isEqual: jest.fn(),
    } as DocumentSnapshot;
    const targetDocs = [mockedSnapshot];
    // serviceのprivate methodをmockに上書き
    jest
      .spyOn(mockFirestoreBatchService, 'batchDelete')
      .mockRejectedValue(new Error('error'));
    await expect(
      deleteFavoriteProductsService.deleteFromFirestore(targetDocs),
    ).rejects.toThrow(ErrorMessage[ErrorCode.FAVORITE_PRODUCTS_DELETE_FROM_DB]);
  });
});
