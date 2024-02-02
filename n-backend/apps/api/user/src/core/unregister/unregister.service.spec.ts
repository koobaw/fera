import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';

import { GlobalsModule } from '../../globals.module';
import { UnregisterService } from './unregister.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

let service: UnregisterService;

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
      UnregisterService,
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
    ],
  }).compile();

  service = module.get<UnregisterService>(UnregisterService);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('UnregisterService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('method be defined', () => {
    expect(service.deleteFromFirestore).toBeDefined();
  });

  describe('unregister', () => {
    it('should called these methods', async () => {
      const encryptedMemberId = 'dummyEncryptedMemberId';
      const mockedUserData = {
        id: 'dummyEncryptedMemberId',
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

      await service.deleteFromFirestore(encryptedMemberId);
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchDelete).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
    });

    it('should be returned error', async () => {
      const encryptedMemberId = 'dummyEncryptedMemberId';
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

      await expect(
        service.deleteFromFirestore(encryptedMemberId),
      ).rejects.toThrow(ErrorMessage[ErrorCode.UNREGISTER_ALREADY_DELETED]);
      expect(mockFirestoreBatchService.batchDelete).not.toBeCalled();
      expect(mockFirestoreBatchService.batchCommit).not.toBeCalled();
    });
  });
});
