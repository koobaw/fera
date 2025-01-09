import * as crypto from 'crypto';
import { IncomingHttpHeaders } from 'http';
import { LoggingService } from '@fera-next-gen/logging';
import * as uuid from 'uuid';
import { HttpException } from '@nestjs/common/exceptions';
import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';
import firestore from '@google-cloud/firestore';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CloudTasksClient, protos } from '@google-cloud/tasks';
import { CommonService } from './common.service';

jest.mock('uuid');

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  createDecipheriv: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue('Hello'),
    final: jest.fn().mockReturnValue('World'),
  }),
}));

jest.mock('@google-cloud/tasks', () => {
  const actual = jest.requireActual('@google-cloud/tasks');
  return {
    ...jest.genMockFromModule<object>('@google-cloud/tasks'),
    protos: actual.protos,
  };
});

process.env.APP_ENV = 'local';
const logger: LoggingService = new LoggingService();
const service: CommonService = new CommonService(logger);

describe('CommonService', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFirestoreOperatorName', () => {
    it('should be defined', () => {
      expect(service.createFirestoreSystemName).toBeDefined();
    });

    it('should create system name', () => {
      expect(service.createFirestoreSystemName('/path/name', 'get')).toBe(
        '/path/name:get',
      );
      expect(service.createFirestoreSystemName('/path/name', 'GET')).toBe(
        '/path/name:get',
      );
    });

    it('should throw error when mistake method', () => {
      expect(() => {
        service.createFirestoreSystemName('/path/name', 'NOT_REQUEST_METHOD');
      }).toThrow();
    });
  });

  describe('getClaims', () => {
    it('should be defined', () => {
      expect(service.getClaims).toBeDefined();
    });

    it('should get claims', () => {
      expect(
        service.getClaims(
          'eyJhY2Nlc3NUb2tlbiI6IlVJZWpsOXNmSmdGc0ZzcjdQQXJXSVpoRVRHYjd3aCt2aG9kejdHQytEM00zVEZXWXJxTHZBS2hlZ3RsSjBRYUZJWnlYUkZYeFhuOWYrbXFCczFsb3k5b2xjY0FGTGp5UmpJVUJnSlVBalJ1ekMvN001VGRVbk9veVZNSTcvcEREVSswR24wNnFkVkFVTHZhOUdCcHUxNXh3MWdrd1ptWG1wcElJZEZrV3BaVT0iLCJyZWZyZXNoVG9rZW4iOiJLZUZ0ZmlFUHBzbXoxVm03dkxraE9ZVFdQYVJUWFo4L2h2VVVMMmQwV3BRYlJVRW42V2ZnT1FQeWd3cFJkbkx6UDNVZ2NFVXg3VGtZeHU1QWdKRENRdzNzTnpsSkhNd0hzdFE5NmVidUYrNDZDaVVueDQwZnpsamdGRG1hMURiRSIsImVuY3J5cHRlZE1lbWJlcklkIjoiTlk4Uk5WRHNFYU5RTGtSdEgxTHZ2S1NVRTV0dG95bm51UEhNRU90ZnQwMD0iLCJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jYWluei1zZWFyY2hyZC1kZXYiLCJhdWQiOiJjYWluei1zZWFyY2hyZC1kZXYiLCJhdXRoX3RpbWUiOjE2NzgyNDA3MzQsInVzZXJfaWQiOiJjZGVmSENnR1FyaFNURENVVDZ1bmhneW9nV0QzIiwic3ViIjoiY2RlZkhDZ0dRcmhTVERDVVQ2dW5oZ3lvZ1dEMyIsImlhdCI6MTY3OTU2MzMxOCwiZXhwIjoxNjc5NTY2OTE4LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImFub255bW91cyJ9fQ==',
        ),
      ).toEqual({
        accessToken:
          'UIejl9sfJgFsFsr7PArWIZhETGb7wh+vhodz7GC+D3M3TFWYrqLvAKhegtlJ0QaFIZyXRFXxXn9f+mqBs1loy9olccAFLjyRjIUBgJUAjRuzC/7M5TdUnOoyVMI7/pDDU+0Gn06qdVAULva9GBpu15xw1gkwZmXmppIIdFkWpZU=',
        encryptedMemberId: 'NY8RNVDsEaNQLkRtH1LvvKSUE5ttoynnuPHMEOtft00=',
        refreshToken:
          'KeFtfiEPpsmz1Vm7vLkhOYTWPaRTXZ8/hvUUL2d0WpQbRUEn6WfgOQPygwpRdnLzP3UgcEUx7TkYxu5AgJDCQw3sNzlJHMwHstQ96ebuF+46CiUnx40fzljgFDma1DbE',
        userId: 'cdefHCgGQrhSTDCUT6unhgyogWD3',
      });
    });

    it('should throw error when failed to parse user token', () => {
      expect(() => {
        service.getClaims('a');
      }).toThrow('Failed to parse user token.');
    });

    it('should throw error when user token is invalid', () => {
      expect(() => {
        service.getClaims(
          'eyJhY2Nlc3NUb2tlbiI6IlVJZWpsOXNmSmdGc0ZzcjdQQXJXSVpoRVRHYjd3aCt2aG9kejdHQytEM00zVEZXWXJxTHZBS2hlZ3RsSjBRYUZJWnlYUkZYeFhuOWYrbXFCczFsb3k5b2xjY0FGTGp5UmpJVUJnSlVBalJ1ekMvN001VGRVbk9veVZNSTcvcEREVSswR24wNnFkVkFVTHZhOUdCcHUxNXh3MWdrd1ptWG1wcElJZEZrV3BaVT0iLCJyZWZyZXNoVG9rZW4iOiJLZUZ0ZmlFUHBzbXoxVm03dkxraE9ZVFdQYVJUWFo4L2h2VVVMMmQwV3BRYlJVRW42V2ZnT1FQeWd3cFJkbkx6UDNVZ2NFVXg3VGtZeHU1QWdKRENRdzNzTnpsSkhNd0hzdFE5NmVidUYrNDZDaVVueDQwZnpsamdGRG1hMURiRSIsImVuY3J5cHRlZE1lbWJlcklkIjoiTlk4Uk5WRHNFYU5RTGtSdEgxTHZ2S1NVRTV0dG95bm51UEhNRU90ZnQwMD0iLCJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jYWluei1zZWFyY2hyZC1kZXYiLCJhdWQiOiJjYWluei1zZWFyY2hyZC1kZXYiLCJhdXRoX3RpbWUiOjE2NzgyNDA3MzQsInN1YiI6ImNkZWZIQ2dHUXJoU1REQ1VUNnVuaGd5b2dXRDMiLCJpYXQiOjE2Nzk1NjMzMTgsImV4cCI6MTY3OTU2NjkxOCwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0=',
        );
      }).toThrow('Invalid user token.');
    });
  });

  describe('generateRequestId', () => {
    it('should throw error when failed to generate request id', () => {
      jest.spyOn(uuid, 'v4').mockImplementation(() => {
        throw new Error('oh no!');
      });
      expect(() => {
        service.generateRequestId();
      }).toThrow('Failed to generate requestId.');
    });
  });

  describe('generateCorrelationId', () => {
    it('should return x-correlation-id in headers', () => {
      const correlationId = 'dummyCorrelationId';
      const headers = {
        'x-correlation-id': correlationId,
      } as IncomingHttpHeaders;
      expect(service.generateCorrelationId(headers, undefined)).toBe(
        correlationId,
      );
    });

    it('should return x-correlation-id in headers if both headers and body have correlationId', () => {
      const headerCorrelationId = 'dummyHeaderCorrelationId';
      const bodyCorrelationId = 'dummyBodyCorrelationId';
      const headers = {
        'x-correlation-id': headerCorrelationId,
      } as IncomingHttpHeaders;
      const body = { correlationId: bodyCorrelationId };

      expect(service.generateCorrelationId(headers, body)).toBe(
        headerCorrelationId,
      );
    });

    it('should return correlationId in body if headers does not have correlationId', () => {
      const bodyCorrelationId = 'dummyBodyCorrelationId';
      const body = { correlationId: bodyCorrelationId };
      expect(service.generateCorrelationId(undefined, body)).toBe(
        bodyCorrelationId,
      );
    });

    it('should return generated correlationId if both headers and body do not have correlationId', () => {
      const correlationId = 'dummyCorrelationId';
      jest.spyOn(uuid, 'v4').mockReturnValue(correlationId);
      expect(service.generateCorrelationId(undefined, undefined)).toBe(
        correlationId,
      );
    });

    it('should throw error when x-correlation-id in headers is not string', () => {
      const headerCorrelationId = ['badCorrelationId', 1234];
      const headers = {
        'x-correlation-id': headerCorrelationId,
      } as IncomingHttpHeaders;
      expect(() => {
        service.generateCorrelationId(headers, undefined);
      }).toThrow('CorrelationId in headers is not string.');
    });

    it('should throw error when failed to generate correlationId id', () => {
      jest.spyOn(uuid, 'v4').mockImplementation(() => {
        throw new Error('oh no!');
      });
      expect(() => {
        service.generateCorrelationId({} as IncomingHttpHeaders, undefined);
      }).toThrow('Failed to generate correlationId.');
    });
  });

  describe('convertDateToJST', () => {
    it('should convert a date string to JST format', () => {
      const testDate = '2023-08-24';
      const expectedResult = '2023-08-24T00:00:00+09:00';

      expect(service.convertDateToJST(testDate)).toBe(expectedResult);
    });

    it('should throw an error if the date format is incorrect', () => {
      const invalidDates = [
        '20202-05-15', // 年が5桁
        '2020-13-05', // 月が13
        '2020-05-32', // 日が32
        '2020-5-15', // 月が1桁
        '2020-05-5', // 日が1桁
        '20-05-15', // 年が2桁
        'randomString', // 完全に異なる文字列
      ];

      invalidDates.forEach((date) => {
        expect(() => service.convertDateToJST(date)).toThrowError(
          'This string is not the expected date type(YYYY-MM-DD)',
        );
      });
    });

    it('should not throw an error for valid dates', () => {
      const validDates = ['2020-05-15', '2020-12-31', '2020-01-01'];
      validDates.forEach((date) => {
        expect(() => service.convertDateToJST(date)).not.toThrow();
      });
    });
  });

  describe('convertDateStringToJstTimestampString', () => {
    it('should convert a date string to JST format', () => {
      const testDate = '2023-08-24';
      const expectedResult = '2023-08-24T00:00:00+09:00';

      expect(service.convertDateStringToJstTimestampString(testDate)).toBe(
        expectedResult,
      );

      const testDate8601 = '2023-08-24T00:13:21';

      expect(service.convertDateStringToJstTimestampString(testDate8601)).toBe(
        expectedResult,
      );

      const testDate8601JST = '2023-08-24T00:13:21+09:00';

      expect(
        service.convertDateStringToJstTimestampString(testDate8601JST),
      ).toBe(expectedResult);

      const testDateYYYYMMDD = '20230824';

      expect(
        service.convertDateStringToJstTimestampString(testDateYYYYMMDD),
      ).toBe(expectedResult);
    });

    it('should return null if the date format is incorrect or null', () => {
      const invalidDates = [
        '20202-05-15', // 年が5桁
        '2020-13-05', // 月が13
        '2020-05-32', // 日が32
        '2020-5-15', // 月が1桁
        '2020-05-5', // 日が1桁
        '20-05-15', // 年が2桁
        'randomString', // 完全に異なる文字列
        null, // null
      ];

      invalidDates.forEach((date) => {
        expect(service.convertDateStringToJstTimestampString(date)).toBe(null);
      });
    });
  });

  describe('convertToTimestampWithNull', () => {
    it('should convert a date string to firestore timestamp', () => {
      const testDate = '2023-08-24T00:00:00';
      const expectedResult = firestore.Timestamp.fromDate(new Date(testDate));

      const res = service.convertToTimestampWithNull(testDate);
      expect(res).toEqual(expectedResult);
    });

    it('should throw an error if the date format is incorrect', () => {
      const invalidDates = [
        '20202-05-15', // 年が5桁
        '2020-13-05', // 月が13
        '2020-05-32', // 日が32
        '20-05-15', // 年が2桁
        'randomString', // 完全に異なる文字列
      ];

      invalidDates.forEach((date) => {
        expect(() => service.convertToTimestampWithNull(date)).toThrowError(
          'This string cannot to convert timestamp',
        );
      });
    });

    it('should not throw an error for valid dates', () => {
      const validDates = ['2020-05-15', '2020-12-31', '2020-01-01'];
      validDates.forEach((date) => {
        expect(() => service.convertToTimestampWithNull(date)).not.toThrow();
      });
    });
  });

  describe('stringifyWithoutCircularRefs', () => {
    it('should return stringified object', () => {
      const circularReference = { a: 1, b: 2, myself: null };
      circularReference.myself = circularReference;
      const expectString = '{"a":1,"b":2}';

      expect(service.stringifyWithoutCircularRefs(circularReference)).toBe(
        expectString,
      );
    });
  });

  describe('logException', () => {
    it('should not throw error', () => {
      expect(() => {
        service.logException('AAA API error', new AxiosError('axios error'));
      }).not.toThrow();
      expect(() => {
        service.logException(
          'XXX API error',
          new HttpException('bad request', 400),
        );
      }).not.toThrow();
      expect(() => {
        service.logException('BBB API error', new Error('new Error'));
      }).not.toThrow();
      expect(() => {
        service.logException('CCC API error', null);
      }).not.toThrow();
      expect(() => {
        service.logException('DDD API error', undefined);
      }).not.toThrow();
      expect(() => {
        service.logException('EEE API error', {});
      }).not.toThrow();
      expect(() => {
        service.logException('FFF API error', { fuga: 'hoge' });
      }).not.toThrow();
    });
  });

  describe('should throw HttpException', () => {
    it('should throw error', async () => {
      const errCode = 'ApiError.7002';
      const errMessage = 'Bad Request';
      const statusCode = HttpStatus.BAD_REQUEST;
      expect(() => {
        service.createHttpException(errCode, errMessage, statusCode);
      }).toThrow(HttpException);
    });
  });

  describe('encryptAES256', () => {
    it('should defind encryptAES256 method', async () => {
      expect(service.encryptAES256).toBeDefined();
    });

    it('should return empty encrypted string if any fun param empty', async () => {
      const res = service.encryptAES256('', 'ab', 'xy');
      expect(res).toEqual('');
    });
    it('should return empty encrypted string if any fun param null', async () => {
      const res = service.encryptAES256(null, 'ab', 'xy');
      expect(res).toEqual('');
    });
  });

  describe('decryptAES256', () => {
    const dummyKey = '0123456789abcdief0123456789abcde';
    const dummyIv = '0123456789abcdef';
    it('should defind decryptAES256 method', async () => {
      expect(service.decryptAES256).toBeDefined();
    });

    it('should return empty decrypted string if any fun param empty', async () => {
      const res = service.decryptAES256('', 'ab', 'xy');
      expect(res).toEqual('');
    });
    it('should return empty decrypted string if any fun param null', async () => {
      const res = service.decryptAES256(null, 'ab', 'xy');
      expect(res).toEqual('');
    });

    it('should return decrypted value', async () => {
      const encrpytedText = 'a7f58fd727b15d16f3da6c562d6c51cc';
      const res = service.decryptAES256(encrpytedText, dummyKey, dummyIv);
      expect(res).toEqual('HelloWorld');
    });

    it('should decrypt text which encrpyted with method encryptAES256()', async () => {
      const originalText = 'HelloWorld';
      const encrpytedText = service.encryptAES256(
        originalText,
        dummyKey,
        dummyIv,
      );
      expect(service.decryptAES256(encrpytedText, dummyKey, dummyIv)).toEqual(
        originalText,
      );
    });
  });

  describe('createMd5', () => {
    it('should defind createMd5 method', async () => {
      expect(service.createMd5).toBeDefined();
    });

    it('should return the correct MD5 hash for a given string', () => {
      const testString = 'hello world';
      const expectedMd5 = crypto
        .createHash('md5')
        .update(testString)
        .digest('hex');
      expect(service.createMd5(testString)).toBe(expectedMd5);
    });
  });

  describe('createTask', () => {
    it('should defind createTask method', async () => {
      expect(service.createTask).toBeDefined();
    });

    it('should call this method', async () => {
      await service.createTask(
        'test',
        'test',
        'test',
        'test',
        'test',
        protos.google.cloud.tasks.v2.HttpMethod.POST,
        undefined,
      );

      const mockCloudTasksClientInstance = jest.mocked(CloudTasksClient);
      const instance = mockCloudTasksClientInstance.mock.instances[0];

      expect(instance.createTask).toHaveBeenCalled();
    });
  });
});
