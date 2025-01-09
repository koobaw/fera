import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { OmitTimestampPartialProductPrice } from '@fera-next-gen/types';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { FindPricesDto } from './dto/find.prices.dto';
import { MuleProductPriceSuccessResponse } from './interfaces/price.interface';
import { PricesMuleApiService } from './prices-mule-api/prices-mule-api.service';
import { PricesService } from './prices.service';

let pricesService: PricesService;
let pricesMuleApiService: PricesMuleApiService;

const mockFirestoreBatchService = {
  findCollection: jest.fn(() => ({
    doc: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn() })) })),
  })),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [GlobalsModule],
    providers: [
      PricesService,
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
      {
        provide: FirestoreBatchService,
        useFactory: () => mockFirestoreBatchService,
      },
    ],
  }).compile();

  pricesService = module.get(PricesService);
  pricesMuleApiService = module.get<PricesMuleApiService>(PricesMuleApiService);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PricesService', () => {
  it('should be defined', () => {
    expect(pricesService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(pricesService.fetchPrices).toBeDefined();
    expect(pricesService.saveToFirestore).toBeDefined();
  });

  describe('fetchPrices', () => {
    it('should be called api', async () => {
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
        .spyOn(pricesMuleApiService, 'fetchPrices')
        .mockImplementation(async () => muleResponse);
      await pricesService.fetchPrices(findPricesDto);
      expect(pricesMuleApiService.fetchPrices).toHaveBeenCalled();
    });

    it('should be returned transformed response', async () => {
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
      const result: OmitTimestampPartialProductPrice[] = [
        {
          productId: '4524804125739',
          storeCode: '815',
          membershipRank: '3',
          priceIncludingTax: 400,
        },
      ];
      jest
        .spyOn(pricesMuleApiService, 'fetchPrices')
        .mockImplementation(async () => muleResponse);

      await expect(pricesService.fetchPrices(findPricesDto)).resolves.toEqual(
        result,
      );
    });
  });

  describe('saveToFirestore', () => {
    it('should be called these methods', async () => {
      const products: Array<OmitTimestampPartialProductPrice> = [
        {
          productId: '4524804125739',
          storeCode: '815',
          membershipRank: '0',
          priceIncludingTax: 1000,
        },
        {
          productId: '4524804125739',
          storeCode: '815',
          membershipRank: '0',
          priceIncludingTax: 1000,
        },
      ];
      await pricesService.saveToFirestore(products, 'operatorName');

      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalled();
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(2);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalled();
    });

    it('should use "store_membership" name in the documentPath', async () => {
      const products = [
        {
          productId: '4524804125739',
          storeCode: '815',
          membershipRank: '0',
          priceIncludingTax: 1000,
        },
        {
          productId: '4524804125739',
          storeCode: '815',
          membershipRank: '0',
          priceIncludingTax: 1000,
        },
      ];
      const documentPaths = [];
      const mockDoc = jest.fn((tableKey) => {
        documentPaths.push(tableKey);
      });

      mockFirestoreBatchService.findCollection.mockImplementation(() => ({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({ doc: mockDoc })),
        })),
      }));
      await pricesService.saveToFirestore(products, 'operatorName');

      documentPaths.forEach((concreteDocumentPath, index) => {
        const product = products[index];
        const documentPath = `${product.storeCode}_${product.membershipRank}`;
        expect(concreteDocumentPath).toEqual(documentPath);
      });
    });
  });
});
