export interface ChildCategoryResponse {
  code: string;
  name: string;
  displayOrder: number;
  childCategories?: ChildCategoryResponse[];
}

export interface CategoryResponse {
  code: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  displayOrder: number;
  childCategories: ChildCategoryResponse[];
}
