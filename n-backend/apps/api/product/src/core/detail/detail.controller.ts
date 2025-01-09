import { Request } from 'express';

import { CommonService } from '@fera-next-gen/common';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  HttpException,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@fera-next-gen/guard';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

import {
  ProductDetailResponse,
  ProductDetails,
} from './interfaces/detail.interface';
import { DetailService } from './detail.service';
import { DetailDto } from './dto/detail.dto';
import { TransformSavePipe } from '../../pipes/save.pipe';

@Controller('detail')
export class DetailController {
  constructor(
    private readonly detailService: DetailService,
    private readonly commonService: CommonService,
  ) {}

  @Get(':productIds')
  @UseGuards(AuthGuard)
  async findDetails(
    @Req() req: Request,
    @Param() products: DetailDto,
    @Query('save', TransformSavePipe) needSaveToFireStore,
  ) {
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    const data = await this.detailService.getDetail(products);
    if (!data) {
      throw new HttpException(
        {
          errorCode: ErrorCode.DETAIL_NG_NOT_FOUND,
          message: ErrorMessage[ErrorCode.DETAIL_NG_NOT_FOUND],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    if (needSaveToFireStore) {
      await this.detailService.saveToFirestore(data, operatorName);
    }

    return this.transformToResponse(data);
  }

  private transformToResponse(
    products: Array<ProductDetails>,
  ): ProductDetailResponse {
    const detailResponse = products.map((data) => {
      const res = {
        ...data.header,
        ...data.detail,
        specCategories: data.specCategories,
      };
      return res;
    });
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: detailResponse,
    };
  }
}
