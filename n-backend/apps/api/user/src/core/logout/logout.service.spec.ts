import { Test, TestingModule } from '@nestjs/testing';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';

import { GlobalsModule } from '../../globals.module';
import { LogoutService } from './logout.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

describe('LogoutService', () => {
  let service: LogoutService;
  jest.mock('firebase-admin/auth');

  beforeAll(() => {
    initializeApp();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
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
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<LogoutService>(LogoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('method be defined', () => {
    expect(service.deleteFromFirebaseAuthClaims).toBeDefined();
  });

  describe('logout', () => {
    it('should be call these methods', async () => {
      const setCustomUserClaimsSpy = jest
        .spyOn(getAuth(), 'setCustomUserClaims')
        .mockResolvedValue();

      await expect(
        service.deleteFromFirebaseAuthClaims('fbJxxPrNBxRs9HRKUSxq6jVDh0W2'),
      ).resolves.not.toThrow();

      expect(setCustomUserClaimsSpy).toBeCalled();
    });

    it('should be error', async () => {
      const setCustomUserClaimsSpy = jest
        .spyOn(getAuth(), 'setCustomUserClaims')
        .mockRejectedValue(new Error('set claim failed'));

      await expect(
        service.deleteFromFirebaseAuthClaims('fbJxxPrNBxRs9HRKUSxq6jVDh0W2'),
      ).rejects.toThrow(ErrorMessage[ErrorCode.LOGOUT_DELETE_FROM_CLAIM]);
      expect(setCustomUserClaimsSpy).toBeCalled();
    });
  });
});
