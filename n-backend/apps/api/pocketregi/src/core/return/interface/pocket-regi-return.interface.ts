import { HttpStatus } from '@nestjs/common';

export interface ReturnRequest {
  orderId: string;
}

export interface ReturnResponse {
  message: string;
  code: HttpStatus;
}

export interface ErrorResponse {
  response: {
    errorCode: string;
    message: string;
  };
  status: HttpStatus;
}
