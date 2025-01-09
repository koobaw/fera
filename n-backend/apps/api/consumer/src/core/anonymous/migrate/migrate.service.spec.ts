import crypto from 'crypto';

import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@fera-next-gen/common';

import { GlobalsModule } from '../../../globals.module';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { AnonymousDto } from '../dto/anonymous.dto';
import { MigrateData } from '../interface/migrate-data.interface';
import { MigrateService } from './migrate.service';

describe('MigrateService', () => {
  let migrateService: MigrateService;

  const generateId = () => {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const N = 28;
    return Array.from(crypto.randomFillSync(new Uint8Array(N)))
      .map((n) => S[n % S.length])
      .join('');
  };

  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn() })) })),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        MigrateService,
        {
          provide: LoggingService,
          useFactory: () => ({
            log: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
          }),
        },
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
          }),
        },
      ],
    }).compile();

    migrateService = module.get(MigrateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(migrateService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(migrateService.transformToAnonymous).toBeDefined();
    expect(migrateService.saveToFirestore).toBeDefined();
  });

  describe('transformToAnonymous', () => {
    it('should be success', async () => {
      const genAnonymousUserId = generateId();
      const migrateData: MigrateData = {
        userType: '2',
        myStoreCode: '819',
        legacyMemberId: '2753000000355',
        favoriteProductCodes: ['4549509324416'],
        pickupOrderIds: ['4549509324416'],
      };

      const anonymous: AnonymousDto = {
        anonymousUserId: genAnonymousUserId,
        userType: 'member',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProducts: ['4549509324416'],
        pickupOrders: ['4549509324416'],
      };

      await expect(
        migrateService.transformToAnonymous(genAnonymousUserId, migrateData),
      ).resolves.toEqual(anonymous);
    });

    it('should throw exception when anonymousUserId is not exist', async () => {
      const anonymousUserId = undefined;
      const migrateData: MigrateData = {
        userType: '0',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProductCodes: ['4549509324416'],
        pickupOrderIds: ['4549509324416'],
      };

      await expect(
        migrateService.transformToAnonymous(anonymousUserId, migrateData),
      ).rejects.toThrow();
    });

    it('should throw exception when userType has error value', async () => {
      const anonymousUserId = generateId();
      const migrateData: MigrateData = {
        userType: '3',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProductCodes: ['4549509324416'],
        pickupOrderIds: ['4549509324416'],
      };
      expect(
        migrateService.transformToAnonymous(anonymousUserId, migrateData),
      ).rejects.toThrow();

      migrateData.userType = '-1';
      await expect(
        migrateService.transformToAnonymous(anonymousUserId, migrateData),
      ).rejects.toThrow();
    });

    it('should throw exception when myShop is not exist', async () => {
      const anonymousUserId = generateId();
      const migrateData: MigrateData = {
        userType: '0',
        legacyMemberId: '2753000000355',
        myStoreCode: undefined,
        favoriteProductCodes: ['4549509324416'],
        pickupOrderIds: ['4549509324416'],
      };
      await expect(
        migrateService.transformToAnonymous(anonymousUserId, migrateData),
      ).rejects.toThrow();
    });
  });

  describe('saveToFirestore', () => {
    it('should be called these methods', async () => {
      const anonymous: AnonymousDto = {
        anonymousUserId: generateId(),
        userType: 'member',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProducts: ['4549509324416'],
        pickupOrders: ['4549509324416'],
      };
      const operatorName = '/v1/user/migrate';

      await migrateService.saveToFirestore(anonymous, operatorName);

      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(2);
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(4);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(2);
    });

    it('should throw exception when called saveToAnonymous failed', async () => {
      mockFirestoreBatchService.batchSet.mockImplementation(() => {
        throw new Error('mocked Error');
      });

      const anonymous: AnonymousDto = {
        anonymousUserId: generateId(),
        userType: 'member',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProducts: ['4549509324416'],
        pickupOrders: ['4549509324416'],
      };
      const operatorName = '/v1/user/migrate';

      await expect(
        migrateService.saveToFirestore(anonymous, operatorName),
      ).rejects.toThrow(ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB]);
    });

    it('should throw exception when called saveToAnonymousFavorites failed', async () => {
      mockFirestoreBatchService.batchSet.mockImplementation(() => {
        throw new Error('mocked Error');
      });
      Object.defineProperty(migrateService, 'batchSetAnonymous', {
        value: jest.fn(),
      });

      const anonymous: AnonymousDto = {
        anonymousUserId: generateId(),
        userType: 'member',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProducts: ['4549509324416'],
        pickupOrders: ['4549509324416'],
      };
      const operatorName = '/v1/user/migrate';

      await expect(
        migrateService.saveToFirestore(anonymous, operatorName),
      ).rejects.toThrow(ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB]);
    });

    it('should throw exception when called saveToAnonymousPickupOrders failed', async () => {
      mockFirestoreBatchService.batchSet.mockImplementation(() => {
        throw new Error('mocked Error');
      });
      Object.defineProperty(migrateService, 'batchSetAnonymous', {
        value: jest.fn(),
      });
      Object.defineProperty(migrateService, 'batchSetAnonymousFavorites', {
        value: jest.fn(),
      });

      const anonymous: AnonymousDto = {
        anonymousUserId: generateId(),
        userType: 'member',
        legacyMemberId: '2753000000355',
        myStoreCode: '819',
        favoriteProducts: ['4549509324416'],
        pickupOrders: ['4549509324416'],
      };
      const operatorName = '/v1/user/migrate';

      await expect(
        migrateService.saveToFirestore(anonymous, operatorName),
      ).rejects.toThrow(ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB]);
    });
  });
});
