/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';

import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { GlobalsModule } from '../../../globals.module';
import { PointMuleApiService } from './point-mule-api.service';
import { MulePointSuccessResponse } from '../interface/mule-api.interface';

describe('PointMuleApiService', () => {
  let service: PointMuleApiService;
  let httpService: HttpService;
  let env: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [PointMuleApiService],
    }).compile();

    service = module.get<PointMuleApiService>(PointMuleApiService);
    httpService = module.get<HttpService>(HttpService);
    env = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchPoint', () => {
    it('should be defined', () => {
      expect(service.fetchPoint).toBeDefined();
    });

    it('should request to target url', async () => {
      const memberId = 'memberId';

      const response: MulePointSuccessResponse = {
        id: 'memberId',
        status: 'D',
        points: 100,
        lost: [],
        stepUp: {
          totalAmount: 1000,
          thisStage: {
            name: 'stageName',
            grantRate: 0.1,
          },
          nextStage: {
            name: 'nextStageName',
            grantRate: 0.2,
          },
          targetAmount: 0,
          url: '',
          term: '',
        },
      };

      const observableResponse = of({ data: response });

      let sendedUrl;
      jest.spyOn(httpService as any, 'get').mockImplementation((url) => {
        sendedUrl = url;
        return { pipe: jest.fn().mockReturnValue(observableResponse) };
      });

      await service.fetchPoint(memberId);

      const baseUrl = env.get<string>('MULE_EXP_YAP_API_BASE_URL');
      const endPoint = env.get<string>(
        'MULE_EXP_YAP_API_MEMBER_POINT_ENDPOINT',
      );

      const url = `${baseUrl}${endPoint}/${memberId}`;
      expect(sendedUrl).toEqual(url);
    });

    it('should response defined data', async () => {
      const memberId = 'memberId';

      const response: MulePointSuccessResponse = {
        id: 'memberId',
        status: 'D',
        points: 100,
        lost: [],
        stepUp: {
          totalAmount: 1000,
          thisStage: {
            name: 'stageName',
            grantRate: 0.1,
          },
          nextStage: {
            name: 'nextStageName',
            grantRate: 0.2,
          },
          targetAmount: 0,
          url: '',
          term: '',
        },
      };

      const observableResponse = of({ data: response });

      jest.spyOn(httpService as any, 'get').mockImplementation(() => ({
        pipe: jest.fn().mockReturnValue(observableResponse),
      }));

      const result = await service.fetchPoint(memberId);

      expect(result).toEqual(response);
    });
  });
});
