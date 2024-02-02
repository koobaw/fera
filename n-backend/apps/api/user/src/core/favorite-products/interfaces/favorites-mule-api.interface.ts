export interface MuleFavoritesReadSuccessResponse {
  id: string;
  name: string;
  accountId: string;
  comment: string;
  title: string;
  isPublish: boolean;
  isDefault: boolean;
  ownerId: string;
  createdBy: string;
  lastModifiedBy: string;
}

export type MuleFavoritesReadErrorResponse = MuleFavoritesServerErrorResponse;

export interface MuleFavoritesCreateSuccessResponse {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  item: MuleFavoritesCreateResponseItem;
}

export type MuleFavoritesCreateResponseItem =
  | MuleFavoritesCreateSuccessResponseItem
  | MuleFavoritesCreateErrorResponseItem;

export interface MuleFavoritesCreateSuccessResponseItem {
  id: string;
  successful: boolean;
}

export interface MuleFavoritesCreateErrorResponseItem {
  successful: boolean;
  statusCode: string;
  message: string;
}

export type MuleFavoritesCreateErrorResponse = MuleFavoritesServerErrorResponse;

export interface MuleFavoritesServerErrorResponse {
  status: string;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
