import { SearchStoreDto } from './dto/searchStore.dto';
import {
  SearchStrategy,
  StoreIncludingDetail,
} from './interfaces/search.interface';
import { PubliclyAccessibleSearch } from './strategy/publiclyAccessibleSearch.strategy';
import { KeywordSearch } from './strategy/keywordSearch.strategy';
import { LocationSort } from './strategy/locationSort.strategy';
import { PrefectureCodeSearch } from './strategy/prefectureCodeSearch.strategy';
import { PrefectureCodeSort } from './strategy/prefectureCodeSort.strategy';

export class SearchConditionBuilder {
  private strategies: SearchStrategy[] = [];

  addCondition(searchStoreDto: SearchStoreDto): SearchConditionBuilder {
    this.strategies.push(
      new PubliclyAccessibleSearch(),
      new KeywordSearch(searchStoreDto.keywords),
      new PrefectureCodeSearch(searchStoreDto.prefectureCode),
    );
    return this;
  }

  addSortOrder(searchStoreDto: SearchStoreDto): SearchConditionBuilder {
    const hasLocation =
      searchStoreDto.landscape?.latitude != null &&
      searchStoreDto.landscape?.longitude != null;

    if (hasLocation) {
      this.strategies.push(new LocationSort(searchStoreDto.landscape));
    } else {
      this.strategies.push(new PrefectureCodeSort());
    }

    return this;
  }

  search(storeIncludingDetail: StoreIncludingDetail[]): StoreIncludingDetail[] {
    return this.strategies.reduce(
      (pre, curr) => curr.search(pre),
      storeIncludingDetail,
    );
  }
}
