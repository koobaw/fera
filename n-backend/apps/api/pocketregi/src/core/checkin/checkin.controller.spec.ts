import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';
import { AppModule } from '../../app.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp().getRequest();
    http.claims = {
      userId: 'KOjEk7IC7RZKaCREmpJohKvfFg82',
      encryptedMemberId: 'NY8RNVDsEaNQLkRtH1LvvGEqSjrWwh3VuJDQO7Tn0IQ=',
    };
    return true;
  }
}

describe('CheckinController', () => {
  let controller: CheckinController;
  let service: CheckinService;
  let app: INestApplication;
  let body;
  const mockAuthGuard = new MockAuthGuard();
  const mockCheckinService = {
    pocketRegiCheckIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [CheckinController],
      providers: [{ provide: CheckinService, useValue: mockCheckinService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<CheckinController>(CheckinController);
    service = module.get<CheckinService>(CheckinService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.checkIn).toBeDefined();
  });

  describe('should checkin and update the check in time', () => {
    body = {
      qrCodeData: 'feraapp://qr?shopcode={859}',
      checkInTime: '2023-11-15T02:00:10.000Z',
    };

    const expectedResult = {
      data: {
        storeName: 'Test',
        storeCode: '859',
        storeAddress: 'Test Address',
      },
      code: 200,
      message: 'ok',
    };

    const mockToken =
      'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhNTE5MDc0NmU5M2JhZTI0OWIyYWE3YzJhYTRlMzA2M2UzNDFlYzciLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUU9kQWZCSXVSUV95R1h2cjlaOW9XZEp0Ljc4OGlaaHZoTFBXd2QwWFVDaHRPYzZDYVpzektjSDFIcGtEVk42MGZ2SXp3WkZyU1R4cTNfbW9GdnExRFFZeU1OQTAiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lUZlZ4RHdPeEdPYTVOQWVhdWF6OWFDeDE0NkJna0dGMXRNOHNpVWJBbTMxaUdtSHoiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkdFcVNqcld3aDNWdUpEUU83VG4wSVE9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTg3OTA4NiwidXNlcl9pZCI6IktPakVrN0lDN1JaS2FDUkVtcEpvaEt2ZkZnODIiLCJzdWIiOiJLT2pFazdJQzdSWkthQ1JFbXBKb2hLdmZGZzgyIiwiaWF0IjoxNjk2Mzk4NzQzLCJleHAiOjE2OTY0MDIzNDMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.SF4rG9ZvGcCwVWT8oSGpqMfmOen1rJBaoKuZ6MZ_cQIJ29MCT4YK_ty_XchzSmcpx_0Vlv9BFfb3HawPlcHJpMpxkt8QRCjAagQc-q2RoLQYvEc7bZZhFn8Fdd6kYPFwnIG5rb006hZjwfKekWXgT8a1nONjmaXdRX5WE2mCRi5VdKQiLb4hOPg9cZwCsUYqRIDg0fP8D8DH8q3UYtMOa-yjYfex2wHJL544-yre1e6sLXmdSv8Fsb7d3-54uNW5RHE59tzaCp9yz-UidtG0je8Zmr8N-ZwEhdJUe4erP4T-imOpQapaYWInJqbBT_DxgFXwil2VRYd9wcG0GHPCUg';

    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .post('/check-in')
        .set('Authorization', mockToken)
        .send(body);
      expect(response.statusCode).toBe(HttpStatus.OK);

      jest
        .spyOn(mockCheckinService, 'pocketRegiCheckIn')
        .mockResolvedValue(expectedResult);
    });
  });
});
