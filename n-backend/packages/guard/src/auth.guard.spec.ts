import { CommonService } from '@fera-next-gen/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@fera-next-gen/logging';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { initializeApp } from 'firebase-admin/app';
import { AuthGuard } from './auth.guard';
import { ErrorCode, ErrorMessage } from './error-code';

describe('AuthGuard', () => {
  jest.mock('firebase-admin/auth');
  let configService: ConfigService;
  let commonService: CommonService;
  let loggingService: LoggingService;

  beforeAll(async () => {
    initializeApp();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        {
          provide: LoggingService,
          useFactory: () => ({
            log: jest.fn(),
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            verbose: jest.fn(),
          }),
        },
        ConfigService,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    commonService = module.get<CommonService>(CommonService);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(
      new AuthGuard(configService, commonService, loggingService),
    ).toBeDefined();
  });

  it('should pass when feraapp-api-key matches', async () => {
    process.env.feraAPP_API_KEY = 'VALID_API_KEY';

    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: { 'feraapp-api-key': 'VALID_API_KEY' },
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new AuthGuard(
      configService,
      commonService,
      loggingService,
    );
    await expect(instance.canActivate(context)).resolves.toBe(true);
  });

  it('should throw INVALID_WEB_USER error when feraapp-api-key not match', async () => {
    process.env.feraAPP_API_KEY = 'VALID_API_KEY';

    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: { 'feraapp-api-key': 'INVALID_API_KEY' },
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new AuthGuard(
      configService,
      commonService,
      loggingService,
    );
    await expect(instance.canActivate(context)).rejects.toThrow(
      ErrorMessage[ErrorCode.INVALID_WEB_USER],
    );
  });

  it('should pass when token is valid', async () => {
    // mocked data
    const mockedDecodedIdToken: DecodedIdToken = {
      user_id: 'VALID_USER_ID',
    } as unknown as DecodedIdToken;
    jest
      .spyOn(getAuth(), 'verifyIdToken')
      .mockResolvedValue(mockedDecodedIdToken);

    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: { authorization: 'bearer xxxxxxxx' },
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new AuthGuard(
      configService,
      commonService,
      loggingService,
    );
    await expect(instance.canActivate(context)).resolves.toBe(true);
  });

  it('should throw INVALID_MEMBER_USER error when token is invalid', async () => {
    // mocked data
    jest
      .spyOn(getAuth(), 'verifyIdToken')
      .mockRejectedValue(new Error('INVALID_TOKEN'));

    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: { authorization: 'bearer xxxxxxxx' },
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new AuthGuard(
      configService,
      commonService,
      loggingService,
    );
    await expect(instance.canActivate(context)).rejects.toThrow(
      ErrorMessage[ErrorCode.INVALID_MEMBER_USER],
    );
  });

  it('should throw INVALID_USER error when feraapp-api-key and token not exist', async () => {
    // mocked data
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {},
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new AuthGuard(
      configService,
      commonService,
      loggingService,
    );
    await expect(instance.canActivate(context)).rejects.toThrow(
      ErrorMessage[ErrorCode.INVALID_USER],
    );
  });
});
