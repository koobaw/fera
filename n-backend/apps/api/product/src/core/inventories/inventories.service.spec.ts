import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';

import { GlobalsModule } from '../../globals.module';
import { FindInventoriesDto } from './dto/find.inventories.dto';
import { InventoriesService } from './inventories.service';
import { MuleProductInventoryResponseSuccess } from './interfaces/mule-api.interface';
import { InventoriesMuleApiService } from './inventories-mule-api/inventories-mule-api.service';
import { InventoryResponse } from './interfaces/inventory.interface';

describe('InventoriesService', () => {
  let service: InventoriesService;
  let muleService: InventoriesMuleApiService;

  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(() => ({ collection: jest.fn(() => ({ doc: jest.fn() })) })),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        InventoriesService,
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
        {
          provide: FirestoreBatchService,
          useValue: mockFirestoreBatchService,
        },
      ],
    }).compile();

    service = module.get<InventoriesService>(InventoriesService);
    muleService = module.get<InventoriesMuleApiService>(
      InventoriesMuleApiService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('InventoriesService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be defined method', () => {
      expect(service.fetchInventories).toBeDefined();
      expect(service.saveToFirestore).toBeDefined();
    });

    describe('fetchInventories', () => {
      it('should be called api', async () => {
        const findInventoriesDto: FindInventoriesDto = {
          productIds: ['4549509524328'],
          storeCodes: ['826'],
        };
        const coefficient = 1.0;
        const muleResponse: Array<MuleProductInventoryResponseSuccess> = [
          {
            productCode: '4549509524328',
            storeCode: '826',
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
          .spyOn(muleService, 'fetchInventories')
          .mockImplementation(async () => muleResponse);
        await service.fetchInventories(findInventoriesDto, coefficient);
        expect(muleService.fetchInventories).toHaveBeenCalled();
      });

      it('should be returned transformed response', async () => {
        const findInventoriesDto: FindInventoriesDto = {
          productIds: ['4549509524328'],
          storeCodes: ['826', '840'],
        };
        const coefficient = 1.0;
        const muleResponse: Array<MuleProductInventoryResponseSuccess> = [
          {
            productCode: '4549509524328',
            storeCode: '826',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11',
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
          {
            productCode: '4549509524328',
            storeCode: '840',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 0,
            updatedAt: '2023-04-11T19:22:03+09:00',
          },
        ];
        const result: Array<InventoryResponse> = [
          {
            productId: '4549509524328',
            storeCode: '826',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11T00:00:00+09:00',
          },
          {
            productId: '4549509524328',
            storeCode: '840',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 0,
          },
        ];
        jest
          .spyOn(muleService, 'fetchInventories')
          .mockImplementation(async () => muleResponse);
        await expect(
          service.fetchInventories(findInventoriesDto, coefficient),
        ).resolves.toEqual(result);
      });
    });

    describe('saveToFirestore', () => {
      it('should be called these methods', async () => {
        const products: Array<InventoryResponse> = [
          {
            productId: '4549509524328',
            storeCode: '826',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 2,
            expectedArrivalDate: '2023-04-11T00:00:00+09:00',
          },
          {
            productId: '4549509524328',
            storeCode: '840',
            quantityOpening: 3,
            quantitySold: 1,
            quantityAvailable: 1,
            quantityAllocated: 1,
            quantityExpected: 0,
          },
        ];
        await service.saveToFirestore(products, 'operatorName');

        expect(mockFirestoreBatchService.findCollection).toHaveBeenCalled();
        expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(2);
        expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalled();
      });
    });
  });
});
