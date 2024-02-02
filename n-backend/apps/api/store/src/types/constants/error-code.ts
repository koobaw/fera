export enum ErrorCode {
  // Detail API
  DETAIL_NG_UNEXPECTED = 'DETAIL_1000',
  DETAIL_NG_NOT_FOUND = 'DETAIL_1001',
  DETAIL_NG_STORE_TO_DB = 'DETAIL_1002',
  DETAIL_NG_MULE_DETAIL_API = 'DETAIL_1003',

  // Search API
  SEARCH_POST_LANDSCAPE_NEED_FULL_PARAM = 'SEARCH_1001',

  // Parameter Validation
  PARAM_BAD_PARAMETER_SAVE = 'PARAM_1000',
}

export const ErrorMessage = {
  // Detail API
  [ErrorCode.DETAIL_NG_UNEXPECTED]: 'unexpected error',
  [ErrorCode.DETAIL_NG_NOT_FOUND]: 'data not found',
  [ErrorCode.DETAIL_NG_STORE_TO_DB]: 'failed to store detail to db',
  [ErrorCode.DETAIL_NG_MULE_DETAIL_API]: 'mule detail api error',

  // Search API
  [ErrorCode.SEARCH_POST_LANDSCAPE_NEED_FULL_PARAM]:
    'landscape need full param',

  // Parameter Validation
  [ErrorCode.PARAM_BAD_PARAMETER_SAVE]: 'save value must be true or false',
};
