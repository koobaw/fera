import { Request, Response } from 'express';
import { ErrorMessage, GlobalErrorCode } from 'src/error-code';

import { LoggingService } from '@fera-next-gen/logging';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CommonService } from '@fera-next-gen/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let loggingService: LoggingService;
  let commonService: CommonService;

  beforeAll(async () => {
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
      ],
    }).compile();

    loggingService = module.get<LoggingService>(LoggingService);
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(
      new HttpExceptionFilter(loggingService, commonService),
    ).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(
      new HttpExceptionFilter(loggingService, commonService).catch,
    ).toBeDefined();
  });

  it('should be matched response when post ErrorCode', () => {
    const dummyError = {
      errorCode: 'DUMMY_ERROR_CODE',
      message: 'DUMMY_ERROR_MESSAGE',
    };

    const exception = new HttpException(
      dummyError,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      exception,
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.errorCode).toBe(dummyError.errorCode);
    expect(resObject?.message).toBe(dummyError.message);
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });

  it('should be matched response when post ErrorCode less message', () => {
    const dummyError = {
      errorCode: 'DUMMY_ERROR_CODE',
    };

    const exception = new HttpException(
      dummyError,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      exception,
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.errorCode).toBe(dummyError.errorCode);
    expect(resObject?.message).toBe(
      ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
    );
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });

  it('should be matched response when post GlobalErrorCode', () => {
    const exception = new HttpException(
      GlobalErrorCode.INTERNAL_SERVER_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      exception,
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.errorCode).toBe(GlobalErrorCode.INTERNAL_SERVER_ERROR);
    expect(resObject?.message).toBe(
      ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
    );
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });

  it('should be matched response when post Validation Error', () => {
    const dummyError = {
      message: ['limit must be number', 'order must be string'],
    };

    const exception = new HttpException(dummyError, HttpStatus.BAD_REQUEST);

    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      exception,
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.BAD_REQUEST);
    expect(resObject?.code).toBe(HttpStatus.BAD_REQUEST);
    expect(resObject?.errorCode).toBe(GlobalErrorCode.BAD_PARAMETER);
    expect(resObject?.message).toBe(
      `${
        ErrorMessage[GlobalErrorCode.BAD_PARAMETER]
      },${dummyError.message.join()}`,
    );
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });

  it('should be matched response when post Error with string', () => {
    const errorMessage = 'DUMMY_ERROR';
    const exception = new HttpException(
      errorMessage,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      exception,
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.errorCode).toBe(GlobalErrorCode.INTERNAL_SERVER_ERROR);
    expect(resObject?.message).toBe(errorMessage);
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });

  it('should be matched response when post Error other than HttpException ', () => {
    const req = {
      url: jest.fn(),
      body: jest.fn(),
      headers: {
        'x-request-id': 'dummy-request-id',
        'x-correlation-id': 'dummy-correlation-id',
      },
    } as unknown as Request;

    let resStatus;
    let resObject;

    const res = {} as unknown as Response;
    res.status = jest.fn((status) => {
      resStatus = status;
      return res;
    });
    res.json = jest.fn((object) => {
      resObject = object;
      return object;
    });

    const dummyArgumentsHost = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => req),
        getResponse: jest.fn(() => res),
      })),
    } as unknown as ArgumentsHost;

    new HttpExceptionFilter(loggingService, commonService).catch(
      new Error(),
      dummyArgumentsHost,
    );

    expect(resStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(resObject?.errorCode).toBe(GlobalErrorCode.INTERNAL_SERVER_ERROR);
    expect(resObject?.message).toBe(
      ErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
    );
    expect(resObject.timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2}/,
    );
  });
});
