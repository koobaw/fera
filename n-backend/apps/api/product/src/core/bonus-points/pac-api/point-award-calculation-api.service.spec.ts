import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@cainz-next-gen/logging';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { INestApplication } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { PointAwardCalculationApiService } from './point-award-calculation-api.service';
import { GlobalsModule } from '../../../globals.module';
import { ErrorMessage, ErrorCode } from '../../../types/constants/error-code';

describe('PointAwardCalculationApiService', () => {
  let app: INestApplication;
  let service: PointAwardCalculationApiService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  let mockedEnv: jest.MockedObjectDeep<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        PointAwardCalculationApiService,
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
      ],
    }).compile();

    service = module.get<PointAwardCalculationApiService>(
      PointAwardCalculationApiService,
    );
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
    const configService = module.get<ConfigService>(ConfigService);
    mockedEnv = jest.mocked<ConfigService>(configService);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPoint', () => {
    const storeCodes = ['123'];
    const productIds = ['456'];
    const membershipRank = '1';

    it('should send request with correct headers, URL and body', async () => {
      const mockResponse = {
        data: { RESULT_CODE: '0000' },
      };
      const postSpy = jest
        .spyOn(mockedHttpService, 'post')
        .mockImplementationOnce(() => of(mockResponse as AxiosResponse));

      await service.getPoint(storeCodes, productIds, membershipRank);

      const expectedUrl = `${mockedEnv.get('PAC_BASE_URL')}${mockedEnv.get(
        'PAC_PRODUCT_ENDPOINT',
      )}`;

      // 期待されるリクエストボディを構築
      const expectedBody = {
        STORE_CODE: { STORE1: storeCodes[0] },
        JAN_CODE: { JAN1: productIds[0] },
        MEMBER_RANK: membershipRank,
      };

      expect(postSpy).toHaveBeenCalledWith(
        expectedUrl,
        expectedBody,
        expect.objectContaining({
          headers: {
            'x-api-key': mockedEnv.get('PAC_API_KEY'),
            'Content-Type': 'text/plain',
          },
        }),
      );
    });

    it('should return data when response is successful', async () => {
      const mockResponse = {
        data: { RESULT_CODE: '0000' },
      };
      jest
        .spyOn(mockedHttpService, 'post')
        .mockImplementationOnce(() => of(mockResponse as AxiosResponse));

      const result = await service.getPoint(
        storeCodes,
        productIds,
        membershipRank,
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when response is not successful', async () => {
      const mockErrorResponse = {
        data: { RESULT_CODE: '1000', RESULT_MESSAGE: 'Error' },
      };
      jest
        .spyOn(mockedHttpService, 'post')
        .mockImplementationOnce(() => of(mockErrorResponse as AxiosResponse));
      await expect(
        service.getPoint(storeCodes, productIds, membershipRank),
      ).rejects.toThrow(ErrorMessage[ErrorCode.BONUS_POINT_NG_PAC_API]);
    });

    it('should throw an error when http request fails', async () => {
      jest
        .spyOn(mockedHttpService, 'post')
        .mockImplementationOnce(() =>
          throwError(() => new Error('Network error')),
        );

      await expect(
        service.getPoint(storeCodes, productIds, membershipRank),
      ).rejects.toThrow(ErrorMessage[ErrorCode.BONUS_POINT_NG_PAC_API]);
    });
  });
});
