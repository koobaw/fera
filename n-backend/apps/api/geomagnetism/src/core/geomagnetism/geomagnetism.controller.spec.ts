import request from 'supertest';

import { AuthGuard } from '@cainz-next-gen/guard';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { GeomagnetismAuthService } from './auth/geomagnetismAuth.service';
import { GeomagnetismController } from './geomagnetism.controller';
import { GeomagnetismRegisterService } from './register/geomagnetismRegister.service';

jest.useFakeTimers();

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp().getRequest();
    http.claims = {
      userId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
      encryptedMemberId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
    };
    return true; // always allow
  }
}

describe('GeomagnetismAuthController', () => {
  let controller: GeomagnetismController;
  let app: INestApplication;

  const mockGeomagneticAuthService = {
    authGeomagneticUserService: jest.fn(),
  };

  const mockGeomagneticRegisterService = {
    registGeomagneticUserService: jest.fn(),
  };

  const mockAuthGuard = new MockAuthGuard();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [GeomagnetismController],
      providers: [
        {
          provide: GeomagnetismAuthService,
          useFactory: () => mockGeomagneticAuthService,
        },
        {
          provide: GeomagnetismRegisterService,
          useFactory: () => mockGeomagneticRegisterService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<GeomagnetismController>(GeomagnetismController);
  });

  beforeEach(async () => {});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkGeomagneticRegistrationAuth', () => {
    it('should call the service method when making a POST request', async () => {
      const geomagneticUserData = {
        data: {
          token: 'token',
        },
        message: 'OK',
        code: 201,
      };

      // Mock the function before the code that should call it
      mockGeomagneticAuthService.authGeomagneticUserService.mockResolvedValue(
        geomagneticUserData,
      );

      // Create a mock Request object
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'EncryptedMemberId',
        },
        // Add any other properties you need for the test
      };

      // Make a POST request to trigger the route handler
      await request(app.getHttpServer())
        .post('/auth')
        .set(
          'Authorization',
          `Bearer ${mockRequest}`, // Replace with your actual auth token
        )
        .send({
          message: {
            data: '',
          },
        })
        .expect(201); // Assuming a successful response

      // Expect the mock to have been called at least once
      expect(
        mockGeomagneticAuthService.authGeomagneticUserService,
      ).toBeCalled();
    }, 10000);
  });
  describe('checkGeomagneticRegistration', () => {
    it('should call the service method when making a POST request', async () => {
      const geomagneticUserData = {
        data: {
          geomagneticUserId: 'mockedUserId',
        },
        message: 'OK',
        code: 201,
      };

      // Mock the function before the code that should call it
      mockGeomagneticRegisterService.registGeomagneticUserService.mockResolvedValue(
        geomagneticUserData,
      );

      // Create a mock Request object
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'EncryptedMemberId',
        },
        // Add any other properties you need for the test
      };

      // Make a POST request to trigger the route handler
      await request(app.getHttpServer())
        .post('/register')
        .set(
          'Authorization',
          `Bearer ${mockRequest}`, // Replace with your actual auth token
        )
        .send({
          message: {
            data: '',
          },
        })
        .expect(201); // Assuming a successful response

      // Expect the mock to have been called at least once
      expect(
        mockGeomagneticRegisterService.registGeomagneticUserService,
      ).toBeCalled();
    }, 10000);
  });
});
