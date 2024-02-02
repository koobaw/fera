import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';

import { UnregisterController } from './unregister.controller';
import { UnregisterService } from './unregister.service';
import { LogoutService } from '../logout/logout.service';
import { GlobalsModule } from '../../globals.module';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

describe('UnregisterController', () => {
  let controller: UnregisterController;
  let logoutService: LogoutService;
  let unregisterService: UnregisterService;

  process.env.CAINZAPP_API_KEY = 'VALID_API_KEY';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [UnregisterController],
      providers: [
        UnregisterService,
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

    controller = module.get<UnregisterController>(UnregisterController);
    logoutService = module.get<LogoutService>(LogoutService);
    unregisterService = module.get<UnregisterService>(UnregisterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should be defined method', () => {
    expect(controller.unregister).toBeDefined();
  });

  describe('unregister', () => {
    it('should be call these methods', async () => {
      jest
        .spyOn(logoutService, 'deleteFromFirebaseAuthClaims')
        .mockImplementation();
      jest.spyOn(unregisterService, 'deleteFromFirestore').mockImplementation();
      await expect(
        controller.unregister(<never>{
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
      expect(unregisterService.deleteFromFirestore).toBeCalled();
    });
  });

  it('should be return error', async () => {
    jest
      .spyOn(logoutService, 'deleteFromFirebaseAuthClaims')
      .mockImplementation();
    jest.spyOn(unregisterService, 'deleteFromFirestore').mockImplementation();
    await expect(
      controller.unregister(<never>{
        claims: {
          userId: 'dummyUserId',
        },
      }),
    ).rejects.toThrow(ErrorMessage[ErrorCode.UNREGISTER_CLAIM_EMPTY]);
    expect(logoutService.deleteFromFirebaseAuthClaims).not.toBeCalled();
    expect(unregisterService.deleteFromFirestore).not.toBeCalled();
  });
});
