import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { GetMembershipRankResponse } from '../../core/cartproducts/interfaces/getmembershipRank.interface';
import { GetMembershipRank } from './membershiprank.utils';

describe('GetMembershipRank', () => {
  let getmembershipRank: GetMembershipRank;
  let mockCommonService: jest.MockedObjectDeep<CommonService>;
  let mockedHttpService: jest.MockedObject<HttpService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        GetMembershipRank,
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
    getmembershipRank = module.get<GetMembershipRank>(GetMembershipRank);
    const commonService = module.get<CommonService>(CommonService);
    mockCommonService = jest.mocked<CommonService>(commonService);
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GetMembershipRankService', () => {
    it('should be defined', () => {
      expect(getmembershipRank.getMembershipRank).toBeDefined();
    });

    it('should return the membershiprank of the user', async () => {
      const mockResponse: GetMembershipRankResponse = {
        rank: '1',
      };

      jest
        .spyOn(mockedHttpService, 'get')
        .mockReturnValue(of({ data: mockResponse }));

      // assertions
      await expect(
        getmembershipRank.getMembershipRank('rank', 'auth token'),
      ).resolves.toEqual(mockResponse);
    });

    it('should return error if unable to fetch rank', async () => {
      const errorRes = {
        errorCode: 'ApiError.7010',
        errMessage: 'Unable to fetch rank',
        status: 400,
      };
      // mock so that ai throws error
      jest.spyOn(mockedHttpService, 'get').mockImplementationOnce(() =>
        throwError(
          () =>
            new AxiosError(null, null, null, null, {
              status: 400,
              data: {
                status: 400,
                errors: [{ code: 'error code', message: 'error message' }],
              },
              statusText: '',
              headers: undefined,
              config: undefined,
            }),
        ),
      );
      jest
        .spyOn(mockCommonService, 'createHttpException')
        .mockImplementation(() => {
          throw new HttpException(
            {
              errorCode: errorRes.errorCode,
              message: errorRes.errMessage,
            },
            errorRes.status,
          );
        });

      // assertions
      try {
        await expect(
          getmembershipRank.getMembershipRank('rank', 'token'),
        ).rejects.toThrow(HttpException);
      } catch (e) {
        console.log(e);
      }
    });
  });
});
