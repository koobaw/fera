import request from 'supertest';
import { initializeApp } from 'firebase-admin/app';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import firestore from '@google-cloud/firestore';
import { Mystore } from '@cainz-next-gen/types';
import { LoggingService } from '@cainz-next-gen/logging';

import { AuthGuard } from '@cainz-next-gen/guard';
import { MockAuthGuard } from '@cainz-next-gen/test';
import { MystoreController } from './mystore.controller';
import { GlobalsModule } from '../../globals.module';
import { MystoreMuleApiService } from './mystore-mule-api/mystore-mule-api.service';
import { ReadMystoreService } from './read.mystore/read.mystore.service';
import { UpdateMystoreService } from './update.mystore/update.mystore.service';
import { MystoreRecord } from './interface/mystore-response.interface';

describe('MystoreController', () => {
  let controller: MystoreController;
  let app: INestApplication;
  let readMystoreService: ReadMystoreService;
  let updateMystoreService: UpdateMystoreService;
  process.env.CAINZAPP_API_KEY = 'VALID_API_KEY';

  beforeAll(async () => {
    initializeApp();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [MystoreController],
      providers: [
        ReadMystoreService,
        UpdateMystoreService,
        MystoreMuleApiService,
        {
          provide: LoggingService,
          useFactory: () => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<MystoreController>(MystoreController);
    readMystoreService = module.get<ReadMystoreService>(ReadMystoreService);
    updateMystoreService =
      module.get<UpdateMystoreService>(UpdateMystoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should define update method', () => {
    expect(controller.update).toBeDefined();
  });
  it('should define get method', () => {
    expect(controller.getMystore).toBeDefined();
  });

  describe('update', () => {
    it('should return correct response', async () => {
      const mockedMystore: Mystore[] = [
        {
          code: '111',
          isFavoriteStore: true,
          originalCreatedAt: firestore.Timestamp.fromDate(
            new Date('2023-10-01T00:00:00Z'),
          ),
        },
      ];
      jest
        .spyOn(updateMystoreService, 'userExists')
        .mockImplementation(async () => {
          const result = true;
          return result;
        });
      jest
        .spyOn(updateMystoreService, 'getMystoreFromMule')
        .mockImplementation(async () => {
          const result = mockedMystore;
          return result;
        });
      jest
        .spyOn(updateMystoreService, 'saveToFirestoreMystore')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .put('/member/mystore/')
        .set({ 'cainzapp-api-key': 'VALID_API_KEY' })
        .send({
          sfdcUserId: 'dummySFDC_ID',
          encryptedMemberId: 'dummyId',
        });

      expect(response.body.code).toBe(HttpStatus.OK);

      expect(updateMystoreService.userExists).toBeCalled();
      expect(updateMystoreService.getMystoreFromMule).toBeCalled();
      expect(updateMystoreService.saveToFirestoreMystore).toBeCalled();
    });
    it('should return not found', async () => {
      jest
        .spyOn(updateMystoreService, 'userExists')
        .mockImplementation(async () => {
          const result = false;
          return result;
        });
      jest
        .spyOn(updateMystoreService, 'getMystoreFromMule')
        .mockImplementation();
      jest
        .spyOn(updateMystoreService, 'saveToFirestoreMystore')
        .mockImplementation();

      const response = await request(app.getHttpServer())
        .put('/member/mystore/')
        .set({ 'cainzapp-api-key': 'VALID_API_KEY' })
        .send({
          sfdcUserId: 'dummySFDC_ID',
          encryptedMemberId: 'dummyId',
        });

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(updateMystoreService.userExists).toBeCalled();
      expect(updateMystoreService.getMystoreFromMule).not.toBeCalled();
      expect(updateMystoreService.saveToFirestoreMystore).not.toBeCalled();
    });
  });
  describe('getMystore', () => {
    it('should return correct response', async () => {
      // 1. mock valueの定義
      const mockResponseValue: MystoreRecord[] = [
        {
          code: '200',
          name: 'OK',
          address: '',
          businessTime: '',
          isFavoriteStore: true,
          originalCreatedAt: '2023-10-01T00:00:00Z',
        },
      ];
      // 2. serviceのmethodをmockに上書き
      jest
        .spyOn(readMystoreService, 'getMystore')
        .mockImplementation(
          async (encryptedMemberId: string) => mockResponseValue,
        );
      // 3. controllerの呼び出しテスト
      const response = await request(app.getHttpServer())
        .get('/member/mystore/')
        .set({ Authorization: 'Bearer VALID_TOKEN' });
      // 4. responseのチェック
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(readMystoreService.getMystore).toBeCalled();
    });
    it('should return unauthorized error', async () => {
      // 1. serviceのmethodをmockに上書き
      jest.spyOn(readMystoreService, 'getMystore').mockImplementation();
      // 2. controllerの呼び出しテスト
      const response = await request(app.getHttpServer()).get(
        '/member/mystore/',
      );
      // 3. responseのチェック
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(readMystoreService.getMystore).not.toBeCalled();
    });
  });
});
