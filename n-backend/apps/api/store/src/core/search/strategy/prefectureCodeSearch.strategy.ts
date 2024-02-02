import {
  SearchStrategy,
  StoreIncludingDetail,
} from '../interfaces/search.interface';

export class PrefectureCodeSearch implements SearchStrategy {
  private readonly prefectureCode: string;

  constructor(prefectureCode: string) {
    this.prefectureCode = prefectureCode ?? '';
  }

  search(
    storeIncludingDetails: StoreIncludingDetail[],
  ): StoreIncludingDetail[] {
    if (this.prefectureCode === '') {
      return storeIncludingDetails;
    }
    return storeIncludingDetails.filter(
      (store) => store.detail.prefectureCode === this.prefectureCode,
    );
  }
}
