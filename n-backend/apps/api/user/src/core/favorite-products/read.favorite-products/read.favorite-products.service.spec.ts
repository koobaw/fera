/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { Timestamp } from '@google-cloud/firestore';
import {
  OmitTimestampUserFavoriteProduct,
  UserFavoriteProduct,
} from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { firestore } from 'firebase-admin';
import { ReadFavoriteProductsService } from './read.favorite-products.service';
import { GlobalsModule } from '../../../globals.module';
import { FavoritesMuleApiService } from '../favorites-mule-api/favorites-mule-api.service';
import { FavoriteProductsMuleApiService } from '../favorite-products-mule-api/favorite-products-mule-api.service';
import { CommonFavoriteProductsService } from '../common.favorite-products.service';
import { MuleFavoritesReadSuccessResponse } from '../interfaces/favorites-mule-api.interface';
import { MuleFavoriteProductReadResponseSuccess } from '../interfaces/favorite-products-mule-api.interface';

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  createDecipheriv: jest.fn().mockReturnValue({
    firstValueFrom: jest.fn(),
  }),
}));

describe('ReadFavoriteProductsService', () => {
  let service: ReadFavoriteProductsService;
  let favoriteProductsMuleApiService: FavoriteProductsMuleApiService;
  let httpService: HttpService;
  let env: ConfigService;
  const mockedFirestoreBatchService = {
    batchSet: jest.fn(),
    batchCommit: jest.fn(),
    batchDelete: jest.fn(),
  };
  const mockCommonFavoriteProductsService = {
    getFavoritesDocSnapByUser: jest.fn(),
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        ReadFavoriteProductsService,
        FavoritesMuleApiService,
        FavoriteProductsMuleApiService,
        {
          provide: FirestoreBatchService,
          useValue: mockedFirestoreBatchService,
        },
        {
          provide: CommonFavoriteProductsService,
          useValue: mockCommonFavoriteProductsService,
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<ReadFavoriteProductsService>(
      ReadFavoriteProductsService,
    );
    favoriteProductsMuleApiService = module.get<FavoriteProductsMuleApiService>(
      FavoriteProductsMuleApiService,
    );
    httpService = module.get<HttpService>(HttpService);
    env = module.get<ConfigService>(ConfigService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(service.fetchFavoriteProduct).toBeDefined();
    expect(service.fetchProductWithPrice).toBeDefined();
    expect(service.getFavoriteProductsFromFirestore).toBeDefined();
    expect(service.isFavoriteProductsExpired).toBeDefined();
    expect(service.saveToFirestore).toBeDefined();
  });

  describe('getFavoriteProductsFromFirestore', () => {
    it('should response firestore cache data', async () => {
      const data = {
        id: 'favoriteId',
        productId: '4906128451037',
        userCreatedAt: Timestamp.now(),
        createdBy: 'createdBy',
        createdAt: Timestamp.now(),
        updatedBy: 'updatedBy',
        updatedAt: Timestamp.now(),
      };
      const dummyCollection = {
        get: jest.fn().mockReturnValue([
          {
            data: jest.fn().mockReturnValue(data),
          },
        ]),
      } as any;

      const result = await service.getFavoriteProductsFromFirestore(
        dummyCollection,
      );
      expect(result).toEqual([data]);
    });
  });

  describe('fetchFavoriteProduct', () => {
    it('should response empty when default is null', async () => {
      jest.spyOn(service as any, 'fetchDefaultFavorites').mockReturnValue(null);

      const memberId = 'memberId';
      const result = await service.fetchFavoriteProduct(memberId);
      expect(result).toEqual([]);
    });

    it('should response fetched favoriteProduct', async () => {
      const defaultFavorites: MuleFavoritesReadSuccessResponse = {
        id: 'mylistId',
        name: 'mylistName',
        accountId: 'accountId',
        comment: 'comment',
        title: 'mylistTitle',
        isPublish: false,
        isDefault: false,
        ownerId: 'ownerId',
        createdBy: 'createdUser',
        lastModifiedBy: 'lastModifiedUser',
      };
      jest
        .spyOn(service as any, 'fetchDefaultFavorites')
        .mockReturnValue(defaultFavorites);

      const muleFavoriteProductReadResponseSuccess: MuleFavoriteProductReadResponseSuccess =
        {
          id: 'objectId',
          name: 'Pet’sOne 強力消臭 炭入りペットシーツ ワイド 44枚',
          accountId: 'accountId',
          myListId: 'mylistId',
          jan: '4549509541707',
          comment: 'favoriteProductComment',
          displayOrder: 0,
          ownerId: 'ownerId',
          createdBy: 'createdUser',
          lastModifiedBy: 'lastModifiedUser',
        };
      jest
        .spyOn(favoriteProductsMuleApiService, 'fetchFavoriteProducts')
        .mockImplementation(async () => [
          muleFavoriteProductReadResponseSuccess,
        ]);

      const memberId = 'memberId';
      const result = await service.fetchFavoriteProduct(memberId);
      expect(result).toEqual([muleFavoriteProductReadResponseSuccess]);
    });
  });

  describe('saveToFirestore', () => {
    it('should save favoriteProducts', async () => {
      const oldFavoriteProduct: UserFavoriteProduct = {
        id: 'objectId',
        productId: '4906128451037',
        userCreatedAt: Timestamp.now(),
        createdBy: 'createdBy',
        createdAt: Timestamp.now(),
        updatedBy: 'updatedBy',
        updatedAt: Timestamp.now(),
      };

      const dummyCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            data: jest.fn().mockReturnValue(oldFavoriteProduct),
          }),
        }),
      } as any;

      let savedData: UserFavoriteProduct;

      jest
        .spyOn(mockedFirestoreBatchService, 'batchSet')
        .mockImplementation(async (_favoriteProductDocRef, saveData) => {
          savedData = saveData as UserFavoriteProduct;
        });

      jest
        .spyOn(mockedFirestoreBatchService, 'batchCommit')
        .mockImplementation();

      const favoriteProducts: OmitTimestampUserFavoriteProduct[] = [
        {
          id: 'objectId',
          productId: '4906128451037',
          userCreatedAt: Timestamp.now(),
        },
      ];

      const operatorName = 'operatorName';

      await service.saveToFirestore(
        favoriteProducts,
        dummyCollection,
        'operatorName',
      );

      expect(savedData).toEqual({
        ...favoriteProducts[0],
        createdBy: oldFavoriteProduct.createdBy,
        createdAt: oldFavoriteProduct.createdAt,
        updatedBy: operatorName,
        // 更新時間はテストできないので、ここではチェックしない
        updatedAt: savedData.updatedAt,
      });
    });

    it('should save favoriteProducts', async () => {
      const oldFavoriteProduct: UserFavoriteProduct = {
        id: 'objectId',
        productId: '4906128451037',
        userCreatedAt: Timestamp.now(),
        createdBy: 'createdBy',
        createdAt: Timestamp.now(),
        updatedBy: 'updatedBy',
        updatedAt: Timestamp.now(),
      };

      const dummyCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({
            data: jest.fn().mockReturnValue(oldFavoriteProduct),
          }),
        }),
      } as any;

      jest
        .spyOn(Reflect.get(service, 'firestoreBatchService'), 'batchCommit')
        .mockImplementation(() => {
          throw new Error('error');
        });

      const favoriteProducts: OmitTimestampUserFavoriteProduct[] = [
        {
          id: 'objectId',
          productId: '4906128451037',
          userCreatedAt: Timestamp.now(),
        },
      ];

      await expect(
        service.saveToFirestore(
          favoriteProducts,
          dummyCollection,
          'operatorName',
        ),
      ).rejects.toThrow();
    });
  });

  describe('fetchProductWithPrice', () => {
    it('should correct url, headers and params', async () => {
      const observableResponse = of({
        data: {
          data: [
            {
              productId: '4549509628453',
              name: 'Pet’sOne 強力消臭 炭入りペットシーツ ワイド 44枚',
              imageUrls: ['https://example.com'],
              prices: [{ priceIncludingTax: 1000 }],
            },
          ],
        },
      });

      let sendedUrl;
      let sendedHeaderAndParams;
      jest
        .spyOn(httpService as any, 'get')
        .mockImplementation((url, headerAndParams) => {
          sendedUrl = url;
          sendedHeaderAndParams = headerAndParams;
          return { pipe: jest.fn().mockReturnValue(observableResponse) };
        });

      const productIds = ['4549509628453'];

      await service.fetchProductWithPrice(
        productIds,
        '888',
        '0',
        'dummyAccessToken',
      );

      const url = `${env.get<string>(
        'BFF_PRODUCT_SERVICE_BASE_URL',
      )}/${productIds.join()}`;

      expect(sendedUrl).toEqual(url);
      expect(sendedHeaderAndParams).toEqual({
        headers: {
          Authorization: 'Bearer dummyAccessToken',
        },
        params: {
          select: 'price',
          storeCodes: '888',
          membershipRank: '0',
        },
      });
    });
  });

  describe('extractNonUpdatedFavoritesProducts', () => {
    it('should firestore response When no response from mule', async () => {
      const userFavoriteProducts: UserFavoriteProduct[] = [
        {
          id: 'dummyObjectId',
          productId: 'dummyProductId',
          userCreatedAt: Timestamp.now(),
          createdBy: 'dummyCreatedBy',
          createdAt: Timestamp.now(),
          updatedBy: 'dummyUpdatedBy',
          updatedAt: Timestamp.now(),
        },
      ];
      const userFavoriteProductsOnlyIds = userFavoriteProducts.map(
        (it) => it.productId,
      );

      const result = service.extractNonUpdatedFavoritesProducts(
        userFavoriteProducts,
        [],
      );
      expect(result).toEqual(userFavoriteProductsOnlyIds);
    });

    it('should only non updated productIds', async () => {
      const userFavoriteProducts: UserFavoriteProduct[] = [
        {
          id: 'dummyUpdatedObjectId',
          productId: '1111111111111',
          userCreatedAt: Timestamp.now(),
          createdBy: 'dummyCreatedBy',
          createdAt: Timestamp.now(),
          updatedBy: 'dummyUpdatedBy',
          updatedAt: Timestamp.now(),
        },
        {
          id: 'dummyNonUpdatedObjectId',
          productId: '9999999999999',
          userCreatedAt: Timestamp.now(),
          createdBy: 'dummyCreatedBy',
          createdAt: Timestamp.now(),
          updatedBy: 'dummyUpdatedBy',
          updatedAt: Timestamp.now(),
        },
      ];

      const favoriteProductsFromMule: MuleFavoriteProductReadResponseSuccess[] =
        [
          {
            id: 'dummyUpdatedObjectId',
            name: 'dummyName',
            accountId: 'dummyAccountId',
            myListId: 'dummyMyListId',
            jan: '1111111111111',
            comment: 'comment',
            displayOrder: 0,
            ownerId: 'dummyOwnerId',
            createdBy: 'dummyCreatedBy',
            lastModifiedBy: 'dummyLastModifiedBy',
          },
        ];

      const result = service.extractNonUpdatedFavoritesProducts(
        userFavoriteProducts,
        favoriteProductsFromMule,
      );

      expect(result).toEqual(['dummyNonUpdatedObjectId']);
    });
  });

  describe('deleteFavoriteProductsFromFirestore', () => {
    it('should called these methods', async () => {
      jest
        .spyOn(mockedFirestoreBatchService, 'batchDelete')
        .mockImplementation();
      jest
        .spyOn(mockedFirestoreBatchService, 'batchCommit')
        .mockImplementation();

      const dummyCollection = {
        doc: jest.fn(),
      } as any as FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

      await service.deleteFavoriteProductsFromFirestore(dummyCollection, [
        'dummyProductId',
      ]);

      expect(mockedFirestoreBatchService.batchDelete).toBeCalled();
      expect(mockedFirestoreBatchService.batchCommit).toBeCalled();
    });

    it('should called delete as many times as productId', async () => {
      jest
        .spyOn(mockedFirestoreBatchService, 'batchDelete')
        .mockImplementation();
      jest
        .spyOn(mockedFirestoreBatchService, 'batchCommit')
        .mockImplementation();

      const dummyCollection = {
        doc: jest.fn(),
      } as any as FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

      await service.deleteFavoriteProductsFromFirestore(dummyCollection, [
        'dummyProductId',
        'dummyProductId2',
        'dummyProductId3',
      ]);

      expect(mockedFirestoreBatchService.batchDelete).toBeCalledTimes(3);
      expect(mockedFirestoreBatchService.batchCommit).toBeCalled();
    });

    it('should fail When delete error', async () => {
      jest
        .spyOn(mockedFirestoreBatchService, 'batchDelete')
        .mockImplementation(() => {
          throw new Error('batch delete error');
        });
      jest
        .spyOn(mockedFirestoreBatchService, 'batchCommit')
        .mockImplementation();

      const dummyCollection = {
        get: jest.fn().mockReturnValue([{ doc: jest.fn() }]),
      } as any as FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

      await expect(
        service.deleteFavoriteProductsFromFirestore(dummyCollection, [
          'dummyProductId',
        ]),
      ).rejects.toThrow(HttpException);
    });
  });
  describe('getFavoriteProductIds', () => {
    // define common parameters
    const encryptedMemberId = 'dummyEncryptedId';
    const memberId = 'dummyId';
    const url = '/member/favorites/products/availability';
    const method = 'get';
    const timestamp = firestore.Timestamp.now();
    const mockMuleResponse: UserFavoriteProduct[] = [
      {
        id: 'uuid1',
        productId: '111111',
        userCreatedAt: timestamp,
        createdBy: 'dummyCreator',
        createdAt: timestamp,
        updatedBy: 'dummyUpdated',
        updatedAt: timestamp,
      },
      {
        id: 'uuid2',
        productId: '222222',
        userCreatedAt: timestamp,
        createdBy: 'dummyCreator',
        createdAt: timestamp,
        updatedBy: 'dummyUpdated',
        updatedAt: timestamp,
      },
    ];
    it('should return an empty array when there are no favorites', async () => {
      // define parameter
      const save = true;
      const expectedResponse = [];
      // define mock
      jest
        .spyOn(mockCommonFavoriteProductsService, 'getFavoritesDocSnapByUser')
        .mockImplementation(() => ({ exists: false }));
      // check method
      expect(
        await service.getFavoriteProductIds(
          encryptedMemberId,
          memberId,
          url,
          method,
          save,
        ),
      ).toEqual(expectedResponse);
    });
    it('should return ids when there are no expired', async () => {
      // define parameter
      const save = false;
      const expectedResponse = ['111111', '222222'];
      // define mock
      jest
        .spyOn(mockCommonFavoriteProductsService, 'getFavoritesDocSnapByUser')
        .mockImplementation(() => ({
          exists: true,
          ref: { collection: () => 'dummyCollection' },
        }));
      jest
        .spyOn(service, 'getFavoriteProductsFromFirestore')
        .mockImplementation(async () => mockMuleResponse);
      jest
        .spyOn(service, 'isFavoriteProductsExpired')
        .mockImplementation(() => false);
      // check method
      expect(
        await service.getFavoriteProductIds(
          encryptedMemberId,
          memberId,
          url,
          method,
          save,
        ),
      ).toEqual(expectedResponse);
    });
    it('should return ids when there are expired and not to save firestore', async () => {
      // define parameter
      const save = false;
      const expectedResponse = ['111111', '222222'];
      // define mock
      jest
        .spyOn(mockCommonFavoriteProductsService, 'getFavoritesDocSnapByUser')
        .mockImplementation(() => ({
          exists: true,
          ref: { collection: () => 'dummyCollection' },
        }));
      jest
        .spyOn(service, 'getFavoriteProductsFromFirestore')
        .mockImplementation(async () => mockMuleResponse);
      jest
        .spyOn(service, 'isFavoriteProductsExpired')
        .mockImplementation(() => true);
      jest
        .spyOn(service, 'fetchFavoriteProduct')
        .mockImplementation(async () => [
          {
            id: 'dummy',
            name: 'dummy',
            accountId: 'dummy',
            myListId: 'dummy',
            jan: '111111',
            comment: 'dummy',
            displayOrder: 1,
            ownerId: 'dummy',
            createdBy: 'dummy',
            lastModifiedBy: timestamp.toDate().toString(),
          },
          {
            id: 'dummy',
            name: 'dummy',
            accountId: 'dummy',
            myListId: 'dummy',
            jan: '222222',
            comment: 'dummy',
            displayOrder: 1,
            ownerId: 'dummy',
            createdBy: 'dummy',
            lastModifiedBy: timestamp.toDate().toString(),
          },
        ]);
      // check method
      expect(
        await service.getFavoriteProductIds(
          encryptedMemberId,
          memberId,
          url,
          method,
          save,
        ),
      ).toEqual(expectedResponse);
    });
    it('should return ids when there are expired and to save firestore', async () => {
      // define parameter
      const save = true;
      const expectedResponse = ['111111', '222222'];
      // define mock
      jest
        .spyOn(mockCommonFavoriteProductsService, 'getFavoritesDocSnapByUser')
        .mockImplementation(() => ({
          exists: true,
          ref: { collection: () => 'dummyCollection' },
        }));
      jest
        .spyOn(service, 'getFavoriteProductsFromFirestore')
        .mockImplementation(async () => mockMuleResponse);
      jest
        .spyOn(service, 'isFavoriteProductsExpired')
        .mockImplementation(() => true);
      jest
        .spyOn(service, 'fetchFavoriteProduct')
        .mockImplementation(async () => [
          {
            id: 'dummy',
            name: 'dummy',
            accountId: 'dummy',
            myListId: 'dummy',
            jan: '111111',
            comment: 'dummy',
            displayOrder: 1,
            ownerId: 'dummy',
            createdBy: 'dummy',
            lastModifiedBy: timestamp.toDate().toString(),
          },
          {
            id: 'dummy',
            name: 'dummy',
            accountId: 'dummy',
            myListId: 'dummy',
            jan: '222222',
            comment: 'dummy',
            displayOrder: 1,
            ownerId: 'dummy',
            createdBy: 'dummy',
            lastModifiedBy: timestamp.toDate().toString(),
          },
        ]);
      jest.spyOn(service, 'saveToFirestore').mockImplementation(async () => {});
      jest
        .spyOn(service, 'deleteFavoriteProductsFromFirestore')
        .mockImplementation(async () => {});
      // check method
      expect(
        await service.getFavoriteProductIds(
          encryptedMemberId,
          memberId,
          url,
          method,
          save,
        ),
      ).toEqual(expectedResponse);
    });
  });
});
