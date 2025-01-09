import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Logger } from '@nestjs/common';

describe('inventories e2e', () => {
  const TIMEOUT_MLLISECONDS = 10000;
  let httpService: HttpService;
  let logger: Logger;
  beforeAll(() => {
    httpService = new HttpService();
    httpService.axiosRef.defaults.timeout = TIMEOUT_MLLISECONDS;
    logger = new Logger();
  });

  // process.envから取得する環境変数は cloudbuild-{環境}-e2e.yaml で設定しています
  it('should pass with query param coefficient', async () => {
    const response = await firstValueFrom(
      httpService.get(
        `${process.env.E2E_TEST_BASE_URL}/inventories/4549509524328/0840,0826`,
        {
          headers: {
            'feraapp-api-key': process.env.feraAPP_API_KEY,
          },
          params: {
            coefficient: 1,
            save: 'false',
          },
        },
      ),
    );
    expect(response.status).toBe(HttpStatus.OK);
    logger.log(response.data);
  });

  it('should pass without query param coefficient', async () => {
    const response = await firstValueFrom(
      httpService.get(
        `${process.env.E2E_TEST_BASE_URL}/inventories/4549509524328/0840,0826`,
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
  });
});
