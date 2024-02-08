import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthGuard } from '@cainz-next-gen/guard';
import { MockAuthGuard } from '@cainz-next-gen/test';
import { UnionController } from './union.controller';
import { UnionService } from './union.service';
import { GlobalsModule } from '../../globals.module';

describe('UnionController', () => {
  let app: INestApplication;
  let mockUnionService: jest.Mocked<UnionService>;

  beforeEach(async () => {
    mockUnionService = {
      fetchDetails: jest.fn().mockResolvedValue([]),
      fetchPrices: jest.fn().mockResolvedValue([]),
      fetchInventories: jest.fn().mockResolvedValue([]),
      transformData: jest.fn().mockResolvedValue([]),
      saveToFireStore: jest.fn().mockResolvedValue(null),
    } as Partial<UnionService> as jest.Mocked<UnionService>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [UnionController],
      providers: [
        {
          provide: UnionService,
          useValue: mockUnionService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('getProducts', () => {
    const productIds = ['123'];
    const url = `/${productIds.join(',')}`;

    it('should return products data', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .query({})
        .set({ Authorization: 'Bearer VALID_TOKEN' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('code', HttpStatus.OK);
      expect(response.body).toHaveProperty('message', 'ok');
      expect(response.body).toHaveProperty('data');

      expect(mockUnionService.fetchDetails).toHaveBeenCalled();
      expect(mockUnionService.fetchPrices).toHaveBeenCalled();
      expect(mockUnionService.fetchInventories).toHaveBeenCalled();
      expect(mockUnionService.transformData).toHaveBeenCalled();
      expect(mockUnionService.saveToFireStore).toHaveBeenCalled();
    });

    it('should not save data to Firestore when save query parameter is false', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .query({ save: false })
        .set({ Authorization: 'Bearer VALID_TOKEN' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('code', HttpStatus.OK);
      expect(response.body).toHaveProperty('message', 'ok');
      expect(response.body).toHaveProperty('data');

      expect(mockUnionService.fetchDetails).toHaveBeenCalled();
      expect(mockUnionService.fetchPrices).toHaveBeenCalled();
      expect(mockUnionService.fetchInventories).toHaveBeenCalled();
      expect(mockUnionService.transformData).toHaveBeenCalled();
      expect(mockUnionService.saveToFireStore).not.toHaveBeenCalled();
    });
  });
});
