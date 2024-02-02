import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PredictionServiceClient } from '@google-cloud/retail/build/src/v2';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { google } from '@google-cloud/retail/build/protos/protos';
import { CATEGORIES_COLLECTION_NAME } from '@cainz-next-gen/types';

import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';
import {
  EventType,
  FindRecommendQueryDto,
  RecommendType,
} from '../dto/find.recommend-query.dto';
import {
  AdditionalEventParams,
  RetailResponse,
} from '../interfaces/retail-api.interface';

@Injectable()
export class RecommendGoogleApiService {
  private readonly RecommendServiceIdMapping: Record<RecommendType, string>;

  constructor(
    private readonly env: ConfigService,
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {
    // .env からサービスIDを取得し、マッピングに割り当てる
    this.RecommendServiceIdMapping = {
      [RecommendType.RECENT_VIEW]: this.env.get<string>(
        'RECENT_VIEW_SERVICE_ID',
      ),
      [RecommendType.RECOMMEND]: this.env.get<string>('RECOMMEND_SERVICE_ID'),
    };
  }

  public async getRecommend(
    dto: FindRecommendQueryDto,
    visitorId: string,
  ): Promise<RetailResponse[]> {
    this.logger.debug('start getRecommend');

    const userEvent = await this.buildUserEvent(dto, visitorId);
    const projectId = this.env.get<string>('RETAIL_PROJECT_ID');
    const retailClient = new PredictionServiceClient();

    try {
      const responses = await Promise.all(
        dto.recommendType.map(async (type) => {
          const serviceId = this.RecommendServiceIdMapping[type];
          const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/${serviceId}`;
          const predict = await retailClient.predict({
            userEvent,
            placement,
          });

          return {
            recommendType: type,
            ids: predict[0].results.map((item) => item.id),
          };
        }),
      );

      this.logger.debug(`recommend api response: ${JSON.stringify(responses)}`);
      this.logger.debug('end getRecommend');

      return responses;
    } catch (e: unknown) {
      this.commonService.logException('failed getRecommend', e);
      throw new HttpException(
        {
          errorCode: ErrorCode.RECOMMEND_GET_GOOGLE_API,
          message: ErrorMessage[ErrorCode.RECOMMEND_GET_GOOGLE_API],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * google APIのリクエストで必要なuserEventオブジェクトを作成する
   */
  private async buildUserEvent(
    dto: FindRecommendQueryDto,
    visitorId: string,
  ): Promise<google.cloud.retail.v2.IUserEvent> {
    return {
      eventType: dto.eventType,
      visitorId,
      ...(await this.getAdditionalEventParams(dto)),
    };
  }

  /**
   * ページによって必要な絞り込みを追加する
   */
  private async getAdditionalEventParams(
    dto: FindRecommendQueryDto,
  ): Promise<AdditionalEventParams> {
    const params: AdditionalEventParams = {};
    if (dto.eventType === EventType.SEARCH) {
      params.searchQuery = dto.query;
    }
    if (dto.eventType === EventType.CATEGORY) {
      const category = await this.buildCategoryNamePath(dto.categoryCode);
      params.pageCategories = [category];
    }
    if (dto.eventType === EventType.DETAIL) {
      params.productDetails = [{ product: { id: dto.productId } }];
    }
    return params;
  }

  /**
   * firestoreからカテゴリを取得する
   */
  private async getCategory(code: string) {
    this.logger.debug('start accessing to firestore');

    const collection = this.firestoreBatchService.findCollection(
      CATEGORIES_COLLECTION_NAME,
    );
    const categoryDoc = await collection.doc(code).get();

    this.logger.debug('end accessing to firestore');

    if (!categoryDoc.data()) {
      this.logger.debug('category not found');

      throw new HttpException(
        {
          errorCode: ErrorCode.RECOMMEND_CATEGORY_NOT_FOUND,
          message: ErrorMessage[ErrorCode.RECOMMEND_CATEGORY_NOT_FOUND],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return categoryDoc.data();
  }

  /**
   * 再起的にgetCategory()を呼び出し、カテゴリ名の連結を作る
   */
  private async buildCategoryNamePath(code: string): Promise<string> {
    const category = await this.getCategory(code);

    const { parentCategoryCode } = category;
    if (!parentCategoryCode || parentCategoryCode === 'root') {
      return category.name;
    }

    const parentPath = await this.buildCategoryNamePath(parentCategoryCode);
    return parentPath ? `${parentPath} > ${category.name}` : category.name;
  }
}
