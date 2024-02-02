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

import { FindSearchesDto } from './dto/find.search-query.dto';
import { SearchesService } from './searches.service';

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

    let visitorId = 'unknownUser';
    if (visitorIdHeader) {
      visitorId = Array.isArray(visitorIdHeader)
        ? visitorIdHeader[0]
        : visitorIdHeader;
    }

    const data = await this.searchService.search(findSearchesDto, visitorId);

    return { code: HttpStatus.OK, message: 'ok', data };
  }
}
