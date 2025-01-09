import { Store, StoreDetail } from '@fera-next-gen/types/src/firestore';

export interface SearchApiResponse {
  code: string;
  name: string;
  address: string;
  businessTime: string;
}

export interface StoreIncludingDetail extends Store {
  detail: StoreDetail;
}

export interface SearchStrategy {
  search(storeIncludingDetails: StoreIncludingDetail[]): StoreIncludingDetail[];
}
