import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { LogoutController } from './logout.controller';
import { GlobalsModule } from '../../globals.module';
import { LogoutService } from './logout.service';

describe('LogoutController', () => {
  let controller: LogoutController;
  let logoutService: LogoutService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [LogoutController],
      providers: [
        LogoutService,
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
    }).compile();

    controller = module.get<LogoutController>(LogoutController);
    logoutService = module.get<LogoutService>(LogoutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.logout).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should be call these methods', async () => {
      jest
        .spyOn(logoutService, 'deleteFromFirebaseAuthClaims')
        .mockImplementation();
      await expect(
        controller.logout(<never>{
          claims: {
            userId: 'dummyUserId',
            encryptedMemberId: 'dummyEncryptedMemberId',
          },
        }),
      ).resolves.toEqual({
        code: HttpStatus.OK,
        message: 'ok',
      });
      expect(logoutService.deleteFromFirebaseAuthClaims).toBeCalled();
    });
  });

  it('should be return error', async () => {
    jest
      .spyOn(logoutService, 'deleteFromFirebaseAuthClaims')
      .mockImplementation();
    await expect(
      controller.logout(<never>{
        claims: {
          userId: 'dummyUserId',
        },
      }),
    ).rejects.toThrow(ErrorMessage[ErrorCode.LOGOUT_CLAIM_EMPTY]);
    expect(logoutService.deleteFromFirebaseAuthClaims).not.toBeCalled();
  });
});
