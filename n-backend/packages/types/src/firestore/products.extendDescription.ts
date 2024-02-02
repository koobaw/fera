import { Auditable } from './common/auditable';

export const PRODUCTS_EXTEND_DESCRIPTION_COLLECTION_NAME = 'extendDescription';

export interface ProductExtendDescription extends Auditable {
  content: string;
}
