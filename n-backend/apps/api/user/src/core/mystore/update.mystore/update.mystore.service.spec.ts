import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';
import firestore from '@google-cloud/firestore';

import { Mystore } from '@fera-next-gen/types';
import { GlobalsModule } from '../../../globals.module';
import { UpdateMystoreService } from './update.mystore.service';
import { MystoreMuleApiService } from '../mystore-mule-api/mystore-mule-api.service';

let updateMystoreService: UpdateMystoreService;
let mystoreMuleApiService: MystoreMuleApiService;

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [GlobalsModule],
    providers: [
      UpdateMystoreService,
      MystoreMuleApiService,
      {
        provide: FirestoreBatchService,
        useFactory: () => mockFirestoreBatchService,
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

  updateMystoreService = module.get<UpdateMystoreService>(UpdateMystoreService);
  mystoreMuleApiService = module.get<MystoreMuleApiService>(
    MystoreMuleApiService,
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('updateMystoreService', () => {
  it('should be defined', () => {
    expect(updateMystoreService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(updateMystoreService.getMystoreFromMule).toBeDefined();
    expect(updateMystoreService.userExists).toBeDefined();
    expect(updateMystoreService.saveToFirestoreMystore).toBeDefined();
  });

  describe('getMystoreFromMule', () => {
    it('should be called api', async () => {
      const muleResponse = [
        {
          createdById: 'test',
          createdDate: '2022-12-01T00:00:03Z',
          id: 'ovn2y83r2y800rgaSjn',
          isDeleted: false,
          lastActivityDate: '2023-01-01T00:00:03Z',
          lastModifiedById: 'test',
          lastModifiedDate: '2023-01-01T00:00:03Z',
          lastReferencedDate: '2023-01-01T00:00:03Z',
          lastViewedDate: '2023-01-01T00:00:03Z',
          name: '',
          ownerId: '',
          systemModstamp: '2023-01-01T00:00:03Z',
          accountId: '',
          favoriteStoreFlag: false,
          storeCode: '859',
          storeId: '',
          store: {
            name: 'fera朝霞店',
          },
        },
      ];
      jest
        .spyOn(mystoreMuleApiService, 'getMystoreFromMule')
        .mockImplementation(async () => muleResponse);

      const expectedData: Mystore[] = [
        {
          code: '859',
          isFavoriteStore: false,
          originalCreatedAt: firestore.Timestamp.fromDate(
            new Date('2022-12-01T00:00:03Z'),
          ),
        },
      ];

      const response = await updateMystoreService.getMystoreFromMule(
        'dummyUser',
      );
      expect(response).toEqual(expectedData);
    });
  });
  it('should be return empty', async () => {
    const muleResponse = [
      {
        createdById: 'test',
        createdDate: '2022-12-01T00:00:03Z',
        id: 'ovn2y83r2y800rgaSjn',
        isDeleted: true,
        lastActivityDate: '2023-01-01T00:00:03Z',
        lastModifiedById: 'test',
        lastModifiedDate: '2023-01-01T00:00:03Z',
        lastReferencedDate: '2023-01-01T00:00:03Z',
        lastViewedDate: '2023-01-01T00:00:03Z',
        name: '',
        ownerId: '',
        systemModstamp: '2023-01-01T00:00:03Z',
        accountId: '',
        favoriteStoreFlag: false,
        storeCode: '859',
        storeId: '',
        store: {
          name: 'fera朝霞店',
        },
      },
    ];
    jest
      .spyOn(mystoreMuleApiService, 'getMystoreFromMule')
      .mockImplementation(async () => muleResponse);

    const expectedData: Mystore[] = [];

    const response = await updateMystoreService.getMystoreFromMule('dummyUser');
    expect(response).toEqual(expectedData);
  });

  describe('checkUserExist', () => {
    it('should return false', async () => {
      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => {
              const result = {
                exists: false,
              };
              return result;
            }),
          })),
        }));

      // expect
      const userId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      await expect(updateMystoreService.userExists(userId)).resolves.toBe(
        false,
      );
    });

    it('should return true', async () => {
      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => {
              const result = {
                exists: true,
              };
              return result;
            }),
          })),
        }));

      // expect
      const userId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      await expect(updateMystoreService.userExists(userId)).resolves.toBe(true);
    });
  });

  describe('saveToFirestoreMystore', () => {
    it('should be method called', async () => {
      const mockOldData: Mystore[] = [
        {
          code: '813',
          isFavoriteStore: false,
          originalCreatedAt: firestore.Timestamp.fromDate(
            new Date('2022-12-01T00:00:03Z'),
          ),
        },
      ];

      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn().mockImplementation(() => ({
                get: jest.fn().mockImplementation(() => ({
                  data: jest.fn().mockReturnValue(mockOldData),
                })),
              })),
            })),
          })),
        }));

      const mockData: Mystore[] = [
        {
          code: '859',
          isFavoriteStore: false,
          originalCreatedAt: firestore.Timestamp.fromDate(
            new Date('2022-12-01T00:00:03Z'),
          ),
        },
      ];

      await updateMystoreService.saveToFirestoreMystore(
        'dummyId',
        mockData,
        'operatorName',
      );
      expect(mockFirestoreBatchService.batchSet).toBeCalled();
      expect(mockFirestoreBatchService.batchCommit).toBeCalled();
    });
  });
});
