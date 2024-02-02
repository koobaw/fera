export interface MuleCategoryResponse {
  categoryCode: string;
  categoryName: string;
  parentCategoryCode?: string;
  level?: number;
  publishStatus?: string;
  categoryLevel1?: HierarchicalCategory;
  categoryLevel2?: HierarchicalCategory;
  categoryLevel3?: HierarchicalCategory;
  categoryLevel4?: HierarchicalCategory;
  categoryLevel5?: HierarchicalCategory;
  pageTitle?: string;
  imageUrl?: ImageUrl;
  description?: string;
  descriptionForInternal?: string;
  displayOrder?: number;
  children?: CategoryChildren[];
}

interface HierarchicalCategory {
  code: string;
  name: string;
}

interface ImageUrl {
  regular: string;
  square: string;
  portrait: string;
}

type CategoryChildren = Omit<MuleCategoryResponse, 'children'>;
