import { Injectable } from '@nestjs/common';
import { LoggingService } from '@fera-next-gen/logging';

import { FindRecommendQueryDto } from './dto/find.recommend-query.dto';
import { UnionService } from '../union/union.service';
import { RecommendGoogleApiService } from './recommend-google-api/recommend-google-api.service';
import { RetailResponse } from './interfaces/retail-api.interface';
import {
  ProductInfo,
  RecommendResponse,
} from './interfaces/recommend.interface';
import { ProductSelect } from '../union/dto/find.union-query.dto';

@Injectable()
export class RecommendsService {
  constructor(
    private readonly unionService: UnionService,
    private readonly logger: LoggingService,
    private readonly recommendGoogleApiService: RecommendGoogleApiService,
  ) {}

  /**
   * おすすめ商品などを取得する
   */
  public async getRecommend(dto: FindRecommendQueryDto, visitorId: string) {
    // retail recommend実行
    const retailResponses = await this.recommendGoogleApiService.getRecommend(
      dto,
      visitorId,
    );
    // 商品情報を取得
    const productInfos = await this.findProductInfos(retailResponses);
    // データの整形
    return this.transformResponse(retailResponses, productInfos);
  }

  /**
   * productIdを元に商品情報を取得する
   */
  private async findProductInfos(
    retailResponses: RetailResponse[],
  ): Promise<ProductInfo[]> {
    const uniqueIds = this.getUniqueIdsFromRetailResponses(retailResponses);
    return uniqueIds.length > 0 ? this.fetchProductInfo(uniqueIds) : [];
  }

  /**
   * 一回で商品情報を全て取りたいため、productIdの一覧を作成する
   */
  private getUniqueIdsFromRetailResponses(
    retailResponses: RetailResponse[],
  ): string[] {
    const idSet = new Set<string>();
    retailResponses.forEach(({ ids }) => ids.forEach((id) => idSet.add(id)));
    return Array.from(idSet);
  }

  /**
   * mule APIで商品情報を取得し必要な情報だけレスポンスする
   */
  private async fetchProductInfo(productIds: string[]): Promise<ProductInfo[]> {
    this.logger.debug('start fetchProductInfo');

    // TODO: 仕様が決まり次第修正
    const dummyStoreCode = '888';
    const dummyMembershipRank = '4';

    const detail = await this.unionService.fetchDetails({
      productIds,
    });
    const prices = await this.unionService.fetchPrices(
      { productIds },
      {
        select: [ProductSelect.PRICE],
        storeCodes: [dummyStoreCode],
        membershipRank: dummyMembershipRank,
      },
    );
    const transformData = this.unionService.transformData(detail, prices, [], {
      select: [ProductSelect.PRICE],
    });

    this.logger.debug('end fetchProductInfo');

    return transformData.map((product) => ({
      productId: product.productId,
      name: product.name,
      price: product.prices[0]?.priceIncludingTax ?? 0,
      thumbnailUrl: product.imageUrls[0],
    }));
  }

  /**
   * レコメンドAPIのレスポンスに合うように整形する
   */
  private transformResponse(
    retailResponses: RetailResponse[],
    productInfos: ProductInfo[],
  ): RecommendResponse {
    return retailResponses.reduce((acc, { recommendType, ids }) => {
      acc[recommendType] = ids
        .map((id) => productInfos.find((apiRes) => apiRes.productId === id))
        // fetchProductInfo()でデータが取れなかったものを除外
        .filter((productInfo) => productInfo != null);

      return acc;
    }, {});
  }
}
