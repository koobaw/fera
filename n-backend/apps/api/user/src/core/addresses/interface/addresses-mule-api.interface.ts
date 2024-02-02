export interface MuleAddressesCreateSuccessResponse {
  status: number;
  cid: string;
  timestamp: string;
  successful: boolean;
  item: MuleAddressesCreateResponseItem;
}

type MuleAddressesCreateResponseItem =
  | MuleAddressesCreateSuccessResponseItem
  | MuleAddressesCreateErrorResponseItem;

interface MuleAddressesCreateSuccessResponseItem {
  id: string;
  successful: boolean;
}

interface MuleAddressesCreateErrorResponseItem {
  successful: boolean;
  statusCode: string;
  message: string;
}

export interface MuleAddressesServerErrorResponse {
  status: string;
  cid: string;
  timestamp: string;
  description: string;
  detailedDescription: string;
}
