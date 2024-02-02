/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggingService } from '@cainz-next-gen/logging';

import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { GlobalsModule } from '../../globals.module';
import { ProductExtendDescriptionImportService } from './product-extend-description-import.service';
import { StorageClientService } from './storage-client/storage-client.service';

describe('ProductExtendDescriptionImportService', () => {
  let service: ProductExtendDescriptionImportService;

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
    getFileNameList: jest.fn(),
    getFile: jest.fn(),
    streamFileDownload: jest.fn(),
    moveToArchive: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        ProductExtendDescriptionImportService,
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
            error: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<ProductExtendDescriptionImportService>(
      ProductExtendDescriptionImportService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined method', () => {
    expect(service.import).toBeDefined();
    expect(service.parseFile).toBeDefined();
  });

  describe('import', () => {
    it('should be called method', async () => {
      const mockedFileNameList = ['import_data.csv'];
      jest
        .spyOn(mockStorageClientService, 'getFileNameList')
        .mockImplementation(() => mockedFileNameList);

      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'UTF8');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => false);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.import();
      expect(mockedDetectEncoding).toBeCalled();
      expect(mockedReadCSV).toBeCalled();
      expect(mockedDeleteTempFile).toBeCalled();
    });

    it('should be called method number of files times', async () => {
      const mockedFileNameList = ['import_data1.csv', 'import_data2.csv'];
      jest
        .spyOn(mockStorageClientService, 'getFileNameList')
        .mockImplementation(() => mockedFileNameList);

      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'UTF8');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => false);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.import();
      expect(mockedDetectEncoding).toBeCalledTimes(2);
      expect(mockedReadCSV).toBeCalledTimes(2);
      expect(mockedDeleteTempFile).toBeCalledTimes(2);
    });
  });

  describe('parseFile', () => {
    it('should be called methods success pattern', async () => {
      const testFileName = 'data.csv';
      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'UTF8');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => false);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.parseFile(testFileName);
      expect(mockedDetectEncoding).toBeCalled();
      expect(mockedReadCSV).toBeCalled();
      expect(mockedDeleteTempFile).toBeCalled();
      expect(mockStorageClientService.moveToArchive).toBeCalled();
    });

    it('should be called methods invalid filename', async () => {
      const testFileName = '';
      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'UTF8');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => false);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.parseFile(testFileName);
      expect(mockedDetectEncoding).not.toBeCalled();
      expect(mockedReadCSV).not.toBeCalled();
      expect(mockedDeleteTempFile).not.toBeCalled();
      expect(mockStorageClientService.moveToArchive).toBeCalled();
    });

    it('should be called methods invalid file type', async () => {
      const testFileName = 'invalid.json';
      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'UTF8');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => true);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.parseFile(testFileName);
      expect(mockedDetectEncoding).not.toBeCalled();
      expect(mockedReadCSV).not.toBeCalled();
      expect(mockedDeleteTempFile).not.toBeCalled();
      expect(mockStorageClientService.moveToArchive).toBeCalled();
    });

    it('should be called methods invalid encode type', async () => {
      const testFileName = 'invalid_encoding.csv';
      jest
        .spyOn(mockStorageClientService, 'getFile')
        .mockImplementation(async () => {});

      jest
        .spyOn(mockStorageClientService, 'moveToArchive')
        .mockImplementation(async () => {});

      const mockedDetectEncoding = jest
        .spyOn(service as any, 'detectEncoding')
        .mockImplementation(async () => 'SJIS');

      const mockedReadCSV = jest
        .spyOn(service as any, 'readCSV')
        .mockImplementation(async () => true);

      const mockedDeleteTempFile = jest
        .spyOn(service as any, 'deleteTempFile')
        .mockImplementation(async () => {});

      await service.parseFile(testFileName);
      expect(mockedDetectEncoding).toBeCalled();
      expect(mockedReadCSV).not.toBeCalled();
      expect(mockedDeleteTempFile).not.toBeCalled();
      expect(mockStorageClientService.moveToArchive).toBeCalled();
    });
  });
});
