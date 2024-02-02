import { Auditable } from './common/auditable';

export const PRODUCTS_SPECCATEGORIES_COLLECTION_NAME = 'specCategories';

export interface ProductSpecCategory extends Auditable {
  specCategories: SpecCategory[];
}

export interface SpecCategory {
  name: string;
  value: string;
  sortOrder: string;
}
