import {
  Controller,
  Post,
  Req,
  HttpCode,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { Claims } from 'packages/types/src/claims';
import { AuthGuard } from '@cainz-next-gen/guard';
import { CommonService } from '@cainz-next-gen/common';
import { SettlementService } from './settlement.service';
import { SettlementResponse } from './interface/settlement.interface';
import { SettlementDto } from './dto/settlement.dto';

@Controller('settlement')
export class SettlementController {
  constructor(
    private readonly settlementService: SettlementService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * settlement / チェックイン
   * @param req req HTTP request object it contains orderId (string value), storeCode (string value), totalAmount (number value), paymentMethod (string value), cardSequentialNumber (string value), appVer (string value) / req HTTP リクエスト オブジェクトには、orderId (文字列値)、storeCode (文字列値)、totalAmount (数値値)、paymentMethod (文字列値)、cardSequentialNumber (文字列値)、appVer (文字列値) が含まれます。
   * @returns promise of object SettlementResponse / オブジェクト SettlementResponse の約束
   */
  @Post('')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async settlement(
    @Req() req: Request & { claims?: Claims },
    @Body() settlementRequest: SettlementDto,
  ): Promise<SettlementResponse> {
    const userClaims: Claims = req.claims;

    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );

    const response = await this.settlementService.creditMuleOrder(
      settlementRequest,
      userClaims,
      operatorName,
    );

    return response;
  }
}
