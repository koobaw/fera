import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Logger } from '@nestjs/common';

describe('articles e2e', () => {
  const TIMEOUT_MLLISECONDS = 10000;
  let httpService: HttpService;
  let logger: Logger;
  beforeAll(() => {
    httpService = new HttpService();
    httpService.axiosRef.defaults.timeout = TIMEOUT_MLLISECONDS;
    logger = new Logger();
  });

  // process.envから取得する環境変数は cloudbuild-{環境}-e2e.yaml で設定しています
  it('should be success to access v1/users/member/private-profile', async () => {
    /**
     * NOTE:
     * Private-profile needs before action that is fera login and feraapp login action.
     * This e2e test is complex, so I'll put it on hold.
     */
  });
});
