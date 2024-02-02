import dayjs from 'dayjs';
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchServiceClient } from '@google-cloud/retail/build/src/v2';
import { google } from '@google-cloud/retail/build/protos/protos';

import { CATEGORIES_COLLECTION_NAME } from '@cainz-next-gen/types';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import { FindSearchesDto, SearchSortOrder } from '../dto/find.search-query.dto';
import { PRICE_LIST } from '../const/price-list';
import {
  FACET_KEY,
  FACET_LIMIT,
  ORIGINAL_FLAG_VALUES,
} from '../interfaces/search.interface';

@Injectable()
export class SearchGoogleApiService {
  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  public async retailSearch(
    dto: FindSearchesDto,
    visitorId: string,
  ): Promise<
    [
      google.cloud.retail.v2.SearchResponse.ISearchResult[],
      google.cloud.retail.v2.ISearchRequest,
      google.cloud.retail.v2.ISearchResponse,
    ]
  > {
    this.logger.debug('start retailSearch');

    const client = new SearchServiceClient();
    const request = await this.createApiRequest(dto, visitorId);

    try {
      const data = await client.search(request, {
        autoPaginate: false,
      });

      this.logger.debug(`Google api response: ${JSON.stringify(data)}`);
      this.logger.debug('end retailSearch');

      return data;
    } catch (e: unknown) {
      this.commonService.logException('failed retailSearch', e);
      throw new HttpException(
        {
          errorCode: ErrorCode.SEARCH_GET_GOOGLE_API,
          message: ErrorMessage[ErrorCode.SEARCH_GET_GOOGLE_API],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 共通の絞り込みクエリの作成
   */
  private createCommonFilter(): string {
    const currentDate = this.commonService.getDateTimeStringJST();
    const formattedDateTime = dayjs(currentDate).format('YYYYMMDDHHmm');
    return `attributes.searchable=1 AND availability: ANY("IN_STOCK") AND attributes.online_flg_ec: ANY("1") AND (attributes.onlineFrom < ${formattedDateTime} OR NOT attributes.onlineFrom > 0 ) AND (attributes.onlineTo > ${formattedDateTime} OR NOT attributes.onlineTo > 0)`;
  }

  /**
   * 絞り込みクエリの作成
   */
  private async createFilter(dto: FindSearchesDto): Promise<string> {
    const and = ' AND';
    let filter = this.createCommonFilter();

    if (dto.minPrice) {
      filter += `${and} price >= ${dto.minPrice}`;
    }
    if (dto.maxPrice) {
      filter += `${and} price <= ${dto.maxPrice}`;
    }
    if (dto.size) {
      const sizeFilter = dto.size.map((size) => `"${size}"`).join(',');
      filter += `${and} (sizes: ANY(${sizeFilter}))`;
    }
    if (dto.color) {
      const colorFilter = dto.color.map((color) => `"${color}"`).join(',');
      filter += `${and} (colors: ANY(${colorFilter}))`;
    }
    if (dto.originalFlag) {
      const originalFilter = ORIGINAL_FLAG_VALUES.map(
        (value) => `"${value}"`,
      ).join(',');
      filter += `${and} (attributes.pb_kbn: ANY(${originalFilter}))`;
    }
    if (dto.categoryCode) {
      const categoryLevel = await this.getCategoryLevelForFirestore(
        dto.categoryCode,
      );

      filter += `${and} (attributes.category_id_${categoryLevel}: ANY("${dto.categoryCode}"))`;
    }

    return filter;
  }

  /**
   * retail searchで必要なリクエストを作成
   */
  private async createApiRequest(
    dto: FindSearchesDto,
    visitorId: string,
  ): Promise<google.cloud.retail.v2.ISearchRequest> {
    const projectId = this.env.get<string>('RETAIL_PROJECT_ID');
    const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/placements/product_search`;

    const filter = await this.createFilter(dto);

    return {
      placement,
      query: dto.query ?? null,
      filter,
      visitorId,
      pageSize: dto.limit,
      offset: dto.offset,
      orderBy: SearchSortOrder[dto.sortOrder].sortKey,
      facetSpecs: [
        {
          facetKey: { key: FACET_KEY.SIZE },
          excludedFilterKeys: [FACET_KEY.SIZE],
          limit: FACET_LIMIT,
        },
        {
          facetKey: { key: FACET_KEY.COLOR },
          excludedFilterKeys: [FACET_KEY.COLOR],
          limit: FACET_LIMIT,
        },
        {
          facetKey: { key: FACET_KEY.CATEGORY },
          excludedFilterKeys: [FACET_KEY.CATEGORY],
          limit: FACET_LIMIT,
        },
        {
          facetKey: { key: FACET_KEY.ORIGINAL },
          excludedFilterKeys: [FACET_KEY.ORIGINAL],
        },
        {
          facetKey: {
            key: FACET_KEY.PRICE,
            intervals: PRICE_LIST.map((price) => ({
              minimum: price.valueFrom,
              maximum: price.valueTo,
            })),
          },
          excludedFilterKeys: [FACET_KEY.PRICE],
        },
      ],
    };
  }

  /**
   * firestoreからカテゴリレベルを取得
   */
  private async getCategoryLevelForFirestore(
    categoryCode: string,
  ): Promise<number> {
    this.logger.debug('start accessing to firestore');

    const collection = this.firestoreBatchService.findCollection(
      CATEGORIES_COLLECTION_NAME,
    );
    const doc = await collection.doc(categoryCode).get();
    this.logger.debug('end accessing to firestore');

    if (!doc.data()) {
      this.logger.debug('category not found');

      throw new HttpException(
        {
          errorCode: ErrorCode.SEARCH_CATEGORY_NOT_FOUND,
          message: ErrorMessage[ErrorCode.SEARCH_CATEGORY_NOT_FOUND],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return doc.data().level;
  }
}
