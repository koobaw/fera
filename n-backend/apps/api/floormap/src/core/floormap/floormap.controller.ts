import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';
import { AuthGuard } from '@fera-next-gen/guard';
import { FloormapService } from './floormap.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { FloorMapUtilService } from '../../utils/floormap-util.service';
import { FloorMapDto } from './dto/floormap.dto';

@Controller()
export class FloormapController {
  constructor(
    private readonly floormapservice: FloormapService,
    private readonly commonService: CommonService,
    private readonly floorMapUtilService: FloorMapUtilService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  public getFloorMap(@Query() params: FloorMapDto) {
    const { storeCode, productIds } = params;

    const productIdArray: string[] = productIds
      ? this.floorMapUtilService.convertToArray(productIds)
      : [];

    // Check if 'storeCode' is not a non-empty string; if not, create a BAD REQUEST HTTP exception.
    // 'storeCode' が空でない文字列でないかを確認し、そうでない場合はBAD REQUEST HTTP例外を生成します。
    if (!(typeof storeCode === 'string') || storeCode.length === 0) {
      this.commonService.createHttpException(
        ErrorCode.FlOOR_MAP_BADREQUESTSTORECODE,
        ErrorMessage[ErrorCode.FlOOR_MAP_BADREQUESTSTORECODE],
        HttpStatus.BAD_REQUEST,
      );
    }
    const gondolas = this.floormapservice.getFloorMapDataFromDB(
      productIdArray,
      storeCode,
    );

    return gondolas;
  }
}
