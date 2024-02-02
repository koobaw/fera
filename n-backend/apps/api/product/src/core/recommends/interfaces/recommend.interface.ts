import { RecommendType } from '../dto/find.recommend-query.dto';

export interface ProductInfo {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl: string;
}

export type RecommendResponse = {
  [K in RecommendType]?: ProductInfo[];
};
