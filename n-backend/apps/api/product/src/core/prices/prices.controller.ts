import { Request } from 'express';

import { CommonService } from '@fera-next-gen/common';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@fera-next-gen/guard';
import { TransformSavePipe } from '../../pipes/save.pipe';
import { FindPricesDto } from './dto/find.prices.dto';
import { PricesService } from './prices.service';

@Controller('prices')
export class PricesController {
  constructor(
    private readonly pricesService: PricesService,
    private readonly commonService: CommonService,
  ) {}

  @Get(':productIds/:storeCodes/:membershipRank')
  @UseGuards(AuthGuard)
  async findPrices(
    @Req() req: Request,
    @Param() findPricesDto: FindPricesDto,
    @Query('save', TransformSavePipe) needSaveToFireStore,
  ) {
    const products = await this.pricesService.fetchPrices(findPricesDto);

    if (needSaveToFireStore) {
      const operatorName = this.commonService.createFirestoreSystemName(
        req.url,
        req.method,
      );
      await this.pricesService.saveToFirestore(products, operatorName);
    }

    return { code: HttpStatus.OK, message: 'ok', data: products };
  }
}
