import { Request } from 'express';
import { OmitTimestampPartialProductPrice } from '@fera-next-gen/types';

import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { FindPricesDto } from './dto/find.prices.dto';
import { PricesMuleApiService } from './prices-mule-api/prices-mule-api.service';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

describe('PricesController', () => {
  let controller: PricesController;
  let pricesService: PricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [PricesController],
      providers: [
        {
          provide: PricesService,
          useValue: {
            fetchPrices: jest.fn(),
            saveToFirestore: jest.fn(),
          },
        },
        PricesMuleApiService,
      ],
    }).compile();

    pricesService = module.get<PricesService>(PricesService);
    controller = module.get<PricesController>(PricesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.findPrices).toBeDefined();
  });

  describe('findPrices', () => {
    it('should be called these method to save firestore when access from non-web', async () => {
      jest.spyOn(pricesService, 'fetchPrices').mockImplementation(async () => {
        const result: Array<OmitTimestampPartialProductPrice> = [{}];
        return result;
      });
      jest.spyOn(pricesService, 'saveToFirestore');
      const dummyFindPricesDto: FindPricesDto = {
        productIds: ['4524804125739'],
        storeCodes: ['815'],
        membershipRank: '0',
      };
      const req: Request = {
        originalUrl: 'dummy_url',
        method: 'GET',
      } as Request;
      await controller.findPrices(req, dummyFindPricesDto, true);
      expect(pricesService.fetchPrices).toBeCalled();
      expect(pricesService.saveToFirestore).toBeCalled();
    });
    it('should not be called these method to be not save firestore when access from web', async () => {
      jest.spyOn(pricesService, 'fetchPrices').mockImplementation(async () => {
        const result: Array<OmitTimestampPartialProductPrice> = [{}];
        return result;
      });
      jest.spyOn(pricesService, 'saveToFirestore');
      const dummyFindPricesDto: FindPricesDto = {
        productIds: ['4524804125739'],
        storeCodes: ['815'],
        membershipRank: '0',
      };
      const req: Request = {
        originalUrl: 'dummy url',
        method: 'GET',
      } as Request;
      await controller.findPrices(req, dummyFindPricesDto, false);
    });
  });
});
