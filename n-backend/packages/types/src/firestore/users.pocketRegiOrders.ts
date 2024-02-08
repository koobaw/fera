import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const POCKET_REGI_ORDERS_COLLECTION_NAME = 'pocketRegiOrders';

export interface PocketRegiOrder extends Auditable {
  creditCardExpireDate: string;
  creditCardMaskNum: string;
  creditCardType: null;
  isReturned: boolean;
  memberId: string;
  memberMail: string;
  memberName: string;
  memberPhone: string;
  orderId: string;
  orderIdForCustomer: string;
  paymentCode1: number;
  paymentCode2: null;
  paymentErrorCode: string;
  paymentMethod: string;
  products: { [key: string]: any };
  returnedDate: Timestamp;
  storeCode: string;
  storeName: string;
  subtotalConsumptionTaxByReducedRate: number;
  subtotalConsumptionTaxByStandardRate: number;
  subtotalPriceByReducedTaxRate: number;
  subtotalPriceByStandardTaxRate: number;
  subtotalPriceByTaxExempt: number;
  totalAmount: number;
  totalGrantedPoints: number;
  totalPointUse: number;
  totalPointUsed: number;
  totalQuantity: number;
}
