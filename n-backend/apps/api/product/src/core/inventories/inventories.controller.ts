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
import { FindInventoriesDto } from './dto/find.inventories.dto';
import { InventoriesService } from './inventories.service';
import { TransformSavePipe } from '../../pipes/save.pipe';

@Controller('inventories')
export class InventoriesController {
  constructor(
    private readonly inventoriesService: InventoriesService,
    private readonly commonService: CommonService,
  ) {}

  @Get('/:productIds/:storeCodes')
  @UseGuards(AuthGuard)
  async findInventories(
    @Req() req: Request,
    @Param() findInventoriesDto: FindInventoriesDto,
    @Query('save', TransformSavePipe) needSaveToFireStore,
    @Query('coefficient') coefficient = 1.0,
  ) {
    const inventories = await this.inventoriesService.fetchInventories(
      findInventoriesDto,
      coefficient,
    );

    if (needSaveToFireStore) {
      const operatorName = this.commonService.createFirestoreSystemName(
        req.originalUrl,
        req.method,
      );
      await this.inventoriesService.saveToFirestore(inventories, operatorName);
    }

    return { code: HttpStatus.OK, message: 'ok', data: inventories };
  }
}
