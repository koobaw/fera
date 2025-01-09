import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';
import {
  HttpException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentReference, DocumentSnapshot } from '@google-cloud/firestore';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';
import { MemberAuthGuard } from '@fera-next-gen/guard';
import { MockAuthGuard } from '@fera-next-gen/test';
import { GlobalsModule } from '../../globals.module';
import { FavoriteProductsController } from './favorite-products.controller';
import { RegisterFavoriteProductsService } from './register.favorite-products/register.favorite-products.service';
import { ReadFavoriteProductsService } from './read.favorite-products/read.favorite-products.service';
import { DeleteFavoriteProductsService } from './delete.favorite-products/delete.favorite-products.service';
import { CommonFavoriteProductsService } from './common.favorite-products.service';
import { FavoriteProductsMuleApiService } from './favorite-products-mule-api/favorite-products-mule-api.service';
import { FavoritesMuleApiService } from './favorites-mule-api/favorites-mule-api.service';
import { RegisterFavoriteProductsParamDto } from './dto/register.favorite-products-param.dto';

describe('FavoriteProductsController', () => {
  let controller: FavoriteProductsController;
  let app: INestApplication;
  let readFavoriteProductsService: ReadFavoriteProductsService;
  let registerFavoriteProductsService: RegisterFavoriteProductsService;
  let deleteFavoriteProductsService: DeleteFavoriteProductsService;
  let commonService: CommonService;
  let commonFavoriteProductsService: CommonFavoriteProductsService;

  beforeAll(async () => {
    initializeApp();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [FavoriteProductsController],
      providers: [
        CommonFavoriteProductsService,
        RegisterFavoriteProductsService,
        ReadFavoriteProductsService,
        DeleteFavoriteProductsService,
        CommonFavoriteProductsService,
        FavoritesMuleApiService,
        FavoriteProductsMuleApiService,
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
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
            createFirestoreSystemName: jest.fn(),
            decryptAES256: jest.fn().mockImplementation(() => 'dummyDecrypt'),
          }),
        },
      ],
    })
      .overrideGuard(MemberAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    controller = module.get<FavoriteProductsController>(
      FavoriteProductsController,
    );
    readFavoriteProductsService = module.get<ReadFavoriteProductsService>(
      ReadFavoriteProductsService,
    );
    registerFavoriteProductsService =
      module.get<RegisterFavoriteProductsService>(
        RegisterFavoriteProductsService,
      );
    deleteFavoriteProductsService = module.get<DeleteFavoriteProductsService>(
      DeleteFavoriteProductsService,
    );
    commonService = module.get<CommonService>(CommonService);
    commonFavoriteProductsService = module.get<CommonFavoriteProductsService>(
      CommonFavoriteProductsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should define create method', () => {
    expect(controller.registerFavoriteProducts).toBeDefined();
  });

  describe('registerFavoriteProducts', () => {
    it('should return correct response', async () => {
      jest
        .spyOn(registerFavoriteProductsService as any, 'getTargetFavoriteDoc')
        .mockImplementation(async () => ({
          id: 'dummyId',
        }));

      jest
        .spyOn(commonService, 'createFirestoreSystemName')
        .mockImplementation();

      jest
        .spyOn(registerFavoriteProductsService, 'saveToFirestore')
        .mockImplementation();

      jest
        .spyOn(
          registerFavoriteProductsService,
          'createFavoriteProductTaskToRegister',
        )
        .mockImplementation();

      const mockedClaims = {
        claims: {
          userId: 'dummyUserId',
          encryptedMemberId: 'dummyEncryptedMemberId',
          accessToken: 'dummyAccessToken',
          refreshToken: 'dummyRefreshToken',
        },
      };

      const registerFavoriteProductsParamDto: RegisterFavoriteProductsParamDto =
        {
          productId: 'productId',
          mylistId: 'mylistId',
        };

      const correlationId = 'correlationId';

      const result = await controller.registerFavoriteProducts(
        <never>mockedClaims,
        registerFavoriteProductsParamDto,
        correlationId,
      );

      expect(result.code).toEqual(HttpStatus.OK);
    });
  });

  it('should define read method', () => {
    expect(controller.getFavoriteProducts).toBeDefined();
  });

  describe('getFavoriteProducts', () => {
    it('should return empty response', async () => {
      // define parameter
      const timestamp = '2023-11-09T12:27:33+09:00';
      const expectResponse = {
        code: HttpStatus.OK,
        message: 'ok',
        data: [],
        timestamp,
      };
      // define mock
      jest
        .spyOn(readFavoriteProductsService, 'getFavoriteProductIds')
        .mockImplementation(async () => []);
      // check response
      const response = await request(app.getHttpServer())
        .get(`/member/favorites/products`)
        .set({ Authorization: 'Bearer VALID_TOKEN' });
      expect({ ...response.body, timestamp }).toEqual(expectResponse);
    });

    it('should return data with price response', async () => {
      // define parameter
      const timestamp = '2023-11-09T12:27:33+09:00';
      const productsWithPrice = [
        {
          productId: '111111',
          name: 'dummy',
          price: 888,
          thumbnailUrl: 'dummyUrl',
        },
        {
          productId: '222222',
          name: 'dummy',
          price: 888,
          thumbnailUrl: 'dummyUrl',
        },
      ];
      const expectResponse = {
        code: HttpStatus.OK,
        message: 'ok',
        data: productsWithPrice,
        timestamp,
      };
      // define mock
      jest
        .spyOn(readFavoriteProductsService, 'getFavoriteProductIds')
        .mockImplementation(async () => ['111111', '222222']);
      jest
        .spyOn(readFavoriteProductsService, 'fetchProductWithPrice')
        .mockImplementation(async () => productsWithPrice);
      // check response
      const response = await request(app.getHttpServer())
        .get(`/member/favorites/products`)
        .set({ Authorization: 'Bearer VALID_TOKEN' });
      expect({ ...response.body, timestamp }).toEqual(expectResponse);
    });
  });

  it('should define delete method', () => {
    expect(controller.deleteFavoriteProducts).toBeDefined();
  });

  describe('delete', () => {
    it('should pass when mylist is null and default mylist is null', async () => {
      const mockedProductIds = 'productId1';
      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => null);

      jest
        .spyOn(deleteFavoriteProductsService, 'existsMylist')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'getDeleteTargetDocs')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'deleteFromFirestore')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'pushToTaskQueue')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .delete('/member/favorites/products/')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: mockedProductIds });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(
        commonFavoriteProductsService.getFavoritesDocSnapByUser,
      ).toBeCalled();
      expect(deleteFavoriteProductsService.existsMylist).not.toBeCalled();
      expect(
        deleteFavoriteProductsService.getDeleteTargetDocs,
      ).not.toBeCalled();
      expect(
        deleteFavoriteProductsService.deleteFromFirestore,
      ).not.toBeCalled();
      expect(deleteFavoriteProductsService.pushToTaskQueue).not.toBeCalled();
    });

    it('should pass when mylist is null and default mylist not exists', async () => {
      const mockedProductIds = 'productId1';
      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => ({ exists: false }));

      jest
        .spyOn(deleteFavoriteProductsService, 'existsMylist')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'getDeleteTargetDocs')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'deleteFromFirestore')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'pushToTaskQueue')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .delete('/member/favorites/products/')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: mockedProductIds });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(
        commonFavoriteProductsService.getFavoritesDocSnapByUser,
      ).toBeCalled();
      expect(deleteFavoriteProductsService.existsMylist).not.toBeCalled();
      expect(
        deleteFavoriteProductsService.getDeleteTargetDocs,
      ).not.toBeCalled();
      expect(
        deleteFavoriteProductsService.deleteFromFirestore,
      ).not.toBeCalled();
      expect(deleteFavoriteProductsService.pushToTaskQueue).not.toBeCalled();
    });

    it('should be called methods with no mylistId', async () => {
      const mockedProductIds = 'productId1';
      const mockedMylistId = 'default_list';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'dummyId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const mockedTargetDocs = [mockedSnapshot];

      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => ({ exists: true, id: mockedMylistId }));

      jest
        .spyOn(deleteFavoriteProductsService, 'existsMylist')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'getDeleteTargetDocs')
        .mockImplementation(async () => mockedTargetDocs);

      jest
        .spyOn(deleteFavoriteProductsService, 'deleteFromFirestore')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'pushToTaskQueue')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .delete('/member/favorites/products/')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: mockedProductIds });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(
        commonFavoriteProductsService.getFavoritesDocSnapByUser,
      ).toBeCalled();
      expect(deleteFavoriteProductsService.existsMylist).not.toBeCalled();
      expect(deleteFavoriteProductsService.getDeleteTargetDocs).toBeCalled();
      expect(deleteFavoriteProductsService.deleteFromFirestore).toBeCalled();
      expect(deleteFavoriteProductsService.pushToTaskQueue).toBeCalled();
    });

    it('should be called methods with mylistId', async () => {
      const mockedProductIds = 'productId1';
      const mockedMylistId = 'default_list';
      const mockedDocRef = {
        id: 'id',
        path: 'user/favorite/products/45454545',
      } as DocumentReference;
      const mockedSnapshot = {
        exists: true,
        id: 'dummyId1',
        data: jest.fn(() => ({
          id: 'objectId1',
        })),
        ref: mockedDocRef,
        readTime: null,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as DocumentSnapshot;
      const mockedTargetDocs = [mockedSnapshot];

      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => ({ id: mockedMylistId }));

      jest
        .spyOn(deleteFavoriteProductsService, 'existsMylist')
        .mockImplementation(async () => true);

      jest
        .spyOn(deleteFavoriteProductsService, 'getDeleteTargetDocs')
        .mockImplementation(async () => mockedTargetDocs);

      jest
        .spyOn(deleteFavoriteProductsService, 'deleteFromFirestore')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'pushToTaskQueue')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .delete('/member/favorites/products/')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: mockedProductIds, mylistId: mockedMylistId });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(
        commonFavoriteProductsService.getFavoritesDocSnapByUser,
      ).not.toBeCalled();
      expect(deleteFavoriteProductsService.existsMylist).toBeCalled();
      expect(deleteFavoriteProductsService.getDeleteTargetDocs).toBeCalled();
      expect(deleteFavoriteProductsService.deleteFromFirestore).toBeCalled();
      expect(deleteFavoriteProductsService.pushToTaskQueue).toBeCalled();
    });

    it('should be return OK on mylistId is not found', async () => {
      const mockedProductIds = 'productId1';
      const mockedMylistId = 'invalid_list';
      const mockedTargetDocs = [];

      jest
        .spyOn(
          commonFavoriteProductsService as any,
          'getFavoritesDocSnapByUser',
        )
        .mockImplementation(async () => ({ id: mockedMylistId }));

      jest
        .spyOn(deleteFavoriteProductsService, 'existsMylist')
        .mockImplementation(async () => false);

      jest
        .spyOn(deleteFavoriteProductsService, 'getDeleteTargetDocs')
        .mockImplementation(async () => mockedTargetDocs);

      jest
        .spyOn(deleteFavoriteProductsService, 'deleteFromFirestore')
        .mockImplementation();

      jest
        .spyOn(deleteFavoriteProductsService, 'pushToTaskQueue')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .delete('/member/favorites/products/')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: mockedProductIds, mylistId: mockedMylistId });

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(
        commonFavoriteProductsService.getFavoritesDocSnapByUser,
      ).not.toBeCalled();
      expect(deleteFavoriteProductsService.existsMylist).toBeCalled();
      expect(
        deleteFavoriteProductsService.getDeleteTargetDocs,
      ).not.toBeCalled();
      expect(
        deleteFavoriteProductsService.deleteFromFirestore,
      ).not.toBeCalled();
      expect(deleteFavoriteProductsService.pushToTaskQueue).not.toBeCalled();
    });
  });
  describe('getFavoriteProductsAvailability', () => {
    it('should return correct response', async () => {
      // define parameters
      const productId = '123456';
      const mockResponse = { productId, isRegistered: true };
      const expectResponse = {
        code: HttpStatus.OK,
        message: 'ok',
        data: [mockResponse],
        timestamp: '2023-11-09T12:27:33+09:00',
      };
      // define mock
      jest
        .spyOn(readFavoriteProductsService, 'getFavoriteProductIds')
        .mockImplementation(async () => [productId]);
      // call controller method
      const response = await request(app.getHttpServer())
        .get(`/member/favorites/products/availability`)
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ productIds: productId });
      // check response(timestamp is override because timestamp is not matched at defined parameter and process done)
      expect({
        ...response.body,
        timestamp: '2023-11-09T12:27:33+09:00',
      }).toEqual(expectResponse);
    });
  });
});
