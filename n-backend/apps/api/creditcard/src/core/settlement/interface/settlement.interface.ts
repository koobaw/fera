export interface SettlementResponse {
  data?: DataDetails;
  message?: string;
  code?: number;
}

export interface SettlementMuleResponse {
  cid: string;
  timestamp?: string;
  status?: number;
  shortOrderId?: string;
}

export interface DataDetails {
  status?: number;
  muleRequestId?: string;
  shortOrderId?: string;
}

export interface SettlementMuleError {
  status?: number;
  cid?: string;
  shortOrderId?: string;
  timestamp?: string;
  description?: string;
  errors?: ErrorObject[];
}

interface ErrorObject {
  code: string;
  message: string;
}
