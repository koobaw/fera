import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';

import { StorageClientService } from './storage-client.service';
import { GlobalsModule } from '../../../globals.module';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

describe('StorageClientService', () => {
  let service: StorageClientService;

  const mockedStorage = {
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        createReadStream: jest.fn(),
        move: jest.fn(),
      })),
      getFiles: jest.fn(),
    })),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        StorageClientService,
        {
          provide: LoggingService,
          useFactory: () => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
          }),
        },
        {
          provide: 'Storage',
          useValue: mockedStorage,
        },
      ],
    }).compile();

    service = module.get<StorageClientService>(StorageClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined methods', () => {
    expect(service.getFile).toBeDefined();
    expect(service.getFileNameList).toBeDefined();
    expect(service.moveToArchive).toBeDefined();
    expect(service.streamFileDownload).toBeDefined();
  });

  describe('getFileNameList', () => {
    it('should be get file names', async () => {
      const expectList = ['data1.csv', 'data2.csv', 'data3.csv'];

      const mockedFiles = [
        {
          name: 'data1.csv',
          createReadStream: jest.fn().mockImplementation(),
        },
        {
          name: 'data2.csv',
          createReadStream: jest.fn().mockImplementation(),
        },
        {
          name: 'data3.csv',
          createReadStream: jest.fn().mockImplementation(),
        },
      ];

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedFiles),
        getFiles: jest.fn().mockImplementation(async () => [mockedFiles]),
      }));
      const fileNameList = await service.getFileNameList();

      expect(fileNameList).toEqual(expectList);
    });
    it('should be throw error', async () => {
      const mockedFiles = [
        {
          name: 'data1.csv',
          createReadStream: jest.fn().mockImplementation(),
        },
      ];

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedFiles),
        getFiles: jest.fn().mockRejectedValue(new Error('error')),
      }));
      await expect(service.getFileNameList()).rejects.toThrow(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_STORAGE],
      );
    });
  });

  describe('getFile', () => {
    /*
    fsがうまくmockできないので一旦保留
    */
  });

  describe('streamFileDownload', () => {
    /*
    fsがうまくmockできないので一旦保留
    */
  });

  describe('moveToArchive', () => {
    it('should be called methods', async () => {
      const fileName = 'data1.csv';
      const mockedSourceFile = {
        name: fileName,
      } as unknown as File;
      const mockedDestFile = {
        name: fileName,
        createReadStream: jest.fn().mockImplementation(),
        move: jest.fn().mockImplementation(async () => {}),
      } as unknown as File;

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedSourceFile),
        getFiles: jest.fn().mockImplementation(),
      }));

      const mockedMove = jest
        .spyOn(mockedStorage, 'bucket')
        .mockImplementation(() => ({
          file: jest.fn().mockImplementation(() => mockedDestFile),
          getFiles: jest.fn().mockImplementation(),
        }));
      await service.moveToArchive(fileName);
      expect(mockedMove).toBeCalled();
    });
    it('should be called methods with error flag', async () => {
      const fileName = 'data1.csv';
      const mockedSourceFile = {
        name: fileName,
      } as unknown as File;
      const mockedDestFile = {
        name: fileName,
        createReadStream: jest.fn().mockImplementation(),
        move: jest.fn().mockImplementation(async () => {}),
      } as unknown as File;

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedSourceFile),
        getFiles: jest.fn().mockImplementation(),
      }));

      const mockedMove = jest
        .spyOn(mockedStorage, 'bucket')
        .mockImplementation(() => ({
          file: jest.fn().mockImplementation(() => mockedDestFile),
          getFiles: jest.fn().mockImplementation(),
        }));
      await service.moveToArchive(fileName, true);
      expect(mockedMove).toBeCalled();
    });
    it('should be thrown error', async () => {
      const fileName = 'data1.csv';
      const mockedSourceFile = {
        name: fileName,
      } as unknown as File;
      const mockedDestFile = {
        name: fileName,
        createReadStream: jest.fn().mockImplementation(),
        move: jest.fn().mockRejectedValue(new Error('error')),
      } as unknown as File;

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedSourceFile),
        getFiles: jest.fn().mockImplementation(),
      }));

      jest.spyOn(mockedStorage, 'bucket').mockImplementation(() => ({
        file: jest.fn().mockImplementation(() => mockedDestFile),
        getFiles: jest.fn().mockImplementation(),
      }));
      await expect(service.moveToArchive(fileName)).rejects.toThrow(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_ARCHIVE],
      );
    });
  });
});
