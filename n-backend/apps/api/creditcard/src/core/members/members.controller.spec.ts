import request from 'supertest';

import { AuthGuard } from '@fera-next-gen/guard';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../app.module';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { RegisterMemberIdResponse } from './interfaces/registerMemberIdMule';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

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

describe('RegisterMemberIdController', () => {
  let controller: MembersController;
  let app: INestApplication;
  const mockMembersService = {
    registerMemberId: jest.fn(),
  };
  const mockAuthGuard = new MockAuthGuard();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useFactory: () => mockMembersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();
    app = module.createNestApplication();
    await app.init();
    controller = module.get<MembersController>(MembersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.registerMemberId).toBeDefined();
  });

  describe('should register memberId with gmo', () => {
    it('should throw error if encrypted member is undefined', async () => {
      await expect(
        controller.registerMemberId(<never>{
          claims: {
            userId: 'dummyUserId',
          },
        }),
      ).rejects.toThrow(
        ErrorMessage[ErrorCode.MEMBER_ID_GET_CLAIM_MEMBER_NOT_FOUND],
      );
    });
    it('should call this method', async () => {
      // Create a mock response from service / サービスからの模擬応答を作成する
      mockMembersService.registerMemberId.mockImplementation(
        async (): Promise<RegisterMemberIdResponse> => ({
          code: 201,
          message: 'OK',
          data: {
            muleRequestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
          },
        }),
      );
      // Create a mock Request object / モックリクエストオブジェクトを作成する
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'EncryptedMemberId',
        },
      };
      // Hit the mock api with mock request / モックリクエストでモックAPIをヒットする
      const response = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${mockRequest}`);

      expect(mockMembersService.registerMemberId).toBeCalled();
      // Check if controller is returning expected result / コントローラーが期待した結果を返しているかどうかを確認する
      const result = {
        muleRequestId: 'd7f091aa-02d3-42db-ae03-8016c7c72714',
      };

      expect(response.body.code).toEqual(HttpStatus.CREATED);
      expect(response.body.data).toEqual(result);
    });
  });
});
