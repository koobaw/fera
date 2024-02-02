import { RecommendType } from '../dto/find.recommend-query.dto';

export interface AdditionalEventParams {
  searchQuery?: string;
  pageCategories?: string[];
  productDetails?: { product: { id: string } }[];
}

export interface RetailResponse {
  recommendType: RecommendType;
  ids: string[];
}
