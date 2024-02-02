import request from 'supertest';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@cainz-next-gen/guard';
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
    getMigrateTarget: jest.fn(),
    getMigrateData: jest.fn(),
    migrate: jest.fn(),
    isUserExist: jest.fn(),
    createDefaultUserData: jest.fn(),
    saveToFirestore: jest.fn(),
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
    expect(controller.migrate).toBeDefined();
  });

  describe('migrate', () => {
    it('should be called these methods', async () => {
      const mockedMigrateTarget = {
        legacyUserId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
        migrated: false,
      };
      mockAnonymousService.getMigrateTarget.mockReturnValueOnce(
        mockedMigrateTarget,
      );

      await request(app.getHttpServer()).post('/anonymous/migrate').send({
        anonymousUserId:
          'eyJhbm9ueW1vdXNVc2VySWQiOiJEMUl6YmZTdUZkZnNYSW9UTmxPVXIwV3pLQloyIn0=',
      });
      expect(mockAnonymousService.getMigrateTarget).toBeCalled();
      expect(mockAnonymousService.getMigrateData).toBeCalled();
      expect(mockAnonymousService.migrate).toBeCalled();
    });

    it('should skip these methods,when target user not exist', async () => {
      const mockedMigrateTarget = {
        legacyUserId: undefined,
        migrated: false,
      };
      mockAnonymousService.getMigrateTarget.mockReturnValueOnce(
        mockedMigrateTarget,
      );

      await request(app.getHttpServer()).post('/anonymous/migrate').send({
        anonymousUserId:
          'eyJhbm9ueW1vdXNVc2VySWQiOiJEMUl6YmZTdUZkZnNYSW9UTmxPVXIwV3pLQloyIn0=',
      });
      expect(mockAnonymousService.getMigrateTarget).toBeCalled();
      expect(mockAnonymousService.getMigrateData).not.toBeCalled();
      expect(mockAnonymousService.migrate).not.toBeCalled();
    });

    it('should skip these methods,when target user have been migrated', async () => {
      const mockedMigrateTarget = {
        legacyUserId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
        migrated: true,
      };
      mockAnonymousService.getMigrateTarget.mockReturnValueOnce(
        mockedMigrateTarget,
      );

      await request(app.getHttpServer()).post('/anonymous/migrate').send({
        anonymousUserId:
          'eyJhbm9ueW1vdXNVc2VySWQiOiJEMUl6YmZTdUZkZnNYSW9UTmxPVXIwV3pLQloyIn0=',
      });
      expect(mockAnonymousService.getMigrateTarget).toBeCalled();
      expect(mockAnonymousService.getMigrateData).not.toBeCalled();
      expect(mockAnonymousService.migrate).not.toBeCalled();
    });
  });
});
