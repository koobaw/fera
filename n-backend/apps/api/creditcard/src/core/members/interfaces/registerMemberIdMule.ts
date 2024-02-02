export interface RegisterMemberIdMuleResponse {
  cid: string;
  timestamp?: string;
  status?: number;
}

export interface RegisterMemberIdMuleError {
  status?: number;
  cid?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}

export interface RegisterMemberIdResponse {
  code: number;
  message: string;
  data: {
    muleRequestId: string;
  };
}

interface ErrorObject {
  code: string;
  message: string;
}
