export enum ErrorCode {
  INVALID_WEB_USER = 'AUTH_1000',
  INVALID_MOBILE_USER = 'AUTH_1001',
  INVALID_USER = 'AUTH_1002',
}
export const ErrorMessage = {
  [ErrorCode.INVALID_WEB_USER]: 'invalid web user',
  [ErrorCode.INVALID_MOBILE_USER]: 'invalid mobile user',
  [ErrorCode.INVALID_USER]: 'invalid user',
} as const;
