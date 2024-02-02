import { Auditable } from './common/auditable';

export const USERS_PRODUCTSEARCHQUERIES_COLLECTION_NAME =
  'productSearchQueries';

export interface UserProductSearchQuery extends Auditable {
  query: string;
}
