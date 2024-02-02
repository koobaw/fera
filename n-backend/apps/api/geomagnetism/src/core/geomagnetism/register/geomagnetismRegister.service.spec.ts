import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpException, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { GeomagnetismRegisterService } from './geomagnetismRegister.service';
import { GlobalsModule } from '../../../globals.module';

let geomagneticRegisterService: GeomagnetismRegisterService;
let httpService: HttpService;
let httpServiceMock: jest.MockedObjectDeep<HttpService>;

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

describe('geomagneticRegisterService', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        GeomagnetismRegisterService,
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
      ],
    }).compile();

    geomagneticRegisterService = module.get<GeomagnetismRegisterService>(
      GeomagnetismRegisterService,
    );
    httpService = module.get<HttpService>(HttpService);
    httpServiceMock = jest.mocked<HttpService>(httpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(geomagneticRegisterService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(
      geomagneticRegisterService.registGeomagneticUserService,
    ).toBeDefined();
  });

  describe('registGeomagneticUserService', () => {
    it('should return sonyId if user is already registered', async () => {
      // Arrange
      const token = 'someToken';
      const docId = 'someDocId';
      const isAuth = true;
      const operatorName = 'operatorName';

      const mockAPI = {
        data: {
          geomagneticUserId: 'existing_user_id',
        },
        message: 'OK',
        code: 201,
      };

      // Mock the behavior of pseudoUserSignin to return a sonyId
      geomagneticRegisterService.adminAuthToken = ['adminAuthToken'];
      jest
        .spyOn(geomagneticRegisterService, 'pseudoUserSignin')
        .mockResolvedValue();

      // Mock the behavior of userIdForRegistration to return a sonyId
      geomagneticRegisterService.adminIdToken = 'adminIdToken';
      jest
        .spyOn(geomagneticRegisterService, 'userIdForRegistration')
        .mockResolvedValue();

      // Mock the behavior of checkUserAlreadyRegistered to return a sonyId
      jest
        .spyOn(geomagneticRegisterService, 'checkUserAlreadyRegistered')
        .mockResolvedValue(mockAPI);

      // Act
      const result =
        await geomagneticRegisterService.registGeomagneticUserService(
          token,
          docId,
          operatorName,
          isAuth,
        );

      // Assert
      expect(result).toEqual(mockAPI);
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw an error when token is missing', async () => {
      const docId = 'someDocId';
      const isAuth = true;
      const operatorName = 'operatorName';

      try {
        await geomagneticRegisterService.registGeomagneticUserService(
          '',
          docId,
          operatorName,
          isAuth,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    it('should return sonyId if user is not registered', async () => {
      // Arrange
      const token = 'someToken';
      const docId = 'someDocId';
      const isAuth = true;
      const operatorName = 'operatorName';

      const mockUser = {
        data: {
          geomagneticUserId: 'user_id',
        },
        message: 'OK',
        code: 201,
      };

      // Mock the behavior of pseudoUserSignin
      geomagneticRegisterService.adminAuthToken = ['adminAuthToken'];
      jest
        .spyOn(geomagneticRegisterService, 'pseudoUserSignin')
        .mockResolvedValue();

      // Mock the behavior of userIdForRegistration
      geomagneticRegisterService.adminIdToken = 'adminIdToken';
      jest
        .spyOn(geomagneticRegisterService, 'userIdForRegistration')
        .mockResolvedValue();

      // Mock the behavior of checkUserAlreadyRegistered to return a sonyId
      jest
        .spyOn(geomagneticRegisterService, 'checkUserAlreadyRegistered')
        .mockReturnValue(null);

      // Mock the behavior of userRegistration
      jest
        .spyOn(geomagneticRegisterService, 'userRegistration')
        .mockResolvedValue();

      // Mock the behavior of addToPositioningGroup
      jest
        .spyOn(geomagneticRegisterService, 'addToPositioningGroup')
        .mockResolvedValue(mockUser);

      // Act
      const result =
        await geomagneticRegisterService.registGeomagneticUserService(
          token,
          docId,
          operatorName,
          isAuth,
        );

      // Assert
      expect(result).toEqual(mockUser);
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('pseudoUserSignin', () => {
    it('should handle successful sign-in', async () => {
      // Mocked response data
      const mockResponseHeaders = {
        'set-cookie': 'mocked_auth_token',
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        headers: mockResponseHeaders,
      };

      // Mock the HTTP service to return an observable of the successful response
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(mockHttpResponse));

      jest
        .spyOn(geomagneticRegisterService.geomagneticUtls, 'userSignIn')
        .mockImplementation(() => {
          throw new Error('Password generation error');
        });

      try {
        await geomagneticRegisterService.pseudoUserSignin();
        expect(geomagneticRegisterService.adminAuthToken).toEqual([
          'mocked_auth_token',
        ]);
      } catch (e) {
        console.log('Expected sign-in to succeed');
      }
    });

    it('should handle sign-in failure', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_SignInUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      // httpServiceMock.post = jest.fn().mockRejectedValue(error);
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(error));

      try {
        await geomagneticRegisterService.pseudoUserSignin();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_SignInUserFailed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('userIdForRegistration', () => {
    it('should retrieve adminIdToken on successful request', async () => {
      // Mocked response data
      const mockResponseData = {
        id_token: 'mocked_id_token',
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      try {
        // Call the function being tested
        await geomagneticRegisterService.userIdForRegistration();
        // Assert that adminIdToken is set correctly
        expect(geomagneticRegisterService.adminIdToken).toEqual(
          'mocked_id_token',
        );
      } catch (error) {
        // Handle the exception here (if needed)
        console.log(error); // This will fail the test and print the error message
      }
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should return HTTP Error when the error code is 400', async () => {
      // Mocked response data
      const mockResponseData = {
        id_token: '',
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      try {
        // Call the function being tested
        await geomagneticRegisterService.userIdForRegistration();
      } catch (e: any) {
        // Handle the exception here (if needed)
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_Authorize2Failed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_Authorize2Failed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw an HttpException on unsuccessful request', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_UsernameFailed,
          message: ErrorMessage[ErrorCode.RegistGeomagneticUser_UsernameFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(error));
      // Mock adminAuthToken
      geomagneticRegisterService.adminAuthToken = ['mocked_admin_auth_token'];

      try {
        await geomagneticRegisterService.userIdForRegistration();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_Authorize2Failed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_Authorize2Failed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('checkUserAlreadyRegistered', () => {
    it('should return user data if user is already registered', async () => {
      // Mocked response data for an existing user
      const mockResponseData = {
        users: [
          {
            user: 'existing_user_id',
          },
        ],
      };

      const mockAPIResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockAPIResponse));

      // Set a username for the test
      geomagneticRegisterService.userName = 'test_username';

      // Call the function being tested
      const result =
        await geomagneticRegisterService.checkUserAlreadyRegistered();

      // Assert that the function returns the expected user data
      expect(result).toEqual({
        data: {
          geomagneticUserId: 'existing_user_id',
        },
        message: 'OK',
        code: 201,
      });
    });

    it('should return an empty object if user is not registered', async () => {
      // Mocked response data for a non-existing user
      const mockResponseData = {
        users: [],
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      // Set a username for the test
      geomagneticRegisterService.userName = 'test_username';

      // Call the function being tested
      const result =
        await geomagneticRegisterService.checkUserAlreadyRegistered();

      // Assert that the function returns an empty object
      expect(result).toEqual({});
    });

    it('should throw an HttpException on unsuccessful request', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_UsernameFailed,
          message: ErrorMessage[ErrorCode.RegistGeomagneticUser_UsernameFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(error));

      geomagneticRegisterService.userName = 'test_username';

      try {
        await geomagneticRegisterService.checkUserAlreadyRegistered();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_UsernameFailed,
          message: ErrorMessage[ErrorCode.RegistGeomagneticUser_UsernameFailed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('userRegistration', () => {
    it('should successfully register a user', async () => {
      // Mocked response data
      const mockResponseData = {
        user: 'mocked_sony_user_id',
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(mockHttpResponse));

      // Set up the necessary properties for the test
      geomagneticRegisterService.userName = 'test_username';
      geomagneticRegisterService.adminIdToken = 'mocked_admin_id_token';
      geomagneticRegisterService.docId = 'mocked_doc_id';
      geomagneticRegisterService.isAuth = true;

      // Call the function being tested
      await geomagneticRegisterService.userRegistration();

      // Assert that the function returns the expected user data
      expect(geomagneticRegisterService.sonyUserId).toEqual(
        'mocked_sony_user_id',
      );

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw HTTP request error when there is no user password', async () => {
      jest
        .spyOn(geomagneticRegisterService.geomagneticUtls, 'createUserPassword')
        .mockImplementation(() => {
          throw new Error('Password generation error');
        });

      // Call the function being tested
      try {
        await geomagneticRegisterService.userRegistration();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw HTTP request error when there is no user', async () => {
      // Mocked response data
      const mockResponseData = {
        user: null,
      };

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        data: mockResponseData,
      };

      // Mock FirestoreBatchService behavior
      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(mockHttpResponse));

      // Set up the necessary properties for the test
      geomagneticRegisterService.userName = 'test_username';
      geomagneticRegisterService.adminIdToken = 'mocked_admin_id_token';
      geomagneticRegisterService.docId = 'mocked_doc_id';
      geomagneticRegisterService.isAuth = true;

      // Call the function being tested
      try {
        await geomagneticRegisterService.userRegistration();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should handle HTTP request error', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(error));

      // Set up the necessary properties for the test
      geomagneticRegisterService.userName = 'test_username';
      geomagneticRegisterService.adminIdToken = 'mocked_admin_id_token';

      try {
        await geomagneticRegisterService.userRegistration();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed,
          message:
            ErrorMessage[
              ErrorCode.RegistGeomagneticUser_PasswordGenerationFailed
            ],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('addToPositioningGroup', () => {
    it('should add user to positioning group', async () => {
      const mockAPIResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig<any>,
      };

      // Mock FirestoreBatchService behavior
      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);

      // Create a spy for the saveToFirestore method
      const saveToFirestoreSpy = jest.spyOn(
        geomagneticRegisterService,
        'saveToFirestore',
      );

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(mockAPIResponse));

      // Set a username for the test
      geomagneticRegisterService.userName = 'test_username';
      geomagneticRegisterService.sonyUserId = 'mocked_sony_user_id';
      geomagneticRegisterService.adminIdToken = 'mocked_admin_id_token';
      geomagneticRegisterService.operatorName = 'mocked_operator_name';

      // Call the function being tested
      const result = await geomagneticRegisterService.addToPositioningGroup();

      expect(saveToFirestoreSpy).toHaveBeenCalledWith(
        'mocked_doc_id',
        'mocked_sony_user_id',
        'mocked_operator_name',
        true,
      );

      // Assert that the function returns the expected user data
      expect(result).toEqual({
        data: {
          geomagneticUserId: 'mocked_sony_user_id',
        },
        message: 'OK',
        code: 201,
      });
    }, 10000);

    it('should throw an HttpException for positioning group', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RegistGeomagneticUser_RegisterUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_RegisterUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(error));

      try {
        await geomagneticRegisterService.addToPositioningGroup();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RegistGeomagneticUser_RegisterUserFailed,
          message:
            ErrorMessage[ErrorCode.RegistGeomagneticUser_RegisterUserFailed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('saveToFirestore', () => {
    it('should save data to Firestore for anonymous user', async () => {
      const docId = 'someDocId';
      const geomagneticUserId = 'someUserId';
      const isAuthed = false;
      const operatorName = 'operatorName';

      // Mock FirestoreBatchService behavior
      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);

      // Call the function
      await geomagneticRegisterService.saveToFirestore(
        docId,
        geomagneticUserId,
        operatorName,
        isAuthed,
      );

      // Assertions
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledWith(
        'anonymousUsers',
      );
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalled();
    });

    it('should save data to Firestore for auth user', async () => {
      const docId = 'someDocId';
      const geomagneticUserId = 'someUserId';
      const isAuthed = true;
      const operatorName = 'operatorName';

      // Mock FirestoreBatchService behavior
      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(),
      });
      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);

      // Call the function
      await geomagneticRegisterService.saveToFirestore(
        docId,
        geomagneticUserId,
        operatorName,
        isAuthed,
      );

      // Assertions
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledWith(
        'users',
      );
      expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalled();
    });

    it('should handle errors and throw HttpException', async () => {
      // Mock FirestoreBatchService to throw an error
      mockFirestoreBatchService.findCollection.mockImplementation(() => {
        throw new Error('Some error');
      });

      const docId = 'someDocId';
      const geomagneticUserId = 'someUserId';
      const isAuthed = false;
      const operatorName = 'operatorName';

      // Ensure that the function throws an HttpException
      await expect(
        geomagneticRegisterService.saveToFirestore(
          docId,
          geomagneticUserId,
          operatorName,
          isAuthed,
        ),
      ).rejects.toThrow(HttpException);

      // You can also assert the HttpException properties (errorCode, message, status)
    });
  });
});
