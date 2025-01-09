import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Claims } from 'packages/types/src/claims';
import {
  RegisterMemberIdMuleResponse,
  RegisterMemberIdResponse,
} from './interfaces/registerMemberIdMule';
import { CreditUtilService } from '../../utils/credit-util.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly httpService: HttpService,
    private readonly creditUtilService: CreditUtilService,
  ) {}

  /**
   * Registers member id in mule and gmo system / muleとgmoシステムに会員IDを登録
   * @param { Claims } claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns success response from mule of type RegisterMemberIdMuleResponse / RegisterMemberIdMuleResponse タイプの Mule からの成功応答
   */
  public async registerMemberId(
    claims: Claims,
  ): Promise<RegisterMemberIdResponse> {
    this.logger.info('start register member ID');

    const memberId = await this.creditUtilService.getDecryptedMemberId(claims);

    // remove the zeroes and get the memberId / ゼロを削除して memberId を取得します
    const params = {
      id: memberId,
    };

    const baseUrl = this.env.get<string>('MULE_CREDIT_BASE_URL');
    const endPoint = this.env.get<string>(
      'REGISTER_CREDIT_CARD_MEMBER_ID_MULE',
    );
    const url = baseUrl + endPoint;

    const { data } = await firstValueFrom(
      this.httpService
        .post(url, params, {
          headers: {
            client_id: this.env.get<string>('MULE_POCKET_REGI_CLIENT_ID'),
            client_secret: this.env.get<string>(
              'MULE_POCKET_REGI_CLIENT_SECRET',
            ),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.commonService.logException('Mule API occurred Error', error);
            const { errCode, errMessage, status } =
              this.creditUtilService.handleException(error);
            throw new HttpException(
              {
                errorCode: errCode,
                message: errMessage,
              },
              status,
            );
          }),
        ),
    );
    this.logger.info(`Mule api url: ${url}`);
    this.logger.info(`Mule api response: ${JSON.stringify(data)}`);

    const successResult = data as RegisterMemberIdMuleResponse;

    const result: RegisterMemberIdResponse = {
      code: HttpStatus.CREATED,
      message: 'OK',
      data: {
        muleRequestId: successResult.cid,
      },
    };

    this.logger.info('end register member id');
    return result;
  }
}
