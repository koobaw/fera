import { Request } from 'express';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';

import { RecommendsService } from './recommends.service';
import { FindRecommendQueryDto } from './dto/find.recommend-query.dto';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

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

    if (!visitorIdHeader) {
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: ErrorCode.RECOMMEND_VISITOR_ID_NOT_FOUND,
          message: ErrorMessage[ErrorCode.RECOMMEND_VISITOR_ID_NOT_FOUND],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const visitorId = Array.isArray(visitorIdHeader)
      ? visitorIdHeader[0]
      : visitorIdHeader;

    const data = await this.recommendsService.getRecommend(
      findRecommendsQueryDto,
      visitorId,
    );

    return { code: HttpStatus.OK, message: 'ok', data };
  }
}
