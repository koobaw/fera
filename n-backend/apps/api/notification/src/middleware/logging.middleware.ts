import { Request, Response } from 'express';

import { LoggingService } from '@cainz-next-gen/logging';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware<Request, Response> {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  use(req: Request, res: Response, next: () => void) {
    req.headers['x-request-id'] = this.commonService.generateRequestId();
    req.headers['x-correlation-id'] = this.commonService.generateCorrelationId(
      req.headers,
      req.body,
    );
    this.logger.info(`Request caught {${req.baseUrl} ${req.method}}`);
    next();
  }
}
