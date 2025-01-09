import { CommonService } from '@fera-next-gen/common';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  requestId: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly commonService: CommonService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const requestId = context.switchToHttp().getRequest().headers[
      'x-request-id'
    ];

    return next.handle().pipe(
      map((data) => ({
        ...data,
        requestId,
        timestamp: this.commonService.getDateTimeStringJST(),
      })),
    );
  }
}
