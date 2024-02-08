import { Test, TestingModule } from '@nestjs/testing';
import { getAuth } from 'firebase-admin/auth';
import { CommonService } from '@cainz-next-gen/common';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { MemberAuthGuard } from './memeber-auth.guard';

jest.mock('firebase-admin/auth');

const mockContext: ExecutionContext = {
  switchToHttp: jest.fn(() => ({
    getRequest: () => ({
      headers: {
        authorization: 'Bearer dummyToken',
      },
    }),
  })),
} as any;

describe('MemberAuthGuard', () => {
  let guard: MemberAuthGuard;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        MemberAuthGuard,
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
      ],
    }).compile();

    guard = module.get<MemberAuthGuard>(MemberAuthGuard);
  });

  it('should pass normally', async () => {
    // define parameters
    const mockDecodedIdToken = {
      user_id: 'dummyUserId',
      encryptedMemberId: 'dummyEncryptedMemberId',
      accessToken: 'dummyAccessToken',
      refreshToken: 'dummyRefreshToken',
    };
    // define mock
    (getAuth as unknown as jest.Mock).mockReturnValue({
      verifyIdToken: () => mockDecodedIdToken,
    });
    // check method
    const result = await guard.canActivate(mockContext);
    expect(result).toBeTruthy();
  });

  it('should throw error by authorization header is undefined', async () => {
    // define parameters
    const emptyMockContext: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: undefined,
          },
        }),
      })),
    } as any;
    // check method
    expect(guard.canActivate(emptyMockContext)).rejects.toThrow(HttpException);
  });
  it('should throw error by authorization header is no token', async () => {
    // define parameters
    const emptyMockContext: ExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer ',
          },
        }),
      })),
    } as any;
    // check method
    expect(guard.canActivate(emptyMockContext)).rejects.toThrow(HttpException);
  });
  it('should throw error by not member login with licking one property', async () => {
    // define parameters
    const mockDecodedIdToken = {
      user_id: 'dummyUserId',
      encryptedMemberId: 'dummyEncryptedMemberId',
      accessToken: 'dummyAccessToken',
      refreshToken: '',
    };
    // define mock
    (getAuth as unknown as jest.Mock).mockReturnValue({
      verifyIdToken: () => mockDecodedIdToken,
    });
    // check method
    expect(guard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });
  it('should throw error by not member login with licking many property', async () => {
    // define parameters
    const mockDecodedIdToken = {
      user_id: 'dummyUserId',
      encryptedMemberId: '',
      accessToken: '',
      refreshToken: '',
    };
    // define mock
    (getAuth as unknown as jest.Mock).mockReturnValue({
      verifyIdToken: () => mockDecodedIdToken,
    });
    // check method
    expect(guard.canActivate(mockContext)).rejects.toThrow(HttpException);
  });
});
