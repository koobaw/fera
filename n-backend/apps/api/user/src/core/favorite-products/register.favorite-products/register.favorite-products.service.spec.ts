/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { GlobalsModule } from '../../../globals.module';
import { FavoritesMuleApiService } from '../favorites-mule-api/favorites-mule-api.service';
import { FavoriteProductsMuleApiService } from '../favorite-products-mule-api/favorite-products-mule-api.service';
import { CommonFavoriteProductsService } from '../common.favorite-products.service';
import { RegisterFavoriteProductsService } from './register.favorite-products.service';

jest.mock('rxjs', () => ({
  ...jest.requireActual('rxjs'),
  createDecipheriv: jest.fn().mockReturnValue({
    firstValueFrom: jest.fn(),
  }),
}));

describe('RegisterFavoriteProductsService', () => {
  let service: RegisterFavoriteProductsService;
  let commonFavoriteProductsService: CommonFavoriteProductsService;
  let favoriteProductsMuleApiService: FavoriteProductsMuleApiService;
  let httpService: HttpService;
  let env: ConfigService;
  let commonService: CommonService;
  const mockedFirestoreBatchService = {
    batchSet: jest.fn(),
    batchCommit: jest.fn(),
    batchDelete: jest.fn(),
    findCollection: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        RegisterFavoriteProductsService,
        FavoritesMuleApiService,
        FavoriteProductsMuleApiService,
        CommonFavoriteProductsService,
        {
          provide: FirestoreBatchService,
          useValue: mockedFirestoreBatchService,
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<RegisterFavoriteProductsService>(
      RegisterFavoriteProductsService,
    );
    favoriteProductsMuleApiService = module.get<FavoriteProductsMuleApiService>(
      FavoriteProductsMuleApiService,
    );
    commonFavoriteProductsService = module.get<CommonFavoriteProductsService>(
      CommonFavoriteProductsService,
    );
    httpService = module.get<HttpService>(HttpService);
    env = module.get<ConfigService>(ConfigService);
    commonService = module.get<CommonService>(CommonService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(service.getTargetFavoriteDoc).toBeDefined();
    expect(service.createFavoriteProductTaskToRegister).toBeDefined();
    expect(service.saveToFirestore).toBeDefined();
  });

  describe('getTargetFavoriteDoc', () => {
    it('should be returned favoriteDocument', async () => {
      const documentData = 'documentData';
      jest
        .spyOn(mockedFirestoreBatchService, 'findCollection')
        .mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnValue(documentData),
              }),
            }),
          }),
        });

      const mylistId = 'mylistId';
      const encryptedMemberId = 'encryptedMemberId';
      const result = await service.getTargetFavoriteDoc(
        mylistId,
        encryptedMemberId,
      );

      expect(result).toBe(documentData);
    });

    it('should be returned default data', async () => {
      const documentData = 'documentData';
      jest
        .spyOn(mockedFirestoreBatchService, 'findCollection')
        .mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnValue(documentData),
              }),
            }),
          }),
        });

      const documentSnapshot = {
        exists: true,
      };
      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => documentSnapshot);

      const mylistId = null;
      const encryptedMemberId = 'encryptedMemberId';
      const result = await service.getTargetFavoriteDoc(
        mylistId,
        encryptedMemberId,
      );

      expect(result).toBe(documentSnapshot);
    });

    it('should be returned created default data', async () => {
      const documentData = 'documentData';
      jest
        .spyOn(mockedFirestoreBatchService, 'findCollection')
        .mockReturnValue({
          doc: jest.fn().mockReturnValue({
            collection: jest.fn().mockReturnValue({
              doc: jest.fn().mockReturnValue({
                get: jest.fn().mockReturnValue(documentData),
              }),
            }),
          }),
        });

      const documentSnapshot = {
        exists: false,
      };
      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => documentSnapshot);

      const createDummyDefaultFavoriteDoc = 'createdDummyDefaultFavoriteDoc';
      jest
        .spyOn(service as any, 'createDummyDefaultFavoriteDoc')
        .mockImplementation(async () => createDummyDefaultFavoriteDoc);

      const mylistId = null;
      const encryptedMemberId = 'encryptedMemberId';
      const result = await service.getTargetFavoriteDoc(
        mylistId,
        encryptedMemberId,
      );

      expect(result).toBe(createDummyDefaultFavoriteDoc);
    });
  });

  describe('saveToFirestore', () => {
    it('should not save if favoriteProduct already exist', async () => {
      const targetFavoriteDoc = {
        ref: {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockReturnValue({
                id: 'objectId',
                exists: true,
              }),
            }),
          }),
        },
      };

      const favoriteProductId = 'favoriteProductId';
      const operatorName = 'operatorName';
      await service.saveToFirestore(
        targetFavoriteDoc as any,
        favoriteProductId,
        operatorName,
      );

      expect(mockedFirestoreBatchService.batchSet).not.toBeCalled();
      expect(mockedFirestoreBatchService.batchCommit).not.toBeCalled();
    });

    it('should save favoriteProduct', async () => {
      const targetFavoriteDoc = {
        ref: {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockReturnValue({
                id: 'objectId',
                exists: false,
              }),
            }),
          }),
        },
      };

      const favoriteProductId = 'favoriteProductId';
      const operatorName = 'operatorName';
      await service.saveToFirestore(
        targetFavoriteDoc as any,
        favoriteProductId,
        operatorName,
      );

      expect(mockedFirestoreBatchService.batchSet).toBeCalled();
      expect(mockedFirestoreBatchService.batchCommit).toBeCalled();
    });

    it('should throw httpException', async () => {
      jest
        .spyOn(mockedFirestoreBatchService, 'batchCommit')
        .mockImplementation(() => {
          throw new Error('batch commit failed');
        });

      const targetFavoriteDoc = {
        ref: {
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockReturnValue({
                id: 'objectId',
                exists: false,
              }),
            }),
          }),
        },
      };

      const favoriteProductId = 'favoriteProductId';
      const operatorName = 'operatorName';
      await expect(
        service.saveToFirestore(
          targetFavoriteDoc as any,
          favoriteProductId,
          operatorName,
        ),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('createFavoriteProductTaskToRegister', () => {
    it('should be created task', async () => {
      jest.spyOn(commonService, 'createTask').mockImplementation();

      const encryptedMemberId = 'encryptedMemberId';
      const targetFavoriteId = 'targetFavoriteId';
      const favoriteProductId = 'favoriteProductId';
      const bearerHeader = 'bearerHeader';
      const correlationId = 'correlationId';
      await service.createFavoriteProductTaskToRegister(
        encryptedMemberId,
        targetFavoriteId,
        favoriteProductId,
        bearerHeader,
        correlationId,
      );

      expect(commonService.createTask).toBeCalled();
    });

    it('should fail task creation', async () => {
      jest.spyOn(commonService, 'createTask').mockImplementation(() => {
        throw new Error('create task failed');
      });

      const encryptedMemberId = 'encryptedMemberId';
      const targetFavoriteId = 'targetFavoriteId';
      const favoriteProductId = 'favoriteProductId';
      const bearerHeader = 'bearerHeader';
      const correlationId = 'correlationId';

      await expect(
        service.createFavoriteProductTaskToRegister(
          encryptedMemberId,
          targetFavoriteId,
          favoriteProductId,
          bearerHeader,
          correlationId,
        ),
      ).rejects.toThrow(HttpException);
    });
  });
});
