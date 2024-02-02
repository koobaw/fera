import { Auditable } from './common/auditable';

export const CATEGORIES_COLLECTION_NAME = 'categories';

export interface Category extends Auditable {
  code: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  level: number;
  parentCategoryCode: string | null;
  childCategories: ChildCategory[] | null;
}

interface ChildCategory {
  code: string;
  name: string;
  displayOrder: number;
}

export type OmitTimestampCategory = Omit<
  Category,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
