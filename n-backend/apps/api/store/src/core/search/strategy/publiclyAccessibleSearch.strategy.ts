import {
  SearchStrategy,
  StoreIncludingDetail,
} from '../interfaces/search.interface';

export class PubliclyAccessibleSearch implements SearchStrategy {
  search(
    storeIncludingDetails: StoreIncludingDetail[],
  ): StoreIncludingDetail[] {
    // 公開開始日が未来および公開終了日が過去日付のものを除く
    return storeIncludingDetails.filter((store) => {
      const nowDate = new Date();
      const publiclyAccessibleFrom =
        store.detail.publiclyAccessibleFrom.toDate();
      const publiclyAccessibleTo = store.detail.publiclyAccessibleTo.toDate();
      return (
        nowDate >= publiclyAccessibleFrom && nowDate <= publiclyAccessibleTo
      );
    });
  }
}
