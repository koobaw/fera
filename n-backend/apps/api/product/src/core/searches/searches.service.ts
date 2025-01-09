import { Injectable } from '@nestjs/common';
import { OmitTimestampProductPrice } from '@fera-next-gen/types';
import { google } from '@google-cloud/retail/build/protos/protos';
import { FindSearchesDto } from './dto/find.search-query.dto';
import {
  FACET_KEY,
  ORIGINAL_FLAG_VALUES,
  SearchOption,
  SearchOptionColor,
  SearchOptionPrice,
  SearchOptionSize,
  SearchProduct,
  SearchProductCategory,
  SearchResponse,
} from './interfaces/search.interface';
import { COLOR_LIST, colorUrl } from './const/color-list';
import { SIZE_LIST } from './const/size-list';
import { SearchGoogleApiService } from './search-google-api/search-google-api.service';
import { UnionService } from '../union/union.service';
import { ProductSelect } from '../union/dto/find.union-query.dto';

@Injectable()
export class SearchesService {
  constructor(
    private readonly retailService: SearchGoogleApiService,
    private readonly unionService: UnionService,
  ) {}

  public async search(
    dto: FindSearchesDto,
    visitorId: string,
  ): Promise<SearchResponse> {
    const catalogs = await this.retailService.retailSearch(dto, visitorId);

    const priceMap = await this.getPrices(catalogs[2].results);
    const products = this.transformToProducts(catalogs[2].results, priceMap);
    const searchOption = this.transformFacetsToSearchOption(catalogs[2].facets);
    const totalCount = catalogs[2].totalSize;

    return {
      products,
      searchOption,
      totalCount,
    };
  }

  /**
   * 会員ランクなどを考慮した価格を取得する
   */
  private async getPrices(
    catalogs: google.cloud.retail.v2.SearchResponse.ISearchResult[],
  ): Promise<Partial<OmitTimestampProductPrice>> {
    // TODO: 取得方法が決まり次第修正
    const dummyStoreCode = '888';
    const dummyMembershipRank = '4';

    const productIds = catalogs.map(({ id }) => id);

    if (productIds.length === 0) {
      return {};
    }

    const prices = await this.unionService.fetchPrices(
      { productIds },
      {
        select: [ProductSelect.PRICE],
        storeCodes: [dummyStoreCode],
        membershipRank: dummyMembershipRank,
      },
    );

    // 商品IDに基づいて価格をマッピング
    return prices.reduce((acc, item) => {
      acc[item.productId] = item.priceIncludingTax;
      return acc;
    }, {});
  }

  private transformToProducts(
    catalogs: google.cloud.retail.v2.SearchResponse.ISearchResult[],
    priceMap: Partial<OmitTimestampProductPrice>,
  ): SearchProduct[] {
    return catalogs.map((catalog) => ({
      productId: catalog.id,
      name: catalog.product.title,
      price: priceMap[catalog.id],
      productUrl: catalog.product.uri,
      imageUrl: catalog.product.images?.[0]?.uri ?? null,
      categories: this.transformToSearchProductCategories(catalog),
    }));
  }

  private transformFacetsToSearchOption(
    facets: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): SearchOption {
    return {
      sizes: this.transformToSearchOptionSizes(facets),
      prices: this.transformToSearchOptionPrices(facets),
      colors: this.transformToSearchOptionColors(facets),
      categories: this.transformToSearchOptionCategories(facets),
      displayOriginalFlag: this.transformToSearchOptionOriginalFlag(facets),
    };
  }

  private transformToSearchProductCategories(
    productData: google.cloud.retail.v2.SearchResponse.ISearchResult,
  ): SearchProductCategory[] {
    const categoryNames = productData.product.categories;
    const firstCategoryName = categoryNames.length > 0 ? categoryNames[0] : '';
    const splitCategoryNames = firstCategoryName.split(' > ');
    const categoryAttributes = productData.product.attributes;

    return splitCategoryNames.map((categoryName, index) => {
      const categoryCode =
        categoryAttributes[`category_id_${index + 1}`]?.text[0] ?? '';

      return {
        name: categoryName,
        code: categoryCode,
        level: index + 1,
      };
    });
  }

  private transformToSearchOptionSizes(
    facetsData: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): SearchOptionSize[] {
    const sizeFacet = facetsData.find((facet) => facet.key === FACET_KEY.SIZE);

    if (!sizeFacet || !sizeFacet.values) {
      return [];
    }

    return sizeFacet.values
      .filter((size) => parseInt(size.count as string, 10) > 0)
      .map((size) => ({
        code: size.value,
        name: SIZE_LIST[size.value],
      }));
  }

  private transformToSearchOptionPrices(
    facetsData: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): SearchOptionPrice[] {
    const priceFacet = facetsData.find(
      (facet) => facet.key === FACET_KEY.PRICE,
    );

    if (!priceFacet || !priceFacet.values) {
      return [];
    }

    return priceFacet.values
      .filter((price) => parseInt(price.count as string, 10) > 0)
      .map((price) => ({
        minPrice: price.interval.minimum,
        maxPrice: price.interval.maximum,
      }));
  }

  private transformToSearchOptionColors(
    facetsData: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): SearchOptionColor[] {
    const colorFacet = facetsData.find(
      (facet) => facet.key === FACET_KEY.COLOR,
    );

    if (!colorFacet || !colorFacet.values) {
      return [];
    }

    return colorFacet.values
      .filter((color) => parseInt(color.count as string, 10) > 0)
      .map((color) => ({
        code: color.value,
        name: COLOR_LIST[color.value],
        imageUrl: colorUrl + color.value,
      }));
  }

  private transformToSearchOptionCategories(
    facetsData: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): SearchProductCategory[] {
    const categoryFacet = facetsData.find(
      (facet) => facet.key === FACET_KEY.CATEGORY,
    );

    if (!categoryFacet || !categoryFacet.values) {
      return [];
    }

    return categoryFacet.values
      .filter((category) => parseInt(category.count as string, 10) > 0)
      .reduce((acc, category) => {
        const paths = category.value.split(' > ');
        const firstPath = paths[0];
        const splitIndex = firstPath.indexOf('_'); // 最初の '_' の位置を見つける
        const name = firstPath.substring(0, splitIndex); // '_' までが名前
        const code = firstPath.substring(splitIndex + 1); // '_' の後ろがコード

        // 重複を避けるために、既に追加されたカテゴリはスキップ
        if (!acc.some((alreadyCategory) => alreadyCategory.code === code)) {
          acc.push({ name, code });
        }

        return acc;
      }, []);
  }

  private transformToSearchOptionOriginalFlag(
    facetsData: google.cloud.retail.v2.SearchResponse.IFacet[],
  ): boolean {
    const originalFacet = facetsData.find(
      (facet) => facet.key === FACET_KEY.ORIGINAL,
    );

    if (!originalFacet || !originalFacet.values) {
      return false;
    }

    // valueがORIGINAL_FLAG_VALUES配列内にある数字のものは足し算。０以上の場合はtrueで返す
    const totalOriginalFlagCount = originalFacet.values.reduce(
      (acc, item) =>
        ORIGINAL_FLAG_VALUES.includes(item.value)
          ? acc + parseInt(item.count as string, 10)
          : acc,
      0,
    );
    return totalOriginalFlagCount > 0;
  }
}
