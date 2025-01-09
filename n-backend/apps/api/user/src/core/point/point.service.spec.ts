import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { FieldValue, Timestamp } from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { OmitTimestampPoint, Point } from '@fera-next-gen/types';
import { HttpException } from '@nestjs/common';
import { GlobalsModule } from '../../globals.module';
import { CryptoUtilsService } from '../../utils/crypto.service';
import { PointMuleApiService } from './point-mule-api/point-mule-api.service';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { MulePointSuccessResponse } from './interface/mule-api.interface';

describe('PointService', () => {
  let pointService: PointService;
  let pointMuleApiService: PointMuleApiService;

  const mockCrypto = {
    encryptAES256: jest.fn(() => jest.fn()),
    decryptAES256: jest.fn(() => jest.fn()),
  };

  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            get: jest.fn().mockReturnValue({
              exists: true,
              data: jest.fn().mockReturnValue({
                createdAt: Timestamp.fromDate(new Date()),
                createdBy: 'createdBy',
              }),
            }),
          })),
        })),
      })),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [PointController],
      providers: [
        PointService,
        PointMuleApiService,
        {
          provide: CryptoUtilsService,
          useFactory: () => mockCrypto,
        },
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
          }),
        },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    pointMuleApiService = module.get<PointMuleApiService>(PointMuleApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pointService).toBeDefined();
  });

  it('should be these methods', () => {
    expect(pointService.getPoint).toBeDefined();
    expect(pointService.saveToFirestore).toBeDefined();
  });

  describe('getPoint', () => {
    it('should be fetched and transformed from api', async () => {
      jest
        .spyOn(pointMuleApiService, 'fetchPoint')
        .mockImplementation(async () => {
          const response: MulePointSuccessResponse = {
            id: 'memberId',
            status: 'D',
            points: 100,
            lost: [{ date: '2023-12-01', points: 50 }],
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
              targetAmount: 10000,
              url: 'url',
              term: 'term',
            },
          };
          return response;
        });

      mockCrypto.decryptAES256().mockImplementation(() => '1234567890123');

      const expectedResult: OmitTimestampPoint = {
        stageName: 'stageName',
        stageGrantRate: 0.1,
        nextStageName: 'nextStageName',
        nextStageGrantRate: 0.2,
        totalAmountExcludingTax: 1000,
        targetAmountExcludingTax: 10000,
        term: 'term',
        points: 100,
        lostDate: Timestamp.fromDate(new Date('2023-12-01')),
        lostPoints: 50,
      };
      expect(await pointService.getPoint('encryptedMemberId')).toEqual(
        expectedResult,
      );
    });

    it('should be fetched and transformed from api(optional value is empty)', async () => {
      jest
        .spyOn(pointMuleApiService, 'fetchPoint')
        .mockImplementation(async () => {
          const response: MulePointSuccessResponse = {
            id: 'memberId',
            status: 'D',
            points: 100,
            lost: [],
          };
          return response;
        });

      mockCrypto.decryptAES256().mockImplementation(() => '1234567890123');

      const expectedValue: OmitTimestampPoint = {
        points: 100,
      };
      const result = await pointService.getPoint('encryptedMemberId');
      expect(result).toEqual(expectedValue);
    });
  });

  describe('saveToFirestore', () => {
    it('should called these methods(old data exists)', async () => {
      const point: OmitTimestampPoint = {
        stageName: 'stageName',
        stageGrantRate: 0.1,
        nextStageName: 'nextStageName',
        nextStageGrantRate: 0.2,
        totalAmountExcludingTax: 1000,
        targetAmountExcludingTax: 10000,
        term: 'term',
        points: 100,
      };
      await pointService.saveToFirestore(
        'u+D98jKYzmDLuyiT4tBFn6KKpskKTwqZVGTrytWdBsU=',
        point,
        'test',
      );
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
    });

    it('should called these methods(old data not exists)', async () => {
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn(() => ({
            collection: jest.fn(() => ({
              doc: jest.fn(() => ({
                get: jest.fn().mockReturnValue({
                  exists: false,
                  data: jest.fn().mockReturnValue({
                    createdAt: null,
                    createdBy: null,
                  }),
                }),
              })),
            })),
          })),
        }));

      let savedData: Point;
      mockFirestoreBatchService.batchSet.mockImplementation(
        (_docRef, saveData) => {
          savedData = saveData;
        },
      );

      const point: OmitTimestampPoint = {
        stageName: 'stageName',
        stageGrantRate: 0.1,
        nextStageName: 'nextStageName',
        nextStageGrantRate: 0.2,
        totalAmountExcludingTax: 1000,
        targetAmountExcludingTax: 10000,
        term: 'term',
        points: 100,
      };

      await pointService.saveToFirestore(
        'u+D98jKYzmDLuyiT4tBFn6KKpskKTwqZVGTrytWdBsU=',
        point,
        'test',
      );
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
      expect(savedData.createdAt).toEqual(expect.any(FieldValue));
    });

    it('should throw error', async () => {
      mockFirestoreBatchService.batchCommit.mockImplementation(() => {
        throw new Error();
      });

      const point: OmitTimestampPoint = {
        stageName: 'stageName',
        stageGrantRate: 0.1,
        nextStageName: 'nextStageName',
        nextStageGrantRate: 0.2,
        totalAmountExcludingTax: 1000,
        targetAmountExcludingTax: 10000,
        term: 'term',
        points: 100,
      };
      await expect(
        pointService.saveToFirestore(
          'u+D98jKYzmDLuyiT4tBFn6KKpskKTwqZVGTrytWdBsU=',
          point,
          'test',
        ),
      ).rejects.toThrow(HttpException);
    });
  });
});
