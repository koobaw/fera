export interface MuleAddressUpdateSuccessResponse {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  item: Item;
}

interface Item {
  successful: boolean;
  id: string;
  statusCode?: number;
  message?: string;
}

export interface MuleAddressUpdateErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}

export interface MuleAddressUpdateServerErrorResponse {
  status: number;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
