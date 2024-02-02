import { LoggingService } from '@cainz-next-gen/logging';
import { Test, TestingModule } from '@nestjs/testing';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
  let service: LoggingService;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingService, CommonService],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(new LoggingMiddleware(service, commonService)).toBeDefined();
  });
});
