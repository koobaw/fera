import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@fera-next-gen/guard';
import { CommonService } from '@fera-next-gen/common';
import { SearchStoreDto } from './dto/searchStore.dto';
import { SearchService } from './search.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly commonService: CommonService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async search(@Body() searchStoreDto: SearchStoreDto) {
    // FIXME: class-validator側で処理したい内容
    const isMissingLocation =
      (searchStoreDto.landscape?.latitude == null &&
        searchStoreDto.landscape?.longitude != null) ||
      (searchStoreDto.landscape?.latitude != null &&
        searchStoreDto.landscape?.longitude == null);

    if (isMissingLocation) {
      this.commonService.createHttpException(
        ErrorCode.SEARCH_POST_LANDSCAPE_NEED_FULL_PARAM,
        ErrorMessage[ErrorCode.SEARCH_POST_LANDSCAPE_NEED_FULL_PARAM],
        HttpStatus.BAD_REQUEST,
      );
    }

    const stores = await this.searchService.search(searchStoreDto);
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: stores,
    };
  }
}
