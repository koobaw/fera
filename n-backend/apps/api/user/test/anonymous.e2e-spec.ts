import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Logger } from '@nestjs/common';

describe('anonymous e2e', () => {
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
    'should return 401 with invalid token when access v1/users/anonymous/migrate',
    async () => {
      const response = await firstValueFrom(
        httpService.post(
          `${process.env.E2E_TEST_BASE_URL}/anonymous/migrate`,
          null,
          {
            headers: {
              Authorization:
                'bearer eyJhY2Nlc3NUb2tlbiI6IlVJZWpsOXNmSmdGc0ZzcjdQQXJXSWRQajhnSHhLOHV0SWROL05TQit3S2ZkTlBWY1BPRG56UTRvUTliSGRUTVEvVHc0enlTNFZkc0c2VHlCYkdmcWpVdktMWXo4SVNFSFFSZ054cnZkMHp5Rkc4Wm4xVWJMU0h2WUxaU3YxUmlvS3Q4OGN6ekRPQzdBaUg2VTFrT21WY2s0THh4R0o2eGdaeUlJMjZFVG52TT0iLCJyZWZyZXNoVG9rZW4iOiJLZUZ0ZmlFUHBzbXoxVm03dkxraE9ZVFdQYVJUWFo4L2h2VVVMMmQwV3BRYlJVRW42V2ZnT1FQeWd3cFJkbkx6UDNVZ2NFVXg3VGtZeHU1QWdKRENRdzNzTnpsSkhNd0hzdFE5NmVidUYrNDZDaVVueDQwZnpsamdGRG1hMURiRSIsImNhaW56Q2FyZE51bWJlciI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dktTVUU1dHRveW5udVBITUVPdGZ0MDA9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2Fpbnotc2VhcmNocmQtZGV2IiwiYXVkIjoiY2Fpbnotc2VhcmNocmQtZGV2IiwiYXV0aF90aW1lIjoxNjc4MjQwNzM0LCJ1c2VyX2lkIjoiY2RlZkhDZ0dRcmhTVERDVVQ2dW5oZ3lvZ1dEMyIsInN1YiI6ImNkZWZIQ2dHUXJoU1REQ1VUNnVuaGd5b2dXRDMiLCJpYXQiOjE2Nzk2NTE0MzcsImV4cCI6MTY3OTY1NTAzNywiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0',
            },
          },
        ),
      );
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      logger.log(response.data);
    },
    TIMEOUT_MLLISECONDS,
  );
});
