export interface MuleFavoriteProductReadResponseSuccess {
  id: string;
  name: string;
  accountId: string;
  myListId: string;
  jan: string;
  comment: string;
  displayOrder: number;
  ownerId: string;
  createdBy: string;
  lastModifiedBy: string;
}

export type MuleFavoriteProductReadResponseFailure =
  MuleFavoriteProductResponseFailure;

export interface MuleFavoriteProductCreateResponseSuccess {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  item:
    | MuleFavoriteProductCreateResponseItemSuccess
    | MuleFavoriteProductCreateResponseItemFailure;
}

export interface MuleFavoriteProductCreateResponseItemSuccess {
  id: string;
  successful: boolean;
}

export interface MuleFavoriteProductCreateResponseItemFailure {
  successful: boolean;
  statusCode: string;
  message: string;
}

export type MuleFavoriteProductCreateResponseFailure =
  MuleFavoriteProductResponseFailure;

export interface MuleFavoriteProductResponseFailure {
  status: string;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
