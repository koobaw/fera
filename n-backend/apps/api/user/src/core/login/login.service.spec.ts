import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { LoginService } from './login.service';
import { GlobalsModule } from '../../globals.module';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { MuleMembershipReadResponseSuccess } from './interface/login.interface';

describe('LoginService', () => {
  let loginService: LoginService;
  let mockedHttpService: jest.MockedObjectDeep<HttpService>;
  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({ doc: jest.fn() })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  beforeAll(() => {
    initializeApp();
  });
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        LoginService,
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
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

    loginService = module.get<LoginService>(LoginService);
    mockedHttpService = jest.mocked<HttpService>(
      module.get<HttpService>(HttpService),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(loginService).toBeDefined();
  });

  describe('getUserInfo', () => {
    it('should return userInfo', async () => {
      const salesforceUserId = 'dummySalesforceUserId';
      const memberId = 'dummyMemberId';
      const userInfo = {
        cardNoContact: memberId,
        address1: 'dummyAddress1',
        address2: 'dummyAddress2',
        address3: 'dummyAddress3',
        membershipLevel: '4',
      };
      jest.spyOn(mockedHttpService, 'get').mockReturnValue(
        of({
          data: userInfo,
        }),
      );
      await expect(loginService.getUserInfo(salesforceUserId)).resolves.toEqual(
        userInfo,
      );
    });
    it('should throw LOGIN_NG_SALESFORCE_USER_ID error when mule api returns error', async () => {
      const salesforceUserId = 'dummySalesforceUserId';
      jest
        .spyOn(mockedHttpService, 'get')
        .mockImplementationOnce(() => throwError(() => new Error('test')));
      await expect(loginService.getUserInfo(salesforceUserId)).rejects.toThrow(
        ErrorMessage[ErrorCode.LOGIN_NG_SALESFORCE_USER_ID],
      );
    });
  });

  describe('saveToFirebaseAuthClaims', () => {
    it('should save to firebase auth claims', async () => {
      const mockedUserId = 'dummyUserId';
      const mockedEncryptedMemberId = 'dummyEncryptedMemberId';
      const mockedTokenData = {
        accessToken: 'dummyAccessToken',
        refreshToken: 'dummyRefreshToken',
      };

      const spyGetAuth = jest
        .spyOn(getAuth(), 'setCustomUserClaims')
        .mockResolvedValue();
      await loginService.saveToFirebaseAuthClaims(
        mockedUserId,
        mockedEncryptedMemberId,
        mockedTokenData,
      );
      expect(spyGetAuth).toBeCalled();
    });
  });

  describe('transferToMember', () => {
    it('should skip when user document exists', async () => {
      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              exists: true,
              data: jest.fn().mockReturnValue({}),
            })),
            collection: jest
              .fn()
              .mockImplementation(() => ({ doc: jest.fn() })),
          })),
        }));

      const spyInitialUserFromAnonymousUser = jest
        .spyOn(loginService, <never>'initialUserFromAnonymousUser')
        .mockImplementation();
      const spyInitialUser = jest
        .spyOn(loginService, <never>'initialUser')
        .mockImplementation();
      const spyInitialMyStore = jest
        .spyOn(loginService, <never>'initialMyStore')
        .mockImplementation();
      const spyCopyAndDeleteOriginalCollection = jest
        .spyOn(loginService, <never>'copyAndDeleteOriginalCollection')
        .mockImplementation();
      const userInfo = {
        cardNoContact: 'dummyMemberId',
        address1: 'dummyAddress1',
        address2: 'dummyAddress2',
        address3: 'dummyAddress3',
        membershipLevel: '4',
      } as MuleMembershipReadResponseSuccess;

      await loginService.transferToMember(null, null, null, userInfo);
      expect(spyInitialUserFromAnonymousUser).not.toBeCalled();
      expect(spyInitialUser).not.toBeCalled();
      expect(spyInitialMyStore).not.toBeCalled();
      expect(spyCopyAndDeleteOriginalCollection).not.toBeCalled();
    });

    it('should transfer to member even if anonymous user document does not exist', async () => {
      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        // mock both anonymous user doc and user doc
        .mockImplementation(() => ({
          doc: jest.fn().mockImplementation(() => ({
            get: jest.fn().mockImplementation(() => ({
              exists: false,
              data: jest.fn().mockReturnValue({}),
            })),
            collection: jest
              .fn()
              .mockImplementation(() => ({ doc: jest.fn() })),
          })),
        }));
      const userInfo = {
        cardNoContact: 'dummyMemberId',
        address1: 'dummyAddress1',
        address2: 'dummyAddress2',
        address3: 'dummyAddress3',
        membershipLevel: '4',
      } as MuleMembershipReadResponseSuccess;

      const spyInitialUser = jest.spyOn(loginService, <never>'initialUser');
      await loginService.transferToMember(null, null, null, userInfo);

      expect(spyInitialUser).toBeCalledTimes(1);
      expect(mockFirestoreBatchService.batchSet).toBeCalledTimes(2);
      expect(mockFirestoreBatchService.batchCommit).toBeCalledTimes(1);
    });

    it('should transfer to member', async () => {
      // mock data
      const oldOperatorName = 'dummyOldOperatorName';
      const dummySubCollectionData = {
        createdBy: oldOperatorName,
        updatedBy: oldOperatorName,
      };

      // mock
      jest
        .spyOn(mockFirestoreBatchService, 'findCollection')
        // mock anonymous user
        .mockImplementationOnce(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest
              .fn()
              // favoriteProducts
              .mockImplementationOnce(() => ({
                id: 'favoriteProducts',
                get: jest.fn().mockImplementation(() => ({
                  docs: [
                    {
                      data: jest.fn().mockReturnValue(dummySubCollectionData),
                    },
                    {
                      data: jest.fn().mockReturnValue(dummySubCollectionData),
                    },
                  ],
                })),
              }))
              // openedAnnouncement
              .mockImplementationOnce(() => ({
                id: 'openedAnnouncement',
                get: jest.fn().mockImplementation(() => ({
                  docs: [
                    {
                      data: jest.fn().mockReturnValue(dummySubCollectionData),
                    },
                    {
                      data: jest.fn().mockReturnValue(dummySubCollectionData),
                    },
                  ],
                })),
              }))
              .mockImplementation(() => ({
                id: 'someOtherSubCollection',
                get: jest.fn().mockImplementation(() => ({
                  docs: [],
                })),
              })),
            get: jest.fn().mockImplementationOnce(() => ({
              exists: true,
              data: jest.fn().mockReturnValue({}),
            })),
          })),
        }))
        // mock user
        .mockImplementationOnce(() => ({
          doc: jest.fn().mockImplementation(() => ({
            collection: jest.fn().mockImplementation(() => ({
              doc: jest.fn(),
            })),
            get: jest.fn().mockImplementationOnce(() => ({
              exists: false,
              data: jest.fn().mockReturnValue({}),
            })),
          })),
        }));

      const spyInitialUserFromAnonymousUser = jest.spyOn(
        loginService,
        <never>'initialUserFromAnonymousUser',
      );
      const spyCopyAndDeleteOriginalCollection = jest.spyOn(
        loginService,
        <never>'copyAndDeleteOriginalCollection',
      );

      const spyBatchSet = jest
        .spyOn(mockFirestoreBatchService, 'batchSet')
        .mockImplementation();
      const userInfo = {
        cardNoContact: 'dummyMemberId',
        address1: 'dummyAddress1',
        address2: 'dummyAddress2',
        address3: 'dummyAddress3',
        membershipLevel: '4',
      } as MuleMembershipReadResponseSuccess;
      await loginService.transferToMember(null, null, null, userInfo);
      expect(spyInitialUserFromAnonymousUser).toBeCalledTimes(1);
      expect(spyCopyAndDeleteOriginalCollection).toBeCalledTimes(6);
      expect(spyBatchSet).toBeCalledTimes(6);
      expect(mockFirestoreBatchService.batchDelete).toBeCalledTimes(4);
      expect(mockFirestoreBatchService.batchCommit).toBeCalled();
    });
  });
});
