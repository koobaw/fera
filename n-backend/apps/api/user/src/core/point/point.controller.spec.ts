import { OmitTimestampPoint } from '@cainz-next-gen/types';

import { CommonService } from '@cainz-next-gen/common';
import firestore from '@google-cloud/firestore';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { MockAuthGuard } from '@cainz-next-gen/test';
import { AuthGuard } from '@cainz-next-gen/guard';
import { GlobalsModule } from '../../globals.module';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { PointMuleApiService } from './point-mule-api/point-mule-api.service';
import { ResponsePointData } from './interface/point.interface';

describe('PointController', () => {
  let pointController: PointController;
  let pointService: PointService;
  let commonService: CommonService;

  const mockAuthGuard = new MockAuthGuard();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [PointController],
      providers: [
        PointService,
        PointMuleApiService,
        {
          provide: FirestoreBatchService,
          useFactory: () => {},
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    pointController = module.get<PointController>(PointController);
    pointService = module.get<PointService>(PointService);
    commonService = module.get<CommonService>(CommonService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pointController).toBeDefined();
  });

  it('should be defined methods', () => {
    expect(pointController.getPoint).toBeDefined();
  });

  describe('getPoint', () => {
    it('should be returned ok response', async () => {
      jest
        .spyOn(pointService, 'getPoint')
        .mockImplementation(async (): Promise<OmitTimestampPoint> => {
          const result: OmitTimestampPoint = {
            totalAmountExcludingTax: 50000,
            stageName: 'レギュラー',
            stageGrantRate: 0.5,
            nextStageName: 'ゴールド',
            nextStageGrantRate: 1,
            targetAmountExcludingTax: 50000,
            term: '6月〜8月',
            points: 100,
            lostDate: firestore.Timestamp.fromDate(
              new Date('2024-12-31T00:00:00.000Z'),
            ),
            lostPoints: 50,
          };
          return result;
        });

      jest
        .spyOn(commonService, 'createFirestoreSystemName')
        .mockReturnValue('dummyOperatorName');

      jest.spyOn(pointService, 'saveToFirestore').mockImplementation();

      const result: ResponsePointData = {
        totalAmountExcludingTax: 50000,
        stageName: 'レギュラー',
        stageGrantRate: 0.5,
        nextStageName: 'ゴールド',
        nextStageGrantRate: 1,
        targetAmountExcludingTax: 50000,
        term: '6月〜8月',
        points: 100,
        lostDate: new Date('2024-12-31T00:00:00.000Z').toISOString(),
        lostPoints: 50,
      };

      await expect(
        pointController.getPoint(<never>{
          claims: {
            userId: 'dummyUserId',
            encryptedMemberId: 'u+D98jKYzmDLuyiT4tBFn6KKpskKTwqZVGTrytWdBsU=',
          },
        }),
      ).resolves.toEqual({
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      });
    });

    it('should be returned ok response(optional value is empty)', async () => {
      jest
        .spyOn(pointService, 'getPoint')
        .mockImplementation(async (): Promise<OmitTimestampPoint> => {
          const result: OmitTimestampPoint = {
            points: 100,
          };
          return result;
        });

      jest
        .spyOn(commonService, 'createFirestoreSystemName')
        .mockReturnValue('dummyOperatorName');

      jest.spyOn(pointService, 'saveToFirestore').mockImplementation();

      const result: ResponsePointData = {
        points: 100,
      };

      await expect(
        pointController.getPoint(<never>{
          claims: {
            userId: 'dummyUserId',
            encryptedMemberId: 'u+D98jKYzmDLuyiT4tBFn6KKpskKTwqZVGTrytWdBsU=',
          },
        }),
      ).resolves.toEqual({
        code: HttpStatus.OK,
        message: 'ok',
        data: result,
      });
    });
  });
});
