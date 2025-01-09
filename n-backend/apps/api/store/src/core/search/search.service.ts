import { Injectable } from '@nestjs/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import {
  Store,
  StoreDetail,
  STORES_COLLECTION_NAME,
  STORES_DETAIL_COLLECTION_NAME,
} from '@fera-next-gen/types';
import { LoggingService } from '@fera-next-gen/logging';
import { CommonService } from '@fera-next-gen/common';

import { SearchStoreDto } from './dto/searchStore.dto';
import {
  SearchApiResponse,
  StoreIncludingDetail,
} from './interfaces/search.interface';
import { SearchConditionBuilder } from './searchcondition.builder';

@Injectable()
export class SearchService {
  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  async search(searchStoreDto: SearchStoreDto): Promise<SearchApiResponse[]> {
    const allStoreIncludingDetails = await this.fetchAllStoreIncludingDetails();

    const builder = new SearchConditionBuilder();

    const storeIncludingDetails = builder
      .addCondition(searchStoreDto)
      .addSortOrder(searchStoreDto)
      .search(allStoreIncludingDetails);

    const result: SearchApiResponse[] = storeIncludingDetails.map((it) => ({
      code: it.code,
      name: it.name,
      address: it.address,
      businessTime: it.businessTime,
      selectable: this.isSelectable(it),
    }));

    return result;
  }

  private async fetchAllStoreIncludingDetails(): Promise<
    StoreIncludingDetail[]
  > {
    const stores = await this.fetchAllStores();
    const storeDetails = await this.fetchAllStoreDetails(stores);
    return stores.map(
      (store, index): StoreIncludingDetail => ({
        ...store,
        detail: storeDetails[index],
      }),
    );
  }

  private async fetchAllStores(): Promise<Store[]> {
    this.logger.debug('start fetchAllStores');

    const storeDocuments = await this.firestoreBatchService
      .findCollection(STORES_COLLECTION_NAME)
      .get();

    const stores = storeDocuments.docs.map(
      (storeDocument) => storeDocument.data() as Store,
    );

    this.logger.debug('end fetchAllStores');

    return stores;
  }

  private async fetchAllStoreDetails(stores: Store[]): Promise<StoreDetail[]> {
    this.logger.debug('start fetchAllStoreDetails');

    const storeCollection = this.firestoreBatchService.findCollection(
      STORES_COLLECTION_NAME,
    );

    const storeDetailDocuments = await Promise.all(
      stores.map(async (store) =>
        storeCollection
          .doc(this.commonService.createMd5(store.code))
          .collection(STORES_DETAIL_COLLECTION_NAME)
          .doc(store.code)
          .get(),
      ),
    );

    const storeDetails: StoreDetail[] = storeDetailDocuments.map(
      (storeDetailDocument) => storeDetailDocument.data() as StoreDetail,
    );

    this.logger.debug('end fetchAllStoreDetails');

    return storeDetails;
  }

  private isSelectable(storeDetail: StoreIncludingDetail): boolean {
    const nowDate = new Date();
    const openDate = storeDetail.detail.openingDate.toDate();
    const closeDate = storeDetail.detail.closingDate.toDate();
    const renovationDateFrom =
      storeDetail.detail.renovationDateFrom?.toDate() ?? null;
    const renovationDateTo =
      storeDetail.detail.renovationDateTo?.toDate() ?? null;
    const temporarilyClosedFrom =
      storeDetail.detail.temporarilyClosedFrom?.toDate() ?? null;
    const temporarilyClosedTo =
      storeDetail.detail.temporarilyClosedTo?.toDate() ?? null;

    let isSelectable = false;

    // 開店中
    const isOpen = this.checkOnGoing(openDate, closeDate);

    // 改装中
    const isRenovate = this.checkOnGoing(renovationDateFrom, renovationDateTo);

    // 一時閉店中
    const isTemporarilyClose = this.checkOnGoing(
      temporarilyClosedFrom,
      temporarilyClosedTo,
    );

    if (isOpen && !isRenovate && !isTemporarilyClose) {
      // 開店中かつ改装中でも一時閉店中でもない場合
      isSelectable = true;
    }

    if (nowDate < openDate) {
      // プレオープンの場合
      isSelectable = true;
    }

    return isSelectable;
  }

  private checkOnGoing(fromDate: Date | null, toDate: Date | null) {
    const nowDate = new Date();
    // 両方nullであれば期間外
    if (fromDate === null && toDate === null) {
      return false;
    }
    // どちらかがnullのケース
    if (fromDate === null) {
      return nowDate <= toDate;
    }
    if (toDate === null) {
      return nowDate >= fromDate;
    }
    return nowDate >= fromDate && nowDate <= toDate;
  }
}
