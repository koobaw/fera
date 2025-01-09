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
  it(
    'should be able to access api/product/v1/prices/:product/:shop/:member_num with a get request',
    async () => {
      const response = await firstValueFrom(
        httpService.get(
          `${process.env.E2E_TEST_BASE_URL}/prices/4524804125739/815/0`,
          {
            headers: {
              'feraapp-api-key': process.env.feraAPP_API_KEY,
            },
            params: {
              save: 'false',
            },
          },
        ),
      );
      expect(response.status).toBe(HttpStatus.OK);
      logger.log(response.data);
    },
    TIMEOUT_MLLISECONDS,
  );
});
