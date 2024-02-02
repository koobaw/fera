import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_PRODUCTVIEWS_COLLECTION_NAME = 'productViews';

export interface AnonymousUserProductView extends Auditable {
  productId: string;
}
