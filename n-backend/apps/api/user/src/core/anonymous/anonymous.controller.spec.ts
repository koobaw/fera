import request from 'supertest';
import { FieldValue } from 'firebase-admin/firestore';
import { AnonymousUser } from '@fera-next-gen/types';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@fera-next-gen/guard';
import { GlobalsModule } from '../../globals.module';
import { AnonymousController } from './anonymous.controller';
import { AnonymousService } from './anonymous.service';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp().getRequest();
    http.claims = {
      userId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
    };
    return true; // always allow
  }
}

describe('AnonymousController', () => {
  let controller: AnonymousController;
  let app: INestApplication;

  const mockAnonymousService = {
    isUserExist: jest.fn(),
    createDefaultUserData: jest.fn(),
    saveToFirestore: jest.fn(),
    pushToTaskQueue: jest.fn(),
  };

  const mockAuthGuard = new MockAuthGuard();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [AnonymousController],
      providers: [
        { provide: AnonymousService, useFactory: () => mockAnonymousService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<AnonymousController>(AnonymousController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.create).toBeDefined();
    expect(controller.migrate).toBeDefined();
  });

  describe('create', () => {
    it('should be called these methods', async () => {
      const defaultUserData: AnonymousUser = {
        id: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
        userType: 'anonymous',
        storeCodeInUse: '813',
        legacyMemberId: null,
        lastApplicationStartDate: null,
        lastCheckCampaignTime: null,
        lastCheckAnnouncementTime: null,
        lastCheckTonakaiTime: null,
        lastCheckTvTime: null,
        reviewDisable: false,
        reviewSkipAt: null,
        cartInUse: null,
        createdBy: '/api/v1/user/anonymous/:post',
        createdAt: FieldValue.serverTimestamp(),
        updatedBy: '/api/v1/user/anonymous/:post',
        updatedAt: FieldValue.serverTimestamp(),
      };
      mockAnonymousService.createDefaultUserData.mockReturnValueOnce(
        defaultUserData,
      );
      mockAnonymousService.isUserExist.mockImplementation(
        async (): Promise<boolean> => false,
      );

      const response = await request(app.getHttpServer()).post('/anonymous/');

      expect(response.body.code).toBe(HttpStatus.CREATED);

      expect(mockAnonymousService.isUserExist).toBeCalled();
      expect(mockAnonymousService.createDefaultUserData).toBeCalled();
      expect(mockAnonymousService.saveToFirestore).toBeCalled();
    });

    it('should be skip save to firestore error', async () => {
      mockAnonymousService.isUserExist.mockImplementation(
        async (): Promise<boolean> => true,
      );

      const response = await request(app.getHttpServer()).post('/anonymous/');
      expect(response.body.code).toBe(HttpStatus.CREATED);

      expect(mockAnonymousService.isUserExist).toBeCalled();
      expect(mockAnonymousService.createDefaultUserData).not.toBeCalled();
      expect(mockAnonymousService.saveToFirestore).not.toBeCalled();
    });
  });

  describe('create', () => {
    it('should be called once', async () => {
      await request(app.getHttpServer()).post('/anonymous/migrate');
      expect(mockAnonymousService.pushToTaskQueue).toHaveBeenCalled();
    });
  });
});
