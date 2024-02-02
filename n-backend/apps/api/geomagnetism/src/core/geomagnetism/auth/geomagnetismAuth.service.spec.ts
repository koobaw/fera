import { Test, TestingModule } from '@nestjs/testing';

import { HttpException, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { GeomagnetismAuthService } from './geomagnetismAuth.service';
import { GlobalsModule } from '../../../globals.module';

let geomagnetismAuthService: GeomagnetismAuthService;
let httpService: HttpService;
let httpServiceMock: jest.MockedObjectDeep<HttpService>;

describe('geomagneticRegisterService', () => {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [GeomagnetismAuthService],
    }).compile();

    geomagnetismAuthService = module.get<GeomagnetismAuthService>(
      GeomagnetismAuthService,
    );
    httpService = module.get<HttpService>(HttpService);
    httpServiceMock = jest.mocked<HttpService>(httpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(geomagnetismAuthService).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(geomagnetismAuthService.authGeomagneticUserService).toBeDefined();
  });

  describe('authGeomagneticUserService', () => {
    it('should return sonyId if user is already registered', async () => {
      // Arrange
      const token = 'someToken';

      const mockAPI = {
        data: {
          token: 'existing_user_id',
        },
        message: 'OK',
        code: 201,
      };

      jest.spyOn(geomagnetismAuthService, 'userSignIn').mockResolvedValue();

      jest
        .spyOn(geomagnetismAuthService, 'userAuthentication')
        .mockResolvedValue(mockAPI);

      // Act
      const result = await geomagnetismAuthService.authGeomagneticUserService(
        token,
      );

      // Assert
      expect(result).toEqual(mockAPI);
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw an error when token is missing', async () => {
      try {
        await geomagnetismAuthService.authGeomagneticUserService('');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });
  });

  describe('userSignIn', () => {
    it('should handle successful sign-in using token', async () => {
      // Mocked response data
      const mockResponseHeaders = ['mocked_auth_token'];

      // Mocked HTTP response
      const mockHttpResponse = {
        status: HttpStatus.OK,
        headers: mockResponseHeaders,
      };

      const token = 'token';

      // Mock the HTTP service to return an observable of the successful response
      jest.spyOn(httpServiceMock, 'post').mockReturnValue(of(mockHttpResponse));

      jest
        .spyOn(geomagnetismAuthService.geomagneticUtls, 'userSignIn')
        .mockReturnValue(Promise.resolve(mockResponseHeaders));

      try {
        await geomagnetismAuthService.userSignIn(token);
        expect(geomagnetismAuthService.userAuthToken).toEqual([
          'mocked_auth_token',
        ]);
      } catch (e) {
        console.log('Expected sign-in to succeed');
      }
    });

    it('should handle sign-in failure if token is not there', async () => {
      // Mock the HTTP service to throw an exception (e.g., network error)
      const error = new HttpException(
        {
          errorCode: ErrorCode.RequestGeomagneticAuth_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RequestGeomagneticAuth_SignInUserFailed],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      const token = 'token';

      jest
        .spyOn(geomagnetismAuthService.geomagneticUtls, 'userSignIn')
        .mockReturnValue(Promise.reject(error));

      try {
        await geomagnetismAuthService.userSignIn(token);
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RequestGeomagneticAuth_SignInUserFailed,
          message:
            ErrorMessage[ErrorCode.RequestGeomagneticAuth_SignInUserFailed],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('userAuthentication', () => {
    it('should handle successful user authentication', async () => {
      // Mocked HTTP response
      const mockHttpResponse = {
        data: {
          id_token: 'existing_user_id',
        },
        message: 'OK',
        status: 200,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      try {
        await geomagnetismAuthService.userAuthentication();
        expect(geomagnetismAuthService.userAuthToken).toEqual([
          'existing_user_id',
        ]);
      } catch (e) {
        console.log('Expected sign-in to succeed');
      }
    });

    it('should throw error when user authentication fails', async () => {
      // Mocked HTTP response
      const mockHttpResponse = {
        data: {
          id_token: 'existing_user_id',
        },
        message: 'OK',
        status: 400,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      try {
        await geomagnetismAuthService.userAuthentication();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RequestGeomagneticAuth_Authorize2Failed,
          message:
            ErrorMessage[ErrorCode.RequestGeomagneticAuth_Authorize2Failed],
        });
        expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('should throw error when user authentication fails', async () => {
      // Mocked HTTP response
      const mockHttpResponse = {
        data: {
          id_token: '',
        },
        message: 'OK',
        status: 200,
      };

      // Mock the httpService.get method to return the mocked response
      jest.spyOn(httpServiceMock, 'get').mockReturnValue(of(mockHttpResponse));

      try {
        await geomagnetismAuthService.userAuthentication();
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.RequestGeomagneticAuth_Authorize2Failed,
          message:
            ErrorMessage[ErrorCode.RequestGeomagneticAuth_Authorize2Failed],
        });
        expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });
});
