import { of } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../../globals.module';
import { FindInventoriesDto } from '../dto/find.inventories.dto';
import { InventoriesMuleApiService } from './inventories-mule-api.service';

describe('InventoriesMuleApiService', () => {
  let muleApiService: InventoriesMuleApiService;
  let mockedEnv: jest.MockedObjectDeep<ConfigService>;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        InventoriesMuleApiService,
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

    muleApiService = module.get<InventoriesMuleApiService>(
      InventoriesMuleApiService,
    );
    const httpService = module.get<HttpService>(HttpService);
    mockedHttpService = jest.mocked<HttpService>(httpService);
    const configService = module.get<ConfigService>(ConfigService);
    mockedEnv = jest.mocked<ConfigService>(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('InventoriesMuleApiService', () => {
    it('should be defined', () => {
      expect(muleApiService).toBeDefined();
      expect(muleApiService.fetchInventories).toBeDefined();
    });

    describe('fetchInventories', () => {
      it('should require one product data', async () => {
        const findInventoriesDto: FindInventoriesDto = {
          productIds: ['4524804125739'],
          storeCodes: ['815'],
        };
        const coefficient = 1.0;
        const muleResponse = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11',
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
        ];

        jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        expect(
          muleApiService.fetchInventories(findInventoriesDto, coefficient),
        ).resolves.toEqual(muleResponse);
      });

      it('should allow two product data', async () => {
        const dto: FindInventoriesDto = {
          productIds: ['4524804125739', '4549509677314'],
          storeCodes: ['815', '816'],
        };
        const coefficient = 1.0;

        const muleResponse = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11',
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
          {
            productCode: '4524804125739',
            storeCode: '816',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11',
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
          {
            productCode: '4549509677314',
            storeCode: '815',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 0,
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
          {
            productCode: '4549509677314',
            storeCode: '816',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 0,
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
        ];

        jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        await expect(
          muleApiService.fetchInventories(dto, coefficient),
        ).resolves.toEqual(muleResponse);
      });

      it('should require {url, headers} when send http request to mule api', async () => {
        const findInventoriesDto: FindInventoriesDto = {
          productIds: ['4524804125739'],
          storeCodes: ['815'],
        };
        const coefficient = 1.0;
        const muleResponse = [
          {
            productCode: '4524804125739',
            storeCode: '815',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11',
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
        ];

        const spyHttpGet = jest
          .spyOn(mockedHttpService, 'get')
          .mockReturnValue(of({ data: muleResponse }));

        await muleApiService.fetchInventories(findInventoriesDto, coefficient);

        const url = `${mockedEnv.get<string>(
          'MULE_API_BASE_URL',
        )}${mockedEnv.get<string>(
          'MULE_API_INVENTORY_ENDPOINT',
        )}?stores=${findInventoriesDto.storeCodes.join(
          ',',
        )}&products=${findInventoriesDto.productIds.join(
          ',',
        )}&coefficient=${coefficient}`;
        const headers = {
          client_id: mockedEnv.get<string>('MULE_API_CLIENT_ID'),
          client_secret: mockedEnv.get<string>('MULE_API_CLIENT_SECRET'),
        };

        expect(spyHttpGet).toHaveBeenCalledWith(url, { headers });
      });
    });
  });
});
