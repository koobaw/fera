import { of } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { CommonService } from '@cainz-next-gen/common';
import { SalesforceApiService } from './salesforce-api.service';

describe('SalesforceApisalesforceApiService', () => {
  let salesforceApiService: SalesforceApiService;

  const httpService = new HttpService();
  const mockedHttpService = jest.mocked<HttpService>(httpService);

  const mockEnv = {
    get: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(() => {
    const loggingService = new LoggingService();
    const commonService = new CommonService(loggingService);
    salesforceApiService = new SalesforceApiService(
      mockedHttpService,
      mockEnv,
      loggingService,
      commonService,
    );
  });

  it('should be defined', () => {
    expect(salesforceApiService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(salesforceApiService.getSalesforceUserId).toBeDefined();
    expect(salesforceApiService.getUserToken).toBeDefined();
  });

  it('should be returned tokens', async () => {
    const responseData = {
      access_token: 'accessToken',
      refresh_token: 'refreshToken',
    };
    jest
      .spyOn(mockedHttpService, 'post')
      .mockReturnValue(of({ data: responseData }));

    const mockedEnv = jest.mocked(mockEnv);
    mockedEnv.get.mockImplementation(() => 'dummyCode');

    const result = await salesforceApiService.getUserToken('dummyCode');

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    });
  });
});
