import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { FieldValue } from 'firebase-admin/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';

import { AnonymousUser, UserType } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import { GlobalsModule } from '../../globals.module';
import { AnonymousService } from './anonymous.service';

let anonymousService: AnonymousService;
let commonService: CommonService;

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
  commonService = module.get<CommonService>(CommonService);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('anonymousService', () => {
  it('should be defined', () => {
    expect(anonymousService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(anonymousService.isUserExist).toBeDefined();
    expect(anonymousService.createDefaultUserData).toBeDefined();
    expect(anonymousService.saveToFirestore).toBeDefined();
    expect(anonymousService.pushToTaskQueue).toBeDefined();
  });

  describe('isUserExist', () => {
    it('should return false', async () => {
      // mock data and expect data
      const mockedEmptyData = undefined;
      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              data: jest.fn().mockReturnValue(mockedEmptyData),
            })),
          })),
        }));

      // expect
      const userId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      await expect(anonymousService.isUserExist(userId)).resolves.toBe(false);
    });

    it('should return true', async () => {
      // mock data and expect data
      const mockedUserData = {
        id: 'xxxxHCgGQrhSTDCUT6unhgyogWD3',
      };
      // mock
      jest
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
      await expect(anonymousService.isUserExist(userId)).resolves.toBe(true);
    });
  });

  describe('createDefaultUserData', () => {
    it('should return default user data', async () => {
      const anonymousUserId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      const operatorName = 'some Operator';
      const DEFAULT_USER_TYPE: UserType = 'anonymous';

      const expectedUser = {
        id: anonymousUserId,
        userType: DEFAULT_USER_TYPE,
        storeCodeInUse: '814',
        legacyMemberId: null,
        lastApplicationStartDate: null,
        lastCheckCampaignTime: null,
        lastCheckAnnouncementTime: null,
        lastCheckTonakaiTime: null,
        lastCheckTvTime: null,
        reviewDisable: false,
        reviewSkipAt: null,
        cartInUse: null,
        createdBy: operatorName,
        createdAt: '',
        updatedBy: operatorName,
        updatedAt: '',
      };

      const userData = anonymousService.createDefaultUserData(
        anonymousUserId,
        operatorName,
      );
      const omitTimeUserData = {
        ...userData,
        createdAt: '',
        updatedAt: '',
      };
      expect(omitTimeUserData).toEqual(expectedUser);
    });
  });

  describe('saveToFirestore', () => {
    it('should called these methods', async () => {
      const anonymousUserId = 'xxxxHCgGQrhSTDCUT6unhgyogWD3';
      const operatorName = 'some Operator';
      const DEFAULT_USER_TYPE: UserType = 'anonymous';

      const mockUser: AnonymousUser = {
        id: anonymousUserId,
        userType: DEFAULT_USER_TYPE,
        storeCodeInUse: '813',
        legacyMemberId: null,
        lastApplicationStartDate: null,
        lastCheckCampaignTime: null,
        lastCheckAnnouncementTime: null,
        lastCheckTonakaiTime: null,
        lastCheckTvTime: null,
        reviewDisable: false,
        reviewSkipAt: null,
        cartInUse: null,
        createdBy: operatorName,
        createdAt: FieldValue.serverTimestamp(),
        updatedBy: operatorName,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await anonymousService.saveToFirestore(anonymousUserId, mockUser);
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('pushToTaskQueue', () => {
    it('should push task to queue', async () => {
      jest.spyOn(commonService, 'createTask').mockResolvedValue();
      await expect(
        anonymousService.pushToTaskQueue(
          'dummyUserId',
          'dummyBearerHeader',
          'dummyCorrelationId',
        ),
      ).resolves.not.toThrow();
    });
  });
});
