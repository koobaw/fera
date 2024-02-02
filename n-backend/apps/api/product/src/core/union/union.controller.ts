import { Request } from 'express';
import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';

import { AuthGuard } from '@cainz-next-gen/guard';
import { FindUnionParamDto } from './dto/find.union-param.dto';
import { TransformSavePipe } from '../../pipes/save.pipe';
import { FindUnionQueryDto } from './dto/find.union-query.dto';
import { UnionService } from './union.service';

@Controller()
export class UnionController {
  constructor(
    private readonly unionService: UnionService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/:productIds(\\d*)/')
  @UseGuards(AuthGuard)
  async findInventories(
    @Req() req: Request,
    @Param() paramDto: FindUnionParamDto,
    @Query() queryDto: FindUnionQueryDto,
    @Query('save', TransformSavePipe) needSaveToFireStore,
  ) {
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );
    const details = await this.unionService.fetchDetails(paramDto);
    const prices = await this.unionService.fetchPrices(paramDto, queryDto);
    const inventories = await this.unionService.fetchInventories(
      paramDto,
      queryDto,
    );

    const responseData = this.unionService.transformData(
      details,
      prices,
      inventories,
      queryDto,
    );

    if (needSaveToFireStore) {
      await this.unionService.saveToFireStore(
        queryDto,
        operatorName,
        details,
        prices,
        inventories,
      );
    }

    return { code: HttpStatus.OK, message: 'ok', data: responseData };
  }
}
