import { Request } from 'express';
import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';

import { RecommendsService } from './recommends.service';
import { FindRecommendQueryDto } from './dto/find.recommend-query.dto';

@Controller('recommend')
export class RecommendsController {
  constructor(private readonly recommendsService: RecommendsService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async search(
    @Req() request: Request,
    @Query() findRecommendsQueryDto: FindRecommendQueryDto,
  ) {
    const visitorIdHeader = request.headers['visitor-id'];

    let visitorId = 'unknownUser';
    if (visitorIdHeader) {
      visitorId = Array.isArray(visitorIdHeader)
        ? visitorIdHeader[0]
        : visitorIdHeader;
    }

    const data = await this.recommendsService.getRecommend(
      findRecommendsQueryDto,
      visitorId,
    );

    return { code: HttpStatus.OK, message: 'ok', data };
  }
}
