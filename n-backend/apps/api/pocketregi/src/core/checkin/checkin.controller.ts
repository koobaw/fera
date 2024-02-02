import { Controller, Post, Req, HttpCode, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Claims } from 'packages/types/src/claims';
import { AuthGuard } from '@cainz-next-gen/guard';
import { CheckinService } from './checkin.service';
import { CheckinResponse } from './interfaces/checkin.interface';

@Controller('check-in')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  /**
   * pocket regi check in / チェックイン
   * @param req req HTTP request object it contains qrCodeData (string value) and checkInTime (string value) / req req qrCodeData (文字列値) と checkInTime (文字列値) を含む HTTP リクエスト オブジェクト
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns promise of object CheckinResponse / オブジェクト CheckinResponse の約束
   */
  @Post('')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  public async checkIn(
    @Req() req: Request & { claims?: Claims },
  ): Promise<CheckinResponse> {
    const userClaims: Claims = req.claims;

    const { encryptedMemberId } = userClaims;
    const response = await this.checkinService.pocketRegiCheckIn(
      req.body.qrCodeData,
      req.body.checkInTime,
      encryptedMemberId,
    );

    return response;
  }
}
