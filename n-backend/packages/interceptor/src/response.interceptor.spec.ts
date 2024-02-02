import { CommonService } from '@cainz-next-gen/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import {
  ArgumentsHost,
  CallHandler,
  ContextType,
  ExecutionContext,
  Type,
} from '@nestjs/common';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let commonService: CommonService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonService, LoggingService],
    }).compile();

    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(new ResponseInterceptor(commonService)).toBeDefined();
  });

  it('should be defined these methods', () => {
    expect(new ResponseInterceptor(commonService).intercept).toBeDefined();
  });

  it('should be added requestId and timestamp', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-request-id': 'dummyRequestId',
          },
        }),
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => of({ data: { name: 'dummyResponseObject' } }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = new ResponseInterceptor<any>(commonService).intercept(
      context,
      next,
    );

    const request = await firstValueFrom(result);
    expect(request?.data?.name).toBe('dummyResponseObject');
    expect(request?.requestId).toBeDefined();
    expect(request?.timestamp).toBeDefined();
  });
});
