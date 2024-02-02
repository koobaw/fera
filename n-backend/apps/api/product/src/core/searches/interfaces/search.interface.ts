export interface SearchProductCategory {
  name: string;
  code: string;
  level: number;
}

export interface SearchProduct {
  productId: string;
  name: string;
  price: number;
  productUrl: string;
  imageUrl?: string;
  categories: SearchProductCategory[];
}

export interface SearchOptionSize {
  name: string;
  code: string;
}

export interface SearchOptionPrice {
  minPrice: number;
  maxPrice: number;
}

export interface SearchOptionColor {
  name: string;
  code: string;
  imageUrl: string;
}

export interface SearchOptionCategory {
  name: string;
  code: string;
}

export interface SearchOption {
  sizes?: SearchOptionSize[];
  prices?: SearchOptionPrice[];
  colors?: SearchOptionColor[];
  categories?: SearchOptionCategory[];
  displayOriginalFlag: boolean;
}

export interface SearchResponse {
  products: SearchProduct[];
  searchOption: SearchOption;
  totalCount: number;
}

export const FACET_KEY = {
  SIZE: 'sizes',
  COLOR: 'colors',
  CATEGORY: 'attributes.category_name_no',
  ORIGINAL: 'attributes.pb_kbn',
  PRICE: 'price',
};

export const FACET_LIMIT = 300;

export const ORIGINAL_FLAG_VALUES: string[] = ['2', '4'];
