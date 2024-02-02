import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@cainz-next-gen/guard';
import { Claims } from 'packages/types/src/claims';
import { CommonService } from '@cainz-next-gen/common';
import { GetCardsService } from './get.cards/get.cards.service';
import { RegisterCardService } from './register.cards/register.cards.service';
import {
  CreditCardResponse,
  DeleteCardRequest,
  RegisterCardRequest,
} from './interface/creditcards.response';
import { DeleteCardService } from './delete.cards/delete.cards.service';

@Controller('cards')
export class CardsController {
  constructor(
    private creditCardService: GetCardsService,
    private registerCardService: RegisterCardService,
    private deleteCardService: DeleteCardService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * Controller to register credit card / クレジットカードを登録するコントローラー
   * @param {Request } request Request body sent from the frontend containing credit card token /
   * クレジット カード トークンを含むフロントエンドから送信されるリクエスト本文
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns promise of object CreditCardResponse /
   * オブジェクト CreditCardResponse の約束
   */
  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async registerCreditCard(@Req() request: Request & { claims?: Claims }) {
    // Get credit token from request body / リクエストボディからクレジットトークンを取得する
    const { token, brand } = request.body;

    const userClaims: Claims = request.claims;

    // Create the credit card registration request body / クレジットカード登録リクエストボディを作成する
    const registCreditCard: RegisterCardRequest = {
      claims: userClaims,
      token,
    };
    const operatorName = this.commonService.createFirestoreSystemName(
      request.originalUrl,
      request.method,
    );
    const result: CreditCardResponse =
      await this.registerCardService.registerCreditCard(
        registCreditCard,
        brand,
        operatorName,
      );
    return result;
  }

  /**
   * Api method return credit cards detail / API メソッドでクレジット カードの詳細を返す
   * @param req request with auth encrypted token / 認証暗号化トークンを使用したリクエスト
   * @param claims it is object that return userId, encryptedMemberId, accessToken and refreshToken
   * @returns result credit cards. / 結果のクレジットカード。
   */
  @Get('/')
  @UseGuards(AuthGuard)
  async renderCreditCards(@Req() req: Request & { claims?: Claims }) {
    const userClaims: Claims = req.claims;
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    const result = await this.creditCardService.getCreditCards(
      userClaims,
      operatorName,
    );
    return result;
  }

  /**
   * Controller to delete credit card / クレジットカードを削除するコントローラー
   * @param request Request params sent from the frontend containing card seq /
   * カードシーケンスを含むフロントエンドから送信されるリクエストパラメータ
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @returns promise of object CreditCardResponse /
   * オブジェクト CreditCardResponse の約束
   */
  @Delete('/:cardSeq')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async deleteCreditCard(@Req() request: Request & { claims?: Claims }) {
    // Get cardSeq from request params / リクエストパラメータから Cardseq を取得する
    const { cardSeq } = request.params;

    const userClaims: Claims = request.claims;

    // Create the delete credit card request body / クレジット カード リクエスト本文の作成、削除
    const deleteCreditCard: DeleteCardRequest = {
      userClaims,
      cardSequentialNumber: cardSeq,
    };

    const result: CreditCardResponse =
      await this.deleteCardService.deleteCreditCard(deleteCreditCard);
    return result;
  }
}
