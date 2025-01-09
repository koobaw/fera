import { OmitTimestampProductPrice } from '@fera-next-gen/types';
import { Injectable } from '@nestjs/common';

import { DetailService } from '../detail/detail.service';
import { InventoriesService } from '../inventories/inventories.service';
import { PricesService } from '../prices/prices.service';
import { FindUnionQueryDto, ProductSelect } from './dto/find.union-query.dto';
import { InventoryResponse } from '../inventories/interfaces/inventory.interface';
import { UnionProductInterface } from './interfaces/union.interface';
import { ProductDetails } from '../detail/interfaces/detail.interface';
import { FindUnionParamDto } from './dto/find.union-param.dto';

@Injectable()
export class UnionService {
  constructor(
    private readonly detailService: DetailService,
    private readonly pricesService: PricesService,
    private readonly inventoriesService: InventoriesService,
  ) {}

  public async fetchDetails({
    productIds,
  }: FindUnionParamDto): Promise<ProductDetails[]> {
    return this.detailService.getDetail({ productIds });
  }

  public async fetchPrices(
    { productIds }: FindUnionParamDto,
    { storeCodes, membershipRank, select }: FindUnionQueryDto,
  ): Promise<Partial<OmitTimestampProductPrice>[]> {
    const param = {
      productIds,
      storeCodes,
      membershipRank,
    };

    return select.includes(ProductSelect.PRICE)
      ? this.pricesService.fetchPrices(param)
      : [];
  }

  public async fetchInventories(
    { productIds }: FindUnionParamDto,
    { storeCodes, select, coefficient }: FindUnionQueryDto,
  ): Promise<InventoryResponse[]> {
    const param = {
      productIds,
      storeCodes,
    };

    return select.includes(ProductSelect.INVENTORY)
      ? this.inventoriesService.fetchInventories(param, coefficient)
      : [];
  }

  public transformData(
    details: ProductDetails[],
    prices: Partial<OmitTimestampProductPrice>[],
    inventories: InventoryResponse[],
    { select }: FindUnionQueryDto,
  ): UnionProductInterface[] {
    // Transform details
    let transformedData = details.map((product) => {
      const base = { ...product.header };
      if (select.includes(ProductSelect.DETAIL)) {
        return {
          ...base,
          ...product.detail,
          specCategories: product.specCategories,
        };
      }
      return base;
    });

    // Transform prices
    const pricesMap = this.groupDataByProductId(prices);
    transformedData = transformedData.map((product) => ({
      ...product,
      prices: pricesMap[product.productId] || [],
    }));

    // Transform inventories
    const inventoriesMap = this.groupDataByProductId(inventories);
    transformedData = transformedData.map((product) => ({
      ...product,
      inventories: inventoriesMap[product.productId] || [],
    }));

    return transformedData;
  }

  public async saveToFireStore(
    { select }: FindUnionQueryDto,
    operatorName: string,
    detail: ProductDetails[],
    prices: Partial<OmitTimestampProductPrice>[],
    inventories: InventoryResponse[],
  ) {
    const isDetail = select.includes(ProductSelect.DETAIL);
    await this.detailService.saveToFirestore(detail, operatorName, isDetail);
    if (select.includes(ProductSelect.PRICE)) {
      await this.pricesService.saveToFirestore(prices, operatorName);
    }
    if (select.includes(ProductSelect.INVENTORY)) {
      await this.inventoriesService.saveToFirestore(inventories, operatorName);
    }
  }

  // productIdをキーとしてグループ化
  private groupDataByProductId(fetchedData) {
    return fetchedData.reduce((acc, item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = [];
      }
      acc[item.productId].push(item);
      return acc;
    }, {});
  }
}
