import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';
import { Claims } from 'packages/types/src/claims';
import { CommonService } from '@fera-next-gen/common';
import { Request } from 'express';
import { GeomagnetismAuthService } from './auth/geomagnetismAuth.service';
import { RequestGeomagneticAuthResponse } from './interfaces/geomagnetism.interface';
import { GeomagnetismRegisterService } from './register/geomagnetismRegister.service';

@Controller()
export class GeomagnetismController {
  constructor(
    private readonly geomagneticAuthService: GeomagnetismAuthService,
    private readonly geomagneticService: GeomagnetismRegisterService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Check the geomagnetic registration for a user based on their claims.
   * ユーザーのクレームに基づいて、ユーザーの地磁気登録を確認します。
   *
   * This function is responsible for verifying the geomagnetic registration status of a user
   * based on their claims. It extracts the user's unique identifier (userId) from the claims
   * and calls the `authGeomagneticUserService` method to check the registration status.
   * この関数は、ユーザーのクレームに基づいてユーザーの地磁気登録ステータスを確認する責任を持ちます。
   * ユーザーの一意の識別子（userId）をクレームから抽出し、登録ステータスを確認するために
   * `authGeomagneticUserService` メソッドを呼び出します。
   *
   * @param {Request & { claims?: Claims }} req - The request object containing user claims / ユーザークレームを含むリクエストオブジェクト
   * @returns {Promise<RequestGeomagneticAuthResponse>} - RequestGeomagneticAuthResponse object indicates the user is valid / RequestGeomagneticAuthResponse オブジェクトはユーザーが有効であることを示します
   */
  @Post('/auth')
  @UseGuards(AuthGuard)
  async checkGeomagneticRegistrationAuth(
    @Req() req: Request & { claims?: Claims },
  ): Promise<RequestGeomagneticAuthResponse> {
    const userClaims: Claims = req.claims;
    const { userId } = userClaims;

    const response =
      await this.geomagneticAuthService.authGeomagneticUserService(userId);

    return response;
  }

  /**
   * Function used to check whether the user is registered in SONY envirounment
   * SONY環境にユーザーが登録されているかを確認する機能
   *
   * @param req req HTTP request object with optional custom claims /
   * req オプションのカスタム クレームを含む HTTP リクエスト オブジェクト
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns promise of object RegistGeomagneticUserResponse /
   * オブジェクト RegistGeomagneticUserResponse の約束
   */
  @Post('/register')
  @UseGuards(AuthGuard)
  async checkGeomagneticRegistration(
    @Req() req: Request & { claims?: Claims },
  ) {
    const userClaims: Claims = req.claims;
    const { userId } = userClaims;
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );

    let isAuthed = false;
    let docId = userId;

    if (
      typeof userClaims.encryptedMemberId !== 'undefined' &&
      userClaims.encryptedMemberId !== ''
    ) {
      docId = userClaims.encryptedMemberId;
      isAuthed = true;
    }

    const response = await this.geomagneticService.registGeomagneticUserService(
      userId,
      docId,
      operatorName,
      isAuthed,
    );

    return response;
  }
}
