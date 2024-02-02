import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { Firestore } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { GlobalsModule } from '../../globals.module';
import { AnonymousService } from './anonymous.service';
import { MigrateService } from './migrate/migrate.service';

let anonymousService: AnonymousService;

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [GlobalsModule],
    providers: [
      AnonymousService,
      MigrateService,
      {
        provide: FirestoreBatchService,
        useFactory: () => mockFirestoreBatchService,
      },
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
    ],
  }).compile();

  anonymousService = module.get<AnonymousService>(AnonymousService);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('anonymousService', () => {
  it('should be defined', () => {
    expect(anonymousService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(anonymousService.getMigrateData).toBeDefined();
    expect(anonymousService.getMigrateTarget).toBeDefined();
    expect(anonymousService.migrate).toBeDefined();
  });

  describe('getMigrateTarget', () => {
    it('should return migrate data', async () => {
      // mock data and expect data
      const mockedUserData = {
        legacyUserId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
        migrated: true,
        userType: '1',
      };
      const expectMigrateTarget = {
        legacyUserId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
        migrated: true,
      };

      // mock
      const spyCollection = jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              data: jest.fn().mockReturnValue(mockedUserData),
            })),
          })),
        }));

      // expect
      const userId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      await expect(anonymousService.getMigrateTarget(userId)).resolves.toEqual(
        expectMigrateTarget,
      );
      expect(spyCollection.mock.results[0].value.doc).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('getMigrateData', () => {
    it('should return migrate data', async () => {
      // mock data and expect data
      const mockedLegacyUserData = {
        userType: 1,
        myShopCode: '841',
        favoritedProducts: [
          { productCode: '4549509524328' },
          { productCode: '4549509524399' },
        ],
      };
      const mockedListDocuments = [{ id: '123456789' }, { id: '223456789' }];
      const expectMigrateData = {
        userType: '1',
        myStoreCode: '841',
        legacyMemberId: null,
        favoriteProductCodes: ['4549509524328', '4549509524399'],
        pickupOrderIds: ['123456789', '223456789'],
      };

      // mock
      const mockedFirestore = jest.mocked(Firestore);
      const spyCollection = jest
        .spyOn(mockedFirestore.prototype, 'collection')
        .mockImplementation(() => ({
          listDocuments: jest.fn().mockResolvedValue(mockedListDocuments),
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              data: jest.fn().mockReturnValue(mockedLegacyUserData),
            })),
          })),
        }));

      // expect
      const legacyUserId = 'cdefHCgGQrhSTDCUT6unhgyogWD3';
      await expect(
        anonymousService.getMigrateData(legacyUserId),
      ).resolves.toEqual(expectMigrateData);
      expect(spyCollection).toHaveBeenNthCalledWith(1, 'users');
      expect(spyCollection).toHaveBeenNthCalledWith(
        2,
        `users/${legacyUserId}/pickup`,
      );
    });
    it('should throw error when legacy user not found', async () => {
      // mock data
      const mockedLegacyUserData = null;

      // mock
      const mockedFirestore = jest.mocked(Firestore);
      jest
        .spyOn(mockedFirestore.prototype, 'collection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              data: jest.fn().mockReturnValue(mockedLegacyUserData),
            })),
          })),
        }));

      // expect
      const legacyUserId = 'cdefHCgGQrhSTDCUT6unhgyogWD3';
      await expect(
        anonymousService.getMigrateData(legacyUserId),
      ).rejects.toThrow('can not find legacy user data');
    });
  });
});
