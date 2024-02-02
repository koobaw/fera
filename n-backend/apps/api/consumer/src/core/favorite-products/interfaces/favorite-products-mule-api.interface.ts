export type MuleFavoriteProductDeleteResponse =
  | MuleFavoriteProductDeleteSuccessResponse
  | MuleFavoriteProductDeleteErrorResponse;

export type MuleFavoriteProductRegisterResponse =
  | MuleFavoriteProductRegisterSuccessResponse
  | MuleFavoriteProductRegisterErrorResponse;

export interface MuleFavoriteProductDeleteSuccessResponse {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  items: [
    {
      successful: boolean;
      id: string;
    },
  ];
}

export interface MuleFavoriteProductDeleteErrorResponse {
  successful: boolean;
  id: string;
  statusCode: number;
  message: string;
}

export interface MuleFavoriteProductDeleteServerErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}

export interface MuleFavoriteProductRegisterSuccessResponse {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  item: {
    successful: boolean;
    id: string;
  };
}

export interface MuleFavoriteProductRegisterErrorResponse {
  successful: boolean;
  statusCode: number;
  message: string;
}

export interface MuleFavoriteProductRegisterServerErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
