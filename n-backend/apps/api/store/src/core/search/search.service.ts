import { Injectable } from '@nestjs/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import {
  Store,
  StoreDetail,
  STORES_COLLECTION_NAME,
  STORES_DETAIL_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
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
}
