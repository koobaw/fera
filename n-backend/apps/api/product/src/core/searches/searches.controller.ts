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

import { FindSearchesDto } from './dto/find.search-query.dto';
import { SearchesService } from './searches.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchesService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async search(
    @Req() request: Request,
    @Query() findSearchesDto: FindSearchesDto,
  ) {
    const visitorIdHeader = request.headers['visitor-id'];
    if (!visitorIdHeader) {
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: ErrorCode.SEARCH_VISITOR_ID_NOT_FOUND,
          message: ErrorMessage[ErrorCode.SEARCH_VISITOR_ID_NOT_FOUND],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const visitorId = Array.isArray(visitorIdHeader)
      ? visitorIdHeader[0]
      : visitorIdHeader;

    const data = await this.searchService.search(findSearchesDto, visitorId);

    return { code: HttpStatus.OK, message: 'ok', data };
  }
}
