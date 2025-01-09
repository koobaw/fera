import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { SalesforceAuthGuard } from '@fera-next-gen/guard';
import { ConfigService } from '@nestjs/config';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { ReturnRequest } from './interface/pocket-regi-return.interface';

class MockSalesforceAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.headers = {
      client_id: 'VALID_CLIENT_ID',
      client_secret: 'VALID_CLIENT_SECRET',
    };
    return true; // always allow
  }
}

const mockPocketRegiReturnService = {
  fetchAndSetReturnDate: jest.fn(),
};

const mockCommonService = {
  createHttpException: jest.fn(),
};

describe('PocketRegiReturnController', () => {
  let controller: ReturnController;
  let app: INestApplication;
  let mockReturnRequest: ReturnRequest;
  const mockSalesforceAuthGuard = new MockSalesforceAuthGuard();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnController],
      providers: [
        {
          provide: ReturnService,
          useValue: mockPocketRegiReturnService,
        },
        {
          provide: CommonService,
          useValue: mockCommonService,
        },
        {
          provide: ConfigService,
          useFactory: () => ({
            get: jest.fn(),
          }),
        },
      ],
    })
      .overrideGuard(SalesforceAuthGuard)
      .useValue(mockSalesforceAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
    controller = module.get<ReturnController>(ReturnController);

    mockReturnRequest = {
      orderId: '085920230615140830530',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should be defined methods', () => {
    expect(controller.checkReturnStatus).toBeDefined();
  });
  describe('should call controller method', () => {
    it('should get 201 from the request', async () => {
      const response = await request(app.getHttpServer())
        .post('/return-status')
        .set('Authorization', 'bearer VALID_TOKEN')
        .set('client_id', 'MOCK_CLIENT_ID')
        .set('client_secret', 'MOCK_CLIENT_SECRET')
        .send(mockReturnRequest);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toBeDefined();
    });
    it('should return proper response from controller method', async () => {
      const body = {
        orderId: '085920230615140830537',
      };
      const expectedResult = {
        message: 'OK',
        code: 201,
      };
      mockPocketRegiReturnService.fetchAndSetReturnDate.mockResolvedValueOnce(
        expectedResult,
      );
      const result = await controller.checkReturnStatus(body);
      expect(result).toBe(expectedResult);
    });
    it('should throw bad request parameters error', async () => {
      const body = {
        orderId: '',
      };
      await controller.checkReturnStatus(body as any);
      jest.spyOn(mockCommonService, 'createHttpException').mockImplementation();
      expect(mockCommonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.BAD_REQUEST_PARAMETERS,
        ErrorMessage[ErrorCode.BAD_REQUEST_PARAMETERS],
        HttpStatus.BAD_REQUEST,
      );
    });
    it('should throw invalid orderId', async () => {
      const body = {
        orderId: '085920230615',
      };
      await controller.checkReturnStatus(body as any);
      jest.spyOn(mockCommonService, 'createHttpException').mockImplementation();
      expect(mockCommonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.BAD_REQUEST_INVALID_ORDER_ID,
        ErrorMessage[ErrorCode.BAD_REQUEST_INVALID_ORDER_ID],
        HttpStatus.BAD_REQUEST,
      );
    });
  });
});
