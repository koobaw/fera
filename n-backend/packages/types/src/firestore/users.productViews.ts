import { Auditable } from './common/auditable';

export const USERS_PRODUCTVIEWS_COLLECTION_NAME = 'productViews';

export interface UserProductView extends Auditable {
  productId: string;
}
