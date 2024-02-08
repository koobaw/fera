export enum ErrorCode {
  INVALID_WEB_USER = 'AUTH_1000',
  INVALID_MEMBER_USER = 'AUTH_1001',
  INVALID_USER = 'AUTH_1002',
  NOT_COMPLETED_MEMBER_LOGIN = 'AUTH_1003',
  UNAUTHORIZED_ACCESS = 'RETURN_STATUS_21006',
  INVALID_HEADER = 'RETURN_STATUS_21007',
}
export const ErrorMessage = {
  [ErrorCode.INVALID_WEB_USER]: 'invalid web user',
  [ErrorCode.INVALID_MEMBER_USER]: 'invalid mobile user',
  [ErrorCode.INVALID_USER]: 'invalid user',
  [ErrorCode.NOT_COMPLETED_MEMBER_LOGIN]: 'member login has not been completed',
  [ErrorCode.UNAUTHORIZED_ACCESS]: 'unauthorized Access',
  [ErrorCode.INVALID_HEADER]: 'header is either empty or invalid',
} as const;
