export enum ErrorCode {
  SALESFORCE_PARAMS_NOT_FOUND = 'SALESFORCE_API_1000',
  SALESFORCE_FAILED_TO_FETCH_TOKEN = 'SALESFORCE_API_1001',
  SALESFORCE_FAILED_TO_FETCH_USER_ID = 'SALESFORCE_API_1002',
  SALESFORCE_FAILED_TO_REFRESH_TOKEN = 'SALESFORCE_API_1003',
}

export const ErrorMessage = {
  [ErrorCode.SALESFORCE_PARAMS_NOT_FOUND]: 'params not found',
  [ErrorCode.SALESFORCE_FAILED_TO_FETCH_TOKEN]:
    'could not fetch salesforce token',
  [ErrorCode.SALESFORCE_FAILED_TO_FETCH_USER_ID]:
    'could not fetch salesforce userId',
  [ErrorCode.SALESFORCE_FAILED_TO_REFRESH_TOKEN]:
    'could not refresh salesforce token',
};
