/* eslint-disable @typescript-eslint/no-unused-expressions */
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';
import { Timestamp } from '@google-cloud/firestore';
import { HttpException } from '@nestjs/common';
import { GlobalsModule } from '../../../globals.module';
import { ReadMystoreService } from './read.mystore.service';

let readMystoreService: ReadMystoreService;

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

const mockMystoreFromFirestoreObject = {
  exists: true,
  data: () => ({
    myStores: [
      {
        code: '111',
        isFavoriteStore: true,
        originalCreatedAt: Timestamp.now(),
      },
    ],
  }),
};

const mockStoreFromFirestoreObject = {
  docs: [
    {
      data: () => ({
        code: '111',
        name: 'test shop',
        address: 'test address',
        businessTime: '2023-05-24T11:00:10+09:00',
      }),
    },
  ],
};

const mockDoc = {
  collection: () => ({ doc: () => mockDoc }),
  get: () => mockMystoreFromFirestoreObject,
};

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [GlobalsModule],
    providers: [
      ReadMystoreService,
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

  readMystoreService = module.get<ReadMystoreService>(ReadMystoreService);
});

beforeEach(() => {
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ReadMystoreService', () => {
  it('should be defined', () => {
    expect(ReadMystoreService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(readMystoreService.getMystore).toBeDefined();
  });

  describe('getMystore', () => {
    it('should return empty array response', async () => {
      // serviceのprivate methodをmockに上書き
      jest
        .spyOn(readMystoreService as any, 'getMystoreFromFirestore')
        .mockReturnValue({ exists: false });
      // serviceの呼び出しテスト
      const response = await readMystoreService.getMystore(
        'dummyEncryptedMemberId',
      );
      // responseの検証
      expect(response).toEqual([]);
    });
    it('should return correct response', async () => {
      // define parameters
      const expectedResponse = [
        {
          address: 'test address',
          businessTime: '2023-05-24T11:00:10+09:00',
          code: '111',
          isFavoriteStore: true,
          name: 'test shop',
          originalCreatedAt: '2023-11-09T12:27:33+09:00',
        },
      ];
      // define mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: () => mockDoc,
          where: () => ({ get: () => mockStoreFromFirestoreObject }),
        }));
      // check response
      const response = await readMystoreService.getMystore(
        'dummyEncryptedMemberId',
      );
      // timestamp部分はmockでの生成時の時間を予想できないのでoverrideして検証
      const alterTimestampResponse = response.map((data) => ({
        ...data,
        originalCreatedAt: '2023-11-09T12:27:33+09:00',
      }));
      expect(alterTimestampResponse).toEqual(expectedResponse);
    });
    it('should throw error in getMystoreFromFirestore', async () => {
      // define mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: () => {
            throw new Error(`Get mystore data from firestore is failed`);
          },
          where: () => ({ get: () => mockStoreFromFirestoreObject }),
        }));
      // check response
      expect(
        readMystoreService.getMystore('dummyEncryptedMemberId'),
      ).rejects.toThrow(HttpException);
    });
    it('should throw error in getStoreFromFirestore', async () => {
      // define mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: () => mockDoc,
          where: () => {
            throw new Error(`Get store data from firestore is failed`);
          },
        }));
      // check response
      expect(
        readMystoreService.getMystore('dummyEncryptedMemberId'),
      ).rejects.toThrow(HttpException);
    });
  });
});
