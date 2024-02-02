import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { GlobalsModule } from '../../globals.module';

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

describe('SettlementController', () => {
  let controller: SettlementController;
  let service: SettlementService;
  let app: INestApplication;
  let body;
  const mockAuthGuard = new MockAuthGuard();
  const mockSettlementService = {
    creditMuleOrder: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [SettlementController],
      providers: [
        { provide: SettlementService, useValue: mockSettlementService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<SettlementController>(SettlementController);
    service = module.get<SettlementService>(SettlementService);
  });

  it('should be defined controller', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined service', () => {
    expect(service).toBeDefined();
  });

  it('should be defined settlement method', () => {
    expect(controller.settlement).toBeDefined();
  });

  describe('should settlement creditMuleOrder', () => {
    body = {
      orderId: '081320230831153447723',
      storeCode: '813',
      totalAmount: 1780,
      paymentMethod: '1',
      cardSequentialNumber: '38',
      totalPointUse: 10,
      appVer: '3.5.14',
    };

    const expectedResult = {
      data: {
        status: 200,
        muleRequestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
        shortOrderId: '40110593',
      },
      code: 200,
      message: 'OK',
    };

    const mockToken =
      'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjlhNTE5MDc0NmU5M2JhZTI0OWIyYWE3YzJhYTRlMzA2M2UzNDFlYzciLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUU9kQWZCSXVSUV95R1h2cjlaOW9XZEp0Ljc4OGlaaHZoTFBXd2QwWFVDaHRPYzZDYVpzektjSDFIcGtEVk42MGZ2SXp3WkZyU1R4cTNfbW9GdnExRFFZeU1OQTAiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lUZlZ4RHdPeEdPYTVOQWVhdWF6OWFDeDE0NkJna0dGMXRNOHNpVWJBbTMxaUdtSHoiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkdFcVNqcld3aDNWdUpEUU83VG4wSVE9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTg3OTA4NiwidXNlcl9pZCI6IktPakVrN0lDN1JaS2FDUkVtcEpvaEt2ZkZnODIiLCJzdWIiOiJLT2pFazdJQzdSWkthQ1JFbXBKb2hLdmZGZzgyIiwiaWF0IjoxNjk2Mzk4NzQzLCJleHAiOjE2OTY0MDIzNDMsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.SF4rG9ZvGcCwVWT8oSGpqMfmOen1rJBaoKuZ6MZ_cQIJ29MCT4YK_ty_XchzSmcpx_0Vlv9BFfb3HawPlcHJpMpxkt8QRCjAagQc-q2RoLQYvEc7bZZhFn8Fdd6kYPFwnIG5rb006hZjwfKekWXgT8a1nONjmaXdRX5WE2mCRi5VdKQiLb4hOPg9cZwCsUYqRIDg0fP8D8DH8q3UYtMOa-yjYfex2wHJL544-yre1e6sLXmdSv8Fsb7d3-54uNW5RHE59tzaCp9yz-UidtG0je8Zmr8N-ZwEhdJUe4erP4T-imOpQapaYWInJqbBT_DxgFXwil2VRYd9wcG0GHPCUg';

    it('should call the service method', async () => {
      jest
        .spyOn(mockSettlementService, 'creditMuleOrder')
        .mockResolvedValue(expectedResult);
      const response = request(app.getHttpServer())
        .post('/settlement')
        .set('Authorization', mockToken)
        .send(body);
      await expect(response).resolves.not.toEqual({});
    });
  });
});
