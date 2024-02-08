import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@cainz-next-gen/guard';
import { MockAuthGuard } from '@cainz-next-gen/test';
import { BonusPointsController } from './bonus-points.controller';
import { BonusPointsService } from './bonus-points.service';
import { GlobalsModule } from '../../globals.module';

describe('BonusPointsController', () => {
  let app: INestApplication;

  const mockBonusPointsService = {
    getPoints: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [BonusPointsController],
      providers: [
        {
          provide: BonusPointsService,
          useValue: mockBonusPointsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('getPoints', () => {
    it('should return bonus points data', async () => {
      const dto = {
        storeCodes: '123',
        productIds: '456, 789',
        membershipRank: '1',
      };

      const response = await request(app.getHttpServer())
        .get('/bonus-points')
        .query(dto)
        .set({ Authorization: 'Bearer VALID_TOKEN' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('code', HttpStatus.OK);
      expect(response.body).toHaveProperty('message', 'ok');
      expect(response.body).toHaveProperty('data');
      expect(mockBonusPointsService.getPoints).toHaveBeenCalledWith(dto);
    });
  });
});
