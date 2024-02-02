import { Injectable } from '@nestjs/common';

@Injectable()
export class SendService {
  getHello(): string {
    return 'Hello World!';
  }
}
