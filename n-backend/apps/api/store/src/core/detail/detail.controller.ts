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

import { AuthGuard } from '@cainz-next-gen/guard';
import { CommonService } from '@cainz-next-gen/common';
import { DetailService } from './detail.service';
import { DetailDto } from './dto/detail.dto';
import { TransformSavePipe } from '../../pipes/save.pipe';

@Controller('detail')
export class DetailController {
  constructor(
    private readonly detailService: DetailService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/:storeCodes')
  @UseGuards(AuthGuard)
  async findDetails(
    @Req() req: Request,
    @Query('save', TransformSavePipe) needSaveToFireStore,
    @Param() detailDto: DetailDto,
  ) {
    const details = await this.detailService.getDetail(detailDto);

    if (needSaveToFireStore) {
      const operatorName = this.commonService.createFirestoreSystemName(
        req.originalUrl,
        req.method,
      );
      await this.detailService.saveToFirestore(details, operatorName);
    }

    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: details,
    };
  }
}
