import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@cainz-next-gen/common';
import { BonusPointsService } from './bonus-points.service';
import { PointAwardCalculationApiService } from './pac-api/point-award-calculation-api.service';

describe('BonusPointsService', () => {
  let service: BonusPointsService;
  let mockPointAwardCalculationApiService: jest.Mocked<PointAwardCalculationApiService>;
  let mockCommonService: Partial<CommonService>;

  beforeEach(async () => {
    mockPointAwardCalculationApiService = {
      getPoint: jest.fn(),
    } as unknown as jest.Mocked<PointAwardCalculationApiService>;

    mockCommonService = {
      convertDateStringToJstTimestampString: jest
        .fn()
        .mockImplementation((dateStr) => {
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const expectedDate = `${year}-${month}-${day}T00:00:00+09:00`;
          return expectedDate;
        }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BonusPointsService,
        {
          provide: PointAwardCalculationApiService,
          useValue: mockPointAwardCalculationApiService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
      ],
    }).compile();

    service = module.get<BonusPointsService>(BonusPointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return bonus points data', async () => {
    mockPointAwardCalculationApiService.getPoint.mockResolvedValue({
      RESULT_CODE: '0000',
      RESULT_MESSAGE: '正常',
      MEMBER_INFO: {
        MEMBER_RANK: '1',
        PROMOTION_INFO: [
          {
            PROMOTION_CODE: '1111',
            PROMOTION_DESC: 'Test Promotion',
            PROMOTION_EDT: '209912312359',
            ITERM_INFO: [
              {
                STORE_CODE: '123',
                JAN_CODE: '456',
                POINT_PLUS: '100',
              },
              {
                STORE_CODE: '789',
                JAN_CODE: '012',
                POINT_PLUS: '200',
              },
            ],
          },
        ],
      },
    });

    const dto = {
      storeCodes: ['123'],
      productIds: ['456'],
      membershipRank: '1',
    };

    const result = await service.getPoints(dto);

    // 期待される戻り値の構造を検証
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('productId', '456');
    expect(result[1]).toHaveProperty('productId', '012');
    expect(mockPointAwardCalculationApiService.getPoint).toHaveBeenCalledWith(
      ['123'],
      ['456'],
      '1',
    );
    expect(
      mockCommonService.convertDateStringToJstTimestampString,
    ).toHaveBeenCalledWith('20991231');
    expect(result[0]).toHaveProperty('endDate', '2099-12-31T00:00:00+09:00');
  });

  it('should return an empty array if no member info is available', async () => {
    // 会員階層がない状態を模倣
    mockPointAwardCalculationApiService.getPoint.mockResolvedValue({
      RESULT_CODE: '0000',
      RESULT_MESSAGE: '正常',
    });

    const dto = {
      storeCodes: ['123'],
      productIds: ['456'],
      membershipRank: '1',
    };
    const result = await service.getPoints(dto);

    // 空の配列が返されることを検証
    expect(result).toEqual([]);
  });

  it('should return an empty array if no promotion info is available', async () => {
    // プロモーション情報がない状態を模倣
    mockPointAwardCalculationApiService.getPoint.mockResolvedValue({
      RESULT_CODE: '0000',
      RESULT_MESSAGE: '正常',
      MEMBER_INFO: {
        MEMBER_RANK: '1',
      },
    });

    const dto = {
      storeCodes: ['123'],
      productIds: ['456'],
      membershipRank: '1',
    };
    const result = await service.getPoints(dto);

    // 空の配列が返されることを検証
    expect(result).toEqual([]);
  });

  it('should return an empty array if no member info is available', async () => {
    // 商品情報がない状態を模倣
    mockPointAwardCalculationApiService.getPoint.mockResolvedValue({
      RESULT_CODE: '0000',
      RESULT_MESSAGE: '正常',
      MEMBER_INFO: {
        MEMBER_RANK: '1',
        PROMOTION_INFO: [
          {
            PROMOTION_CODE: '1111',
            PROMOTION_DESC: 'Test Promotion',
            PROMOTION_EDT: '209912312359',
          },
        ],
      },
    });

    const dto = {
      storeCodes: ['123'],
      productIds: ['456'],
      membershipRank: '1',
    };
    const result = await service.getPoints(dto);

    // 空の配列が返されることを検証
    expect(result).toEqual([]);
  });
});
