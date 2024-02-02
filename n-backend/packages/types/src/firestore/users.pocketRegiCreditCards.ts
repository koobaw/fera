import { Auditable } from './common/auditable';

export const POCKET_REGI_CREDIT_CARDS_COLLECTION_NAME = 'pocketRegiCreditCards';

export interface PocketRegiCreditCard extends Auditable {
  brand: string;
  maskedCardNumber: string;
  expirationDate: string;
  isPrimary: boolean;
}
export type AddCreditCard = Pick<
  PocketRegiCreditCard,
  'brand' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
export type UpdateCreditCard = Pick<
  PocketRegiCreditCard,
  | 'maskedCardNumber'
  | 'expirationDate'
  | 'isPrimary'
  | 'updatedAt'
  | 'updatedBy'
>;
