export type CheckoutCompleteInterface =
  | OtherPaymentInterface
  | AmazonInterface
  | CompleteInfo
  | Error;
export interface AmazonInterface {
  receptionId: string;
  orderId: string;
  accessId: string;
  token: string;
  paymentStartUrl: string;
  paymentStartBy: string;
}
export type CompleteInfoInterface = CompleteInfo | Error;
export interface CompleteInfo {
  orderCompleteInfo: Array<OtherPaymentInterface>;
}
export type OtherPaymentDataInterface = Array<OtherPaymentInterface>;

export interface OtherPaymentInterface {
  orderId: string;
  receptionId: string;
  shortOrderId: string;
  receivingMethod: string;
  paymentMethodId: string;
  convenienceCode?: string;
  purchaseAmount?: number;
  payBy?: string;
  confirmationNumber?: string;
  receiptNumber?: string;
  slipUrl?: string;
  clientField1?: string;
  clientField2?: string;
  clientField3?: string;
  customerEmail?: string;
  isMember: boolean;
}

export interface Error {
  error: string;
  data: any;
}
