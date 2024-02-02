import {
  SearchStrategy,
  StoreIncludingDetail,
} from '../interfaces/search.interface';

export class PrefectureCodeSort implements SearchStrategy {
  search(
    storeIncludingDetails: StoreIncludingDetail[],
  ): StoreIncludingDetail[] {
    const sortByPrefectureCode = storeIncludingDetails.sort((a, b) => {
      const aPrefectureCode = a.detail.prefectureCode;
      const bPrefectureCode = b.detail.prefectureCode;

      const diff = Number(aPrefectureCode) - Number(bPrefectureCode);

      if (Number.isNaN(diff)) {
        const doNotSort = 0;
        return doNotSort;
      }

      return diff;
    });
    return sortByPrefectureCode;
  }
}
