import { Test, TestingModule } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import request from 'supertest';
import { CommonService } from '@cainz-next-gen/common';
import { CardsController } from './cards.controller';
import { GlobalsModule } from '../../globals.module';
import {
  CardEn,
  CardResult,
  CreditCardsRes,
} from './interface/creditcards.response';
import { GetCardsService } from './get.cards/get.cards.service';
import { RegisterCardService } from './register.cards/register.cards.service';
import { DeleteCardService } from './delete.cards/delete.cards.service';

const mockCreditCardsData = [
  {
    cardSequentialNumber: '001',
    isPrimary: true,
    maskedCardNumber: '12345',
    expirationDate: '03/26',
    isDeleted: false,
  },
] as CardResult[];
const mockRegisterCardService = {
  registerCreditCard: jest.fn(),
};
const mockCreditcardsRes = {
  data: { cards: mockCreditCardsData } as CardEn,
  message: 'OK',
  code: 200,
} as CreditCardsRes;
const CreditcardServiceStub = {
  getCreditCards: jest.fn(),
};
const mockDeleteCardService = {
  deleteCreditCard: jest.fn(),
};
const mockCommonService = {
  createFirestoreSystemName: jest.fn(),
};

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
describe('CardsController', () => {
  let controller: CardsController;
  let getCardService: GetCardsService;
  let app: INestApplication;
  let registerService: RegisterCardService;
  let deleteService: DeleteCardService;
  let mockClaims;
  let mockRegisterRequest;
  let mockDeleteRequest;
  const mockAuthGuard = new MockAuthGuard();
  beforeEach(async () => {});

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [CardsController],
      providers: [
        {
          provide: RegisterCardService,
          useValue: mockRegisterCardService,
        },
        {
          provide: GetCardsService,
          useValue: CreditcardServiceStub,
        },
        {
          provide: DeleteCardService,
          useValue: mockDeleteCardService,
        },
        {
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<CardsController>(CardsController);
    getCardService = module.get<GetCardsService>(GetCardsService);
    registerService = module.get<RegisterCardService>(RegisterCardService);
    deleteService = module.get<DeleteCardService>(DeleteCardService);
    mockClaims = {
      encryptedMemberId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
    };
    mockRegisterRequest = {
      body: {
        token:
          '33538878188a32670fb63865403ad947a7bb88f71a7db13b5bf17e9007838a00',
      },
      claims: mockClaims,
    };
    mockDeleteRequest = {
      claims: mockClaims,
      params: {
        cardSeq: '2',
      },
    };
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined methods', () => {
    expect(controller.renderCreditCards).toBeDefined();
    expect(controller.registerCreditCard).toBeDefined();
    expect(controller.deleteCreditCard).toBeDefined();
  });

  describe('call register credit card', () => {
    const expectedResult = {
      code: 201,
      message: 'ok',
    };

    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .post('/cards')
        .set(
          'Authorization',
          'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNWM1ZTlmNTdjOWI2NDYzYzg1ODQ1YTA4OTlhOWQ0MTI5MmM4YzMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUY4X09qZ3NtdjVHWWhGVlBoZVVRbmx5d05YcVR0Ykd1V1R3eVNmVld1NEU3Y1NETmxNdFkxbEhXZmxtTm0xb3hCQ2JaVm4uNFpaazhRYWdvRFl0bFZ1QkhUcUMiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbFcuakxVY2FLeDNEX3FhS3ZZaG9OWHNLcHRoRkpsVHFxTmZJbHUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkFTWmpWS0ptNG1uNzlLOCtRTUszUVU9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTk4NzY2MiwidXNlcl9pZCI6IjFPdFFYemNabWZoOWV5SklxYUdEMk9jajdwSjIiLCJzdWIiOiIxT3RRWHpjWm1maDlleUpJcWFHRDJPY2o3cEoyIiwiaWF0IjoxNjk1OTg3NzA3LCJleHAiOjE2OTU5OTEzMDcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.vyd1vOQAjxhYP8AMUio1rQkbRCT_yZWNJ-odH5ouDiHlVfCeGx2TkVp6gT1wo71b5KyV9KlN8Q2OTEaEUOGsDyNUADBPEJlcKXiFLc_IG0d_mVCC7hPBrea1-RUlO0fyhqOXjL4yw1z8pVO4d222AFilhG985mS4qZA0y97SHKU_jx437w2n6Bs1nrQ_3znubqn9yt25rVUFbKuBnxBz_AGkbTnpYrPiZzycQsQ5MApQ81vAAXArNPkU3DdDV_QxadVyVrhRxajLOIkkE5ew_0ocXzrb3R1x-TRWsu9zA_aUfwGZebdCZAPiAVc9M7a2UtMZVKQ4Yy0rrbp9kAT4AQ',
        )
        .send(mockRegisterRequest);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      jest
        .spyOn(registerService, 'registerCreditCard')
        .mockResolvedValue(expectedResult);
      const result = await controller.registerCreditCard(mockRegisterRequest);
      expect(result).toBe(expectedResult);
      expect(registerService.registerCreditCard).toBeCalled();
    });
  });
  describe('should call render credit cards', () => {
    it('should be return no exception', async () => {
      jest.spyOn(getCardService, 'getCreditCards').mockReturnValue(
        new Promise<CreditCardsRes>((resolve) => {
          resolve(mockCreditcardsRes);
        }),
      );
      const res = await controller.renderCreditCards(<never>{
        claims: {
          userId: 'dummyUserId',
          encryptedMemberId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
        },
      });
      expect(res.message).toEqual('OK');
    });
    it('should be call renderCreditCards get method', async () => {
      jest.spyOn(getCardService, 'getCreditCards').mockReturnValue(
        new Promise<CreditCardsRes>((resolve) => {
          resolve(mockCreditcardsRes);
        }),
      );
      // Create a mock Request object
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
        },
      };

      // Make a POST request to trigger the route handler
      const res = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${mockRequest}`)
        .expect(200);
      expect(res.body.data.cards.length).toEqual(1);
    });
  });

  describe('call delete credit card', () => {
    const expectedResult = {
      code: 200,
      message: 'Card Deleted',
    };

    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/cards/${3}`)
        .set(
          'Authorization',
          'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNWM1ZTlmNTdjOWI2NDYzYzg1ODQ1YTA4OTlhOWQ0MTI5MmM4YzMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUY4X09qZ3NtdjVHWWhGVlBoZVVRbmx5d05YcVR0Ykd1V1R3eVNmVld1NEU3Y1NETmxNdFkxbEhXZmxtTm0xb3hCQ2JaVm4uNFpaazhRYWdvRFl0bFZ1QkhUcUMiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbFcuakxVY2FLeDNEX3FhS3ZZaG9OWHNLcHRoRkpsVHFxTmZJbHUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkFTWmpWS0ptNG1uNzlLOCtRTUszUVU9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTk4NzY2MiwidXNlcl9pZCI6IjFPdFFYemNabWZoOWV5SklxYUdEMk9jajdwSjIiLCJzdWIiOiIxT3RRWHpjWm1maDlleUpJcWFHRDJPY2o3cEoyIiwiaWF0IjoxNjk1OTg3NzA3LCJleHAiOjE2OTU5OTEzMDcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.vyd1vOQAjxhYP8AMUio1rQkbRCT_yZWNJ-odH5ouDiHlVfCeGx2TkVp6gT1wo71b5KyV9KlN8Q2OTEaEUOGsDyNUADBPEJlcKXiFLc_IG0d_mVCC7hPBrea1-RUlO0fyhqOXjL4yw1z8pVO4d222AFilhG985mS4qZA0y97SHKU_jx437w2n6Bs1nrQ_3znubqn9yt25rVUFbKuBnxBz_AGkbTnpYrPiZzycQsQ5MApQ81vAAXArNPkU3DdDV_QxadVyVrhRxajLOIkkE5ew_0ocXzrb3R1x-TRWsu9zA_aUfwGZebdCZAPiAVc9M7a2UtMZVKQ4Yy0rrbp9kAT4AQ',
        )
        .send(mockDeleteRequest);
      expect(response.statusCode).toBe(HttpStatus.OK);
      jest
        .spyOn(deleteService, 'deleteCreditCard')
        .mockResolvedValue(expectedResult);
      const result = await controller.deleteCreditCard(mockDeleteRequest);
      expect(result).toBe(expectedResult);
      expect(deleteService.deleteCreditCard).toBeCalled();
    });
  });
});
