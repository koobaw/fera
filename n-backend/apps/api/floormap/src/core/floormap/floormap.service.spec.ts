import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { of, throwError } from 'rxjs';
import mysql from 'mysql2/promise';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalsModule } from '../../globals.module';
import { FloormapService } from './floormap.service';
import { FloorMapUtilService } from '../../utils/floormap-util.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

describe('FloormapService', () => {
  let service: FloormapService;
  let httpService: HttpService;
  let floorMapUtilService: FloorMapUtilService;
  const configServiceMock = {
    get: jest.fn(),
  };
  const dummyServerError = {
    errCode: ErrorCode.FLOOR_MAP_GET_MULE_API as string,
    errMessage: ErrorMessage[ErrorCode.FLOOR_MAP_GET_MULE_API] as any,
    status: 500,
  };
  const dbConfig = {
    user: 'cainz',
    database: 'test',
    password: 'test',
    host: 'mysql',
  };
  const loggingServiceMock = {
    debug: jest.fn(),
  };

  const commonServiceMock = {
    logException: jest.fn(),
    createHttpException: jest.fn(),
  };

  let httpServiceMock: jest.MockedObjectDeep<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        FloormapService,
        {
          provide: FloorMapUtilService,
          useFactory: () => ({
            getLegacyDbConfig: jest.fn(() => dbConfig),
            compareProductIds: jest.fn().mockReturnValue(true),
            getQuery: jest.fn().mockReturnValue('SELECT * FROM mock_table'),
            getFullUrl: jest.fn().mockReturnValue('https://www.testurl.com'),
            getQueryWithoutProducts: jest
              .fn()
              .mockReturnValue('SELECT * FROM mock_table'),
            handleException: jest.fn().mockReturnValue(dummyServerError),
          }),
        },
      ],
    }).compile();

    service = module.get<FloormapService>(FloormapService);

    httpService = module.get<HttpService>(HttpService);
    floorMapUtilService = module.get<FloorMapUtilService>(FloorMapUtilService);
    httpServiceMock = jest.mocked<HttpService>(httpService);
  });

  beforeAll(() => {
    service = new FloormapService(
      configServiceMock as unknown as ConfigService,
      loggingServiceMock as unknown as LoggingService,
      commonServiceMock as unknown as CommonService,
      floorMapUtilService as unknown as FloorMapUtilService,
      httpServiceMock as unknown as HttpService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(service.getFloorMapDataFromDB).toBeDefined();
  });

  describe('getFloorMapDataFromDB', () => {
    it('should fetch floor map data from the legacy database and gondolla informations', async () => {
      // Mock environment variables
      configServiceMock.get.mockReturnValueOnce('24'); // COMPANY_CODE

      // Mock database configuration
      const dbConfigMock = {
        user: 'mock_user',
        database: 'mock_db',
        password: 'mock_password',
        host: 'mock_host',
      };
      jest
        .spyOn(floorMapUtilService, 'getLegacyDbConfig')
        .mockReturnValue(dbConfigMock);

      // Mock SQL query
      jest
        .spyOn(floorMapUtilService, 'getQuery')
        .mockReturnValue('SELECT * FROM mock_table');

      // Mock connection.execute to return sample data
      const sampleData = [
        {
          title: 'test',
          url: 'Sample url',
          prd_cd: '4901301288592',
          data: '{"fill":"grey","fill-opacity":"0.5","height":"32","id":"31-049-08","width":"16","x":"2488","y":"772"}',
        },
        {
          title: 'test',
          url: 'Sample url',
          prd_cd: '4901301288592',
          data: '{"fill":"grey","fill-opacity":"0.6","height":"32","id":"31-049-09","width":"17","x":"2488","y":"772"}',
        },
      ];

      const mockConnection: Partial<mysql.Connection> = {
        execute: jest.fn().mockResolvedValue([sampleData]),
        end: jest.fn(),
      };

      jest
        .spyOn(mysql, 'createConnection')
        .mockResolvedValue(mockConnection as mysql.Connection);

      // Call the method under test
      const productIdArray = ['4901301288592'];
      const shopId = '859';
      const mockData = [
        {
          storeCode: '859',
          productCode: '4901301288592',
          locations: [
            {
              updatedOn: '2022-03-18',
              gondola: '31048149',
              aisle: 'test asile',
              tier: 1,
              row: 1,
              face: 5,
            },
          ],
          updatedOn: '2022-03-18',
          gondola: '31048149',
          aisle: 'test asile',
          tier: 1,
          row: 1,
          face: 5,
        },
      ];
      jest
        .spyOn(httpServiceMock, 'get')
        .mockReturnValue(of({ data: mockData }));
      const result = await service.getFloorMapDataFromDB(
        productIdArray,
        shopId,
      );
      // Assertions
      expect(result.data.navis[0].title).toEqual('test');
    });

    it('should fetch all floor map data from the legacy database', async () => {
      // Mock environment variables
      configServiceMock.get.mockReturnValueOnce('24'); // COMPANY_CODE

      // Mock database configuration
      const dbConfigMock = {
        user: 'mock_user',
        database: 'mock_db',
        password: 'mock_password',
        host: 'mock_host',
      };
      jest
        .spyOn(floorMapUtilService, 'getLegacyDbConfig')
        .mockReturnValue(dbConfigMock);

      // Mock SQL query
      jest
        .spyOn(floorMapUtilService, 'getQueryWithoutProducts')
        .mockReturnValue('SELECT * FROM mock_table');

      // Mock connection.execute to return sample data
      const sampleData = [
        {
          title: 'test',
          url: 'Sample url',
          prd_cd: '4901301288592',
        },
        {
          title: 'test2',
          url: 'Sample url2',
          prd_cd: '4901301288592',
        },
      ];

      const mockConnection: Partial<mysql.Connection> = {
        execute: jest.fn().mockResolvedValue([sampleData]),
        end: jest.fn(),
      };

      jest
        .spyOn(mysql, 'createConnection')
        .mockResolvedValue(mockConnection as mysql.Connection);

      // Call the method under test
      const productIdArray = ['4901301288592', '4901301288588'];
      const shopId = '859';
      const mockData = [
        {
          storeCode: '859',
          productCode: '4901301288592',
          locations: [
            {
              updatedOn: '2022-03-18',
              gondola: '31048149',
              aisle: 'test asile',
              tier: 1,
              row: 1,
              face: 5,
            },
          ],
          updatedOn: '2022-03-18',
          gondola: '31048149',
          aisle: 'test asile',
          tier: 1,
          row: 1,
          face: 5,
        },
      ];
      jest
        .spyOn(httpServiceMock, 'get')
        .mockReturnValue(of({ data: mockData }));
      const result = await service.getFloorMapDataFromDB(
        productIdArray,
        shopId,
      );
      // Assertions
      expect(result.data.navis[0].title).toEqual('test');
    });

    it('should throw errors while hitting mule API', async () => {
      // Mock environment variables
      configServiceMock.get.mockReturnValueOnce('24'); // COMPANY_CODE

      // Mock database configuration
      const dbConfigMock = {
        user: 'mock_user',
        database: 'mock_db',
        password: 'mock_password',
        host: 'mock_host',
      };
      jest
        .spyOn(floorMapUtilService, 'getLegacyDbConfig')
        .mockReturnValue(dbConfigMock);

      // Mock SQL query
      jest
        .spyOn(floorMapUtilService, 'getQuery')
        .mockReturnValue('SELECT * FROM mock_table');

      // Mock connection.execute to return sample data
      const sampleData = [
        {
          title: 'test',
          url: 'Sample url',
          prd_cd: '4901301288592',
          data: '{"fill":"grey","fill-opacity":"0.5","height":"32","id":"31-049-08","width":"16","x":"2488","y":"772"}',
        },
        {
          title: 'test',
          url: 'Sample url',
          prd_cd: '4901301288592',
          data: '{"fill":"grey","fill-opacity":"0.6","height":"32","id":"31-049-09","width":"17","x":"2488","y":"772"}',
        },
      ];

      const mockConnection: Partial<mysql.Connection> = {
        execute: jest.fn().mockResolvedValue([sampleData]),
        end: jest.fn(),
      };

      jest
        .spyOn(mysql, 'createConnection')
        .mockResolvedValue(mockConnection as mysql.Connection);

      // Call the method under test
      const productIdArray = ['123', '456'];
      const shopId = '789';

      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.FLOOR_MAP_GET_MULE_API,
          message: ErrorMessage[ErrorCode.FLOOR_MAP_GET_MULE_API],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      jest.spyOn(httpServiceMock, 'get').mockImplementationOnce(() =>
        throwError(
          () =>
            new AxiosError(null, null, null, null, {
              status: 500,
              data: {
                status: 500,
                errors: [{ code: 'error code', message: 'error message' }],
              },
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
        ),
      );

      try {
        await service.getFloorMapDataFromDB(productIdArray, shopId);
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.FLOOR_MAP_GET_MULE_API,
          message: ErrorMessage[ErrorCode.FLOOR_MAP_GET_MULE_API],
        });
      }
    });
  });
});
