import { Auditable } from './common/auditable';

export const ANONYMOUSUSERS_PRODUCTSEARCHQUERIES_COLLECTION_NAME =
  'productSearchQueries';

export interface AnonymousUserProductSearchQuery extends Auditable {
  query: string;
}
