import { LoggingService } from '@fera-next-gen/logging';

import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { GlobalsModule } from '../../globals.module';
import { FlyerImportService } from './flyer-import.service';
import { StorageClientService } from './storage-client/storage-client.service';

describe('FlyerImportService', () => {
  let service: FlyerImportService;

  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  const mockStorageClientService = {
    generateSignedUrl: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        FlyerImportService,
        {
          provide: StorageClientService,
          useValue: mockStorageClientService,
        },
        {
          provide: FirestoreBatchService,
          useValue: mockFirestoreBatchService,
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

    service = module.get<FlyerImportService>(FlyerImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
