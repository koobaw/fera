import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { GlobalsModule } from '../../globals.module';
import { CommonFavoriteProductsService } from './common.favorite-products.service';

describe('ReadFavoriteProductsService', () => {
  let service: CommonFavoriteProductsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        CommonFavoriteProductsService,
        FirestoreBatchService,
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<CommonFavoriteProductsService>(
      CommonFavoriteProductsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(service.getFavoritesDocSnapByUser).toBeDefined();
  });

  describe('getFavoritesDocSnapByUser', () => {
    it('should get snapshot', async () => {
      jest
        .spyOn(Reflect.get(service, 'firestoreBatchService'), 'findCollection')
        .mockReturnValue({
          doc: jest.fn().mockReturnThis(),
          collection: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          get: jest.fn().mockReturnValue({
            docs: [
              {
                favoritesDocSnapshotData: 'favoritesDocSnapshotData',
              },
            ],
          }),
        });
      const encryptedMemberId = 'encryptedMemberId';

      const result = await service.getFavoritesDocSnapByUser(encryptedMemberId);

      expect(result).toEqual({
        favoritesDocSnapshotData: 'favoritesDocSnapshotData',
      });
    });

    it('should throw if match more than two docs', async () => {
      jest
        .spyOn(Reflect.get(service, 'firestoreBatchService'), 'findCollection')
        .mockReturnValue({
          doc: jest.fn().mockReturnThis(),
          collection: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          get: jest.fn().mockReturnValue({
            docs: [
              {
                favoritesDocSnapshotData: 'favoritesDocSnapshotData',
              },
              {
                favoritesDocSnapshotData: 'favoritesDocSnapshotData',
              },
            ],
          }),
        });
      const encryptedMemberId = 'encryptedMemberId';

      await expect(
        service.getFavoritesDocSnapByUser(encryptedMemberId),
      ).rejects.toThrow();
    });

    it('should response error When it fail to get snapshot', async () => {
      jest
        .spyOn(Reflect.get(service, 'firestoreBatchService'), 'findCollection')
        .mockImplementation(() => {
          throw new Error();
        });

      const encryptedMemberId = 'encryptedMemberId';
      await expect(
        service.getFavoritesDocSnapByUser(encryptedMemberId),
      ).rejects.toThrow();
    });
  });
});
