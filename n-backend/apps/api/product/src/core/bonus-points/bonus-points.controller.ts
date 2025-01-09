import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';

import { GetBonusPointsDto } from './dto/get.bonus-point-query.dto';
import { BonusPointsService } from './bonus-points.service';

@Controller('bonus-points')
export class BonusPointsController {
  constructor(private readonly bonusPointsService: BonusPointsService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async getPoints(@Query() getBonusPointsDto: GetBonusPointsDto) {
    const data = await this.bonusPointsService.getPoints(getBonusPointsDto);

    return { code: HttpStatus.OK, message: 'ok', data };
  }
}
