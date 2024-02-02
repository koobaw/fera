type CainzCardNumber = string;

type CardCancelStatus = 'C';
type CardInactiveStatus = 'I';
type CardActiveStatus = 'A';
type CardStolenOrLostStatus = 'S';
type CardExpiredStatus = 'E';
type CardDefaultCardStatus = 'D';

type CardStatus =
  | CardCancelStatus
  | CardInactiveStatus
  | CardActiveStatus
  | CardStolenOrLostStatus
  | CardExpiredStatus
  | CardDefaultCardStatus;

export interface MulePointSuccessResponse {
  id: CainzCardNumber;
  status: CardStatus;
  points: number;
  lost: ExpirePoint[];
  stepUp?: StepUp;
}

export interface StepUp {
  totalAmount: number;
  thisStage: Stage;
  nextStage: Stage;
  targetAmount: number;
  url: string;
  term: string;
}

export interface Stage {
  name: string;
  grantRate: number; // 浮動小数点数
}

export interface ExpirePoint {
  points: number;
  date: string;
}

export interface MulePointServerErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
