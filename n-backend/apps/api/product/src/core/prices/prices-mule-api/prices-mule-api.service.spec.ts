import { of } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../../globals.module';
import { FindPricesDto } from '../dto/find.prices.dto';
import { PricesMuleApiService } from './prices-mule-api.service';
import { MuleProductPriceSuccessResponse } from '../interfaces/price.interface';

describe('PricesMuleApiService', () => {
  let muleApiService: PricesMuleApiService;
  let mockedEnv: jest.MockedObjectDeep<ConfigService>;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        PricesMuleApiService,
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

    muleApiService = module.get<PricesMuleApiService>(PricesMuleApiService);
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
    const configService = module.get<ConfigService>(ConfigService);
    mockedEnv = jest.mocked<ConfigService>(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PricesMuleApiService', () => {
    it('should be defined', () => {
      expect(muleApiService).toBeDefined();
      expect(muleApiService.fetchPrices).toBeDefined();
    });

    describe('fetchPrices', () => {
      it('should require one product data', async () => {
        const findPricesDto: FindPricesDto = {
          productIds: ['4524804125739'],
          storeCodes: ['815'],
          membershipRank: '3',
        };
        const muleResponse: MuleProductPriceSuccessResponse[] = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            membershipRank: '3',
            price: 400,
            salePrice: null,
          },
        ];

        jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        await expect(
          muleApiService.fetchPrices(findPricesDto),
        ).resolves.toEqual(muleResponse);
      });

      it('should allow two product data', async () => {
        const dto: FindPricesDto = {
          productIds: ['4524804125739', '4549509677314'],
          storeCodes: ['815', '816'],
          membershipRank: '3',
        };

        const muleResponse: MuleProductPriceSuccessResponse[] = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            membershipRank: '3',
            price: 400,
            salePrice: null,
          },
          {
            productCode: '4524804125739',
            storeCode: '816',
            membershipRank: '3',
            price: 400,
            salePrice: null,
          },
          {
            productCode: '4549509677314',
            storeCode: '815',
            membershipRank: '3',
            price: 5000,
            salePrice: 4000,
          },
          {
            productCode: '4549509677314',
            storeCode: '816',
            membershipRank: '3',
            price: 5000,
            salePrice: 4000,
          },
        ];

        jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        await expect(muleApiService.fetchPrices(dto)).resolves.toEqual(
          muleResponse,
        );
      });

      it('should require {url, headers, params} when send http request to mule api', async () => {
        const findPricesDto: FindPricesDto = {
          productIds: ['4524804125739'],
          storeCodes: ['815'],
          membershipRank: '3',
        };
        const muleResponse: MuleProductPriceSuccessResponse[] = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            membershipRank: '3',
            price: 400,
            salePrice: null,
          },
        ];

        const spyHttpGet = jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        await muleApiService.fetchPrices(findPricesDto);

        const url = `${mockedEnv.get<string>(
          'MULE_API_BASE_URL',
        )}${mockedEnv.get<string>('MULE_API_PRICE_ENDPOINT')}`;
        const headers = {
          client_id: mockedEnv.get<string>('MULE_API_CLIENT_ID'),
          client_secret: mockedEnv.get<string>('MULE_API_CLIENT_SECRET'),
        };
        const params = {
          products: findPricesDto.productIds.join(','),
          stores: findPricesDto.storeCodes.join(','),
          rank: findPricesDto.membershipRank,
        };
        expect(spyHttpGet).toHaveBeenCalledWith(url, { headers, params });
      });
    });
  });
});
