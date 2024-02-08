import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { ConfigService } from '@nestjs/config';
import { SalesforceAuthGuard } from '@cainz-next-gen/guard';
import { ReturnService } from './return.service';
import {
  ReturnRequest,
  ReturnResponse,
} from './interface/pocket-regi-return.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('return-status')
export class ReturnController {
  constructor(
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
    private readonly pocketRegiReturnService: ReturnService,
  ) {}

  /**
   * Controller to set the return date in firestore / Firestoreで返却日を設定するコントローラー
   * @param { ReturnRequestObject } returnReqObj request containing orderIdForCustomer /
   * orderIdForCustomer を含むリクエスト
   * @returns promise of object ReturnResponse / オブジェクトReturnResponseの約束
   */
  @Post()
  @UseGuards(SalesforceAuthGuard)
  public async checkReturnStatus(@Body() returnReqObj: ReturnRequest) {
    if (!returnReqObj || !returnReqObj.orderId) {
      this.commonService.createHttpException(
        ErrorCode.BAD_REQUEST_PARAMETERS,
        ErrorMessage[ErrorCode.BAD_REQUEST_PARAMETERS],
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      returnReqObj.orderId.length !== 21 ||
      typeof returnReqObj.orderId !== 'string'
    ) {
      this.commonService.createHttpException(
        ErrorCode.BAD_REQUEST_INVALID_ORDER_ID,
        ErrorMessage[ErrorCode.BAD_REQUEST_INVALID_ORDER_ID],
        HttpStatus.BAD_REQUEST,
      );
    }

    const returnRequest: ReturnRequest = {
      orderId: returnReqObj.orderId,
    };

    const result: ReturnResponse =
      await this.pocketRegiReturnService.fetchAndSetReturnDate(returnRequest);
    return result;
  }
}
