import { Test, TestingModule } from '@nestjs/testing';
import { OmitTimestampProductPrice } from '@cainz-next-gen/types';
import { UnionService } from './union.service';
import { DetailService } from '../detail/detail.service';
import { PricesService } from '../prices/prices.service';
import { InventoriesService } from '../inventories/inventories.service';
import { ProductSelect } from './dto/find.union-query.dto';
import { InterProductDetails } from '../detail/interfaces/detail.interface';
import { InventoryResponse } from '../inventories/interfaces/inventory.interface';

describe('UnionService', () => {
  let service: UnionService;
  let mockDetailService: jest.Mocked<DetailService>;
  let mockPricesService: jest.Mocked<PricesService>;
  let mockInventoriesService: jest.Mocked<InventoriesService>;

  beforeEach(async () => {
    mockDetailService = {
      getDetail: jest.fn(),
      saveToFirestore: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<DetailService>;
    mockPricesService = {
      fetchPrices: jest.fn(),
      saveToFirestore: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<PricesService>;
    mockInventoriesService = {
      fetchInventories: jest.fn(),
      saveToFirestore: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<InventoriesService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnionService,
        {
          provide: DetailService,
          useValue: mockDetailService,
        },
        {
          provide: PricesService,
          useValue: mockPricesService,
        },
        {
          provide: InventoriesService,
          useValue: mockInventoriesService,
        },
      ],
    }).compile();

    service = module.get<UnionService>(UnionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // fetchDetails関連のテスト
  describe('fetchDetails', () => {
    // DetailServiceから商品の詳細情報を取得するテスト
    it('should fetch product details from DetailService', async () => {
      const productIds = ['123', '456'];
      const mockDetails = [];

      mockDetailService.getDetail.mockResolvedValue(mockDetails);

      const result = await service.fetchDetails({ productIds });

      expect(result).toEqual(mockDetails);
      expect(mockDetailService.getDetail).toHaveBeenCalledWith({ productIds });
    });
  });

  // fetchPrices関連のテスト
  describe('fetchPrices', () => {
    const productIds = ['123'];
    const storeCodes = ['0888'];
    const membershipRank = '1';

    // ProductSelect.PRICEが選択された場合に価格情報を取得するテスト
    it('should fetch prices when PRICE is selected', async () => {
      const select = [ProductSelect.PRICE];
      const mockPrices = [];

      mockPricesService.fetchPrices.mockResolvedValue(mockPrices);

      const result = await service.fetchPrices(
        { productIds },
        { storeCodes, membershipRank, select },
      );

      expect(result).toEqual(mockPrices);
      expect(mockPricesService.fetchPrices).toHaveBeenCalledWith({
        productIds,
        storeCodes,
        membershipRank,
      });
    });

    // ProductSelect.PRICEが選択されていない場合にfetchPricesが呼ばれないことを検証するテスト
    it('should return an empty array if PRICE is not selected', async () => {
      const select = [];

      const result = await service.fetchPrices(
        { productIds },
        { storeCodes, membershipRank, select },
      );

      expect(result).toEqual([]);
      expect(mockPricesService.fetchPrices).not.toHaveBeenCalled();
    });
  });

  // fetchInventories関連のテスト
  describe('fetchInventories', () => {
    const productIds = ['123'];
    const storeCodes = ['0888'];
    const coefficient = 1.0;

    // ProductSelect.INVENTORYが選択された場合に在庫情報を取得するテスト
    it('should fetch inventories when INVENTORY is selected', async () => {
      const select = [ProductSelect.INVENTORY];
      const mockInventories = [];

      mockInventoriesService.fetchInventories.mockResolvedValue(
        mockInventories,
      );

      const result = await service.fetchInventories(
        { productIds },
        { storeCodes, select, coefficient },
      );

      expect(result).toEqual(mockInventories);
      expect(mockInventoriesService.fetchInventories).toHaveBeenCalledWith(
        { productIds, storeCodes },
        coefficient,
      );
    });

    // ProductSelect.INVENTORYが選択されていない場合にfetchInventoriesが呼ばれないことを検証するテスト
    it('should return an empty array if INVENTORY is not selected', async () => {
      const select = [];

      const result = await service.fetchInventories(
        { productIds },
        { storeCodes, select, coefficient },
      );

      expect(result).toEqual([]);
      expect(mockInventoriesService.fetchInventories).not.toHaveBeenCalled();
    });
  });

  // transformData関連のテスト
  describe('transformData', () => {
    const mockDetails = [
      {
        header: {
          productId: '123',
          categoryId: 'c12',
          name: 'Product 123',
          imageUrls: [],
        },
        detail: {
          applicableStartDate: '2022-08-01T00:00:00+09:00',
        } as InterProductDetails, // ダミーデータの簡略化
        specCategories: [],
      },
    ];

    const mockPrices: OmitTimestampProductPrice[] = [
      {
        productId: '123',
        storeCode: '0888',
        membershipRank: '1',
        priceIncludingTax: 8,
        salePriceIncludingTax: 1,
      },
      {
        productId: '456',
        storeCode: '0888',
        membershipRank: '1',
        priceIncludingTax: 8,
        salePriceIncludingTax: 1,
      },
    ];

    const mockInventories: InventoryResponse[] = [
      {
        productId: '123',
        storeCode: '088',
        quantityOpening: 3,
        quantitySold: 2,
        quantityAvailable: 1,
        quantityAllocated: 1,
        quantityExpected: 1,
      },
      {
        productId: '456',
        storeCode: '088',
        quantityOpening: 3,
        quantitySold: 2,
        quantityAvailable: 1,
        quantityAllocated: 1,
        quantityExpected: 1,
      },
    ];

    // ProductSelect.DETAILが選択された場合にデータを正しく変換するテスト
    it('should transform data correctly when DETAIL is selected', () => {
      const result = service.transformData(
        mockDetails,
        mockPrices,
        mockInventories,
        { select: [ProductSelect.DETAIL] },
      );

      expect(result[0]).toHaveProperty('productId', '123');
      expect(result[0]).toHaveProperty(
        'applicableStartDate',
        '2022-08-01T00:00:00+09:00',
      );
      expect(result[0]).toHaveProperty('specCategories');

      expect(result[0].prices).toHaveLength(1);
      expect(result[0].inventories).toHaveLength(1);
      expect(
        result[0].prices.every((price) => price.productId === '123'),
      ).toBeTruthy();
      expect(
        result[0].inventories.every(
          (inventory) => inventory.productId === '123',
        ),
      ).toBeTruthy();
    });

    // ProductSelect.DETAILが選択されていない場合にデータを正しく変換するテスト
    it('should transform data correctly when DETAIL is not selected', () => {
      const result = service.transformData(
        mockDetails,
        mockPrices,
        mockInventories,
        { select: [] },
      );

      expect(result[0]).toHaveProperty('productId', '123');
      expect(result[0]).not.toHaveProperty('applicableStartDate');
      expect(result[0]).not.toHaveProperty('specCategories');
    });
  });

  // saveToFireStore関連のテスト
  describe('saveToFireStore', () => {
    const mockDetail = [];
    const mockPrices = [];
    const mockInventories = [];
    const operatorName = 'test_operator';

    // 選択されたProductSelectに基づいて適切なサービスメソッドを呼び出すテスト
    it('should call appropriate service methods based on select array', async () => {
      const select = [
        ProductSelect.DETAIL,
        ProductSelect.PRICE,
        ProductSelect.INVENTORY,
      ];

      await service.saveToFireStore(
        { select },
        operatorName,
        mockDetail,
        mockPrices,
        mockInventories,
      );

      expect(mockDetailService.saveToFirestore).toHaveBeenCalledWith(
        mockDetail,
        operatorName,
        true,
      );
      expect(mockPricesService.saveToFirestore).toHaveBeenCalledWith(
        mockPrices,
        operatorName,
      );
      expect(mockInventoriesService.saveToFirestore).toHaveBeenCalledWith(
        mockInventories,
        operatorName,
      );
    });

    // 何も選択されていない場合に在庫と価格サービスメソッドを呼び出さないテスト
    it('should not call inventory and price service methods if nothing is selected', async () => {
      const select = [];

      await service.saveToFireStore(
        { select },
        operatorName,
        mockDetail,
        mockPrices,
        mockInventories,
      );

      // 詳細サービスは第3引数がfalseになっていることを検証
      expect(mockDetailService.saveToFirestore).toHaveBeenCalledWith(
        mockDetail,
        operatorName,
        false,
      );
      // 在庫と価格サービスメソッドが呼び出されないことを検証
      expect(mockPricesService.saveToFirestore).not.toHaveBeenCalled();
      expect(mockInventoriesService.saveToFirestore).not.toHaveBeenCalled();
    });
  });
});
