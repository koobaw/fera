// Shared error codes
export enum GlobalErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_1000',
  CRYPTO_INFO_UNDEFINED = 'INTERNAL_1001',
  API_CONNECTION_ERROR = 'INTERNAL_1002',
  BAD_PARAMETER = 'INTERNAL_1003',
}
export const ErrorMessage = {
  [GlobalErrorCode.INTERNAL_SERVER_ERROR]: 'internal server error',
  [GlobalErrorCode.CRYPTO_INFO_UNDEFINED]: 'internal server error',
  [GlobalErrorCode.API_CONNECTION_ERROR]: 'failed to connection another server',
  [GlobalErrorCode.BAD_PARAMETER]: 'bad parameters',
} as const;

export type CainzAppError = {
  errorCode: string;
  message?: string;
};
