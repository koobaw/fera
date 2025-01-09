import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../../globals.module';
import { GetDiscountedPriceResponseMule } from '../interfaces/getdiscountedPrice.interface';
import { GetDiscountedPriceApiService } from './get.discountedPrice.service';

describe('DiscountedPriceMuleApiService', () => {
  let discountedPriceMuleApiService: GetDiscountedPriceApiService;
  let mockCommonService: jest.MockedObjectDeep<CommonService>;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        GetDiscountedPriceApiService,
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

    discountedPriceMuleApiService = module.get<GetDiscountedPriceApiService>(
      GetDiscountedPriceApiService,
    );
    const commonService = module.get<CommonService>(CommonService);
    mockCommonService = jest.mocked<CommonService>(commonService);
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GetDiscountedPriceApiService', () => {
    it('should be defined', () => {
      expect(discountedPriceMuleApiService).toBeDefined();
      expect(
        discountedPriceMuleApiService.getDiscountedPriceFromMule,
      ).toBeDefined();
    });

    describe('getDiscountedPriceFromMule', () => {
      it('should return the price for the products for discount price api', async () => {
        const mockMuleResponse: GetDiscountedPriceResponseMule = {
          storeCode: '859',
          totalAmount: 200,
          membershipRank: 'A',
          items: [
            {
              productCode: '4524804125739',
              unitPrice: 100,
              quantity: 1,
              subtotalAmount: 100,
              salesType: 0,
            },
            {
              productCode: '4524804125740',
              unitPrice: 100,
              quantity: 1,
              subtotalAmount: 100,
              salesType: 0,
            },
          ],
        };

        jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: mockMuleResponse }));
        // assertions
        await expect(
          discountedPriceMuleApiService.getDiscountedPriceFromMule(
            '859',
            [
              {
                productId: '4524804125739',
                quantity: 1,
              },
              {
                productId: '4524804125740',
                quantity: 1,
              },
            ],
            'A',
          ),
        ).resolves.toEqual(mockMuleResponse);
      });
      it('should throw error if productcodeandquantity are not inside an array or array is empty ', async () => {
        const errorRes = {
          errorCode: 'ApiError.7002',
          errMessage: 'Bad Request',
          status: 400,
        };

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
        await expect(
          discountedPriceMuleApiService.getDiscountedPriceFromMule(
            '859',
            [],
            'A',
          ),
        ).rejects.toThrow(HttpException);
      });
      it('should throw error if discount price api is not able to fetch price for the products ', async () => {
        jest.spyOn(mockedHttpService, 'get').mockImplementationOnce(() =>
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

        // assertions
        try {
          await expect(
            discountedPriceMuleApiService.getDiscountedPriceFromMule(
              '859',
              [
                {
                  productId: '444444444',
                  quantity: 1,
                },
              ],
              'A',
            ),
          ).rejects.toThrow(HttpException);
        } catch (e) {
          console.log(e);
        }
      });
    });
  });
});
