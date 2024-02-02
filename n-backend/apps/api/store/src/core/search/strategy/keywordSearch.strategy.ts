import {
  SearchStrategy,
  StoreIncludingDetail,
} from '../interfaces/search.interface';

export class KeywordSearch implements SearchStrategy {
  private readonly keywords: string[];

  constructor(keywords: string[]) {
    this.keywords = keywords ?? [];
  }

  search(
    storeIncludingDetails: StoreIncludingDetail[],
  ): StoreIncludingDetail[] {
    if (this.keywords.length === 0) {
      return storeIncludingDetails;
    }
    const matchedStore = this.keywords.reduce(
      (filteredStore, keyword) =>
        filteredStore.filter(
          (store: StoreIncludingDetail) =>
            store.name.includes(keyword) || store.address.includes(keyword),
        ),
      storeIncludingDetails,
    );
    return matchedStore;
  }
}
