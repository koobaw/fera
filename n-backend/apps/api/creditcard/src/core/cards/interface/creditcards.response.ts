import { HttpStatus } from '@nestjs/common';
import { Claims } from 'packages/types/src/claims';

export interface RegisterCardRequest {
  claims: Claims;
  token: string;
}

export interface RegisterCard {
  memberId: string;
  token: string;
}

export interface CreditCardResponse {
  code: HttpStatus;
  message: string;
}

export interface DeleteCardRequest {
  userClaims: Claims;
  cardSequentialNumber: string;
}
export interface DeleteCard {
  memberId: string;
  cardSequentialNumber: string;
}
export interface CreditCardsRes {
  data: CardEn;
  code: number;
  message: string;
}

export interface CardEn {
  cards: Array<CardResult>;
}

export interface Card {
  cardSequentialNumber: string;
  isSelected: boolean;
  cardNumber: string;
  expirationDate: string;
  isDeleted: boolean;
}
export interface MuleErrorResponse {
  status?: number;
  cid?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}
interface ErrorObject {
  code: string;
  message: string;
}

export interface CardResult {
  cardSequentialNumber: string;
  isPrimary: boolean;
  maskedCardNumber: string;
  expirationDate: string;
  isDeleted: boolean;
}
