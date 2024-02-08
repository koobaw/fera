import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { SalesforceAuthGuard } from './salesforce-auth.guard';
import { ErrorCode, ErrorMessage } from './error-code';

describe('SalesforceAuthGuard', () => {
  let configService: jest.Mocked<ConfigService>;
  let guard: SalesforceAuthGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        SalesforceAuthGuard,
      ],
    }).compile();
    configService = module.get(ConfigService);
    guard = module.get<SalesforceAuthGuard>(SalesforceAuthGuard);
  });

  it('should be defined', () => {
    expect(new SalesforceAuthGuard(configService)).toBeDefined();
  });

  it('should fail when invalid client_id and client_secret is passed', async () => {
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {
            client_id: 'INVALID_CLIENT_ID',
            client_secret: 'INVALID_CLIENT_ID',
          },
        })),
      })),
    } as unknown as ExecutionContext;
    jest.spyOn(guard, 'authenticateSalesforceLogin').mockRejectedValueOnce(
      new HttpException(
        {
          errorCode: ErrorCode.UNAUTHORIZED_ACCESS,
          message: ErrorMessage[ErrorCode.UNAUTHORIZED_ACCESS],
        },
        HttpStatus.UNAUTHORIZED,
      ),
    );
    const instance = new SalesforceAuthGuard(configService);
    await expect(instance.canActivate(context)).rejects.toThrow(
      ErrorMessage[ErrorCode.UNAUTHORIZED_ACCESS],
    );
  });

  it('should pass when correct client_id client_secret is given', async () => {
    configService.get.mockReturnValueOnce('VALID_CLIENT_ID');
    configService.get.mockReturnValue('VALID_CLIENT_ID');
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {
            client_id: 'VALID_CLIENT_ID',
            client_secret: 'VALID_CLIENT_ID',
          },
        })),
      })),
    } as unknown as ExecutionContext;
    const instance = new SalesforceAuthGuard(configService);
    await expect(instance.canActivate(context)).resolves.toBe(true);
  });

  it('should throw error when client_id and client_secret are not provided', async () => {
    const context = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          headers: {
            client_id: 1234,
            client_secret: 1235,
          },
        })),
      })),
    } as unknown as ExecutionContext;

    const instance = new SalesforceAuthGuard(configService);
    await expect(instance.canActivate(context)).rejects.toThrow(
      ErrorMessage[ErrorCode.INVALID_HEADER],
    );
  });
});
