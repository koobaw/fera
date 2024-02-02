import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { GetMembershipRankResponse } from '../../core/cartproducts/interfaces/getmembershipRank.interface';

@Injectable()
export class GetMembershipRank {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Get membership rank / 会員ランクを取得する
   * @param { string } bearerToken bearerToken /ベアラートークン
   * @param { string } rank rank /ランク
   * @returns membership rank / 会員ランク
   */
  public async getMembershipRank(bearerToken: string, rank: string) {
    this.logger.info('start get membership rank api call');
    const url = this.getUrl();
    const queryParam = {
      select: rank,
    };

    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          params: queryParam,
          headers: {
            Authorization: bearerToken,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException(
              'Private member info acquisition api error occured',
              error,
            );
            this.commonService.createHttpException(
              ErrorCode.PRIVATE_MEMBER_INFO_ACQUISITION_ERROR,
              ErrorMessage[ErrorCode.PRIVATE_MEMBER_INFO_ACQUISITION_ERROR],
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
    this.logger.info(`Private member acquisition irl: ${url} `);
    this.logger.info(
      `Private member acquisition api response: ${JSON.stringify(data)}`,
    );

    const membershipRank = data as GetMembershipRankResponse;
    this.logger.info('end private member info acquisition api');
    return membershipRank;
  }

  /**
   * Gets private member info acquisition api url / 非公開会員情報取得API URLを取得
   * @returns private member info acqquisition api url as string /
   * プライベートメンバー情報取得 API URL を文字列として指定
   */
  private getUrl(): string {
    return (
      this.env.get<string>('PRIVATE_MEMBER_INFORMATION_ACQUISITION_BASE_URL') +
      this.env.get<string>('PRIVATE_MEMBER_INFORMATION_ACQUISITION_END_POINT')
    );
  }
}
