export enum ErrorCode {
  // Price API
  PRICE_GET_MULE_PRICE_API = 'PRICE_1000',
  PRICE_GET_STORE_TO_DB = 'PRICE_1001',
  // Detail API
  DETAIL_NG_UNEXPECTED = 'DETAIL_1000',
  DETAIL_NG_NOT_FOUND = 'DETAIL_1001',
  DETAIL_NG_STORE_TO_DB = 'DETAIL_1002',
  DETAIL_NG_MULE_DETAIL_API = 'DETAIL_1003',
  // Inventory API
  INVENTORY_NG_MULE_INVENTORY_API = 'INVENTORY_1000',
  INVENTORY_UNKNOWN = 'INVENTORY_1001',
  INVENTORY_GET_STORE_TO_DB = ' INVENTORY_1002',
  // Category API
  CATEGORY_NG_FIRESTORE = 'CATEGORY_1000',
  // Search API
  SEARCH_GET_GOOGLE_API = 'SEARCH_1000',
  SEARCH_CATEGORY_NOT_FOUND = 'SEARCH_1001',
  // Recommend API
  RECOMMEND_GET_GOOGLE_API = 'RECOMMEND_1000',
  RECOMMEND_CATEGORY_NOT_FOUND = 'RECOMMEND_1001',
  // Parameter Validation
  PARAM_BAD_PARAMETER_SAVE = 'PARAM_1000',
}

export const ErrorMessage = {
  // price API
  [ErrorCode.PRICE_GET_MULE_PRICE_API]: 'mule price api error',
  [ErrorCode.PRICE_GET_STORE_TO_DB]: 'failed to store prices to db',
  // Detail API
  [ErrorCode.DETAIL_NG_UNEXPECTED]: 'unexpected error',
  [ErrorCode.DETAIL_NG_NOT_FOUND]: 'data not found',
  [ErrorCode.DETAIL_NG_STORE_TO_DB]: 'failed to store detail to db',
  [ErrorCode.DETAIL_NG_MULE_DETAIL_API]: 'mule detail api error',
  // Inventory API
  [ErrorCode.INVENTORY_NG_MULE_INVENTORY_API]: 'mule inventory api error',
  [ErrorCode.INVENTORY_UNKNOWN]: 'unknown error',
  [ErrorCode.INVENTORY_GET_STORE_TO_DB]: 'failed to store inventories to db',
  // Category API
  [ErrorCode.CATEGORY_NG_FIRESTORE]: 'failed to retrieve categories from DB',
  // Search API
  [ErrorCode.SEARCH_GET_GOOGLE_API]: 'google retail search api error',
  [ErrorCode.SEARCH_CATEGORY_NOT_FOUND]: 'category not found',
  // Recommend API
  [ErrorCode.RECOMMEND_GET_GOOGLE_API]: 'google retail recommend api error',
  [ErrorCode.RECOMMEND_CATEGORY_NOT_FOUND]: 'category not found',
  // Parameter Validation
  [ErrorCode.PARAM_BAD_PARAMETER_SAVE]: 'save value must be true or false',
};
