export enum ErrorCode {
  // Anonymous Migrate API as example
  ANONYMOUS_MIGRATE_INVALID_USER = 'ANONYMOUS_MIGRATE_1000',

  INTERAL_API_ERROR = 'PocketRegiCheckInError.500',

  INVALID_SHOP_CODE = 'PocketRegiCheckInError.1000',

  UNSUPPORTED_SHOP_CODE = 'PocketRegiCheckInError.1001',

  USER_NOT_FOUND = 'PocketRegiCheckInError.1002',

  INVALID_CHECKIN_TIME = 'PocketRegiCheckInError.1003',

  PARAM_BAD_PARAMETER_IS_WEB = 'PARAM_1000',

  PRODUCT_DETAIL_API_ERROR = '7002',

  PRICE_API_ERROR = 'ApiError.6010',

  INTERNAL_SERVER_ERROR = 'ApiError.7003',

  BAD_REQUEST_PRODUCT_ID = 'ApiError.6007',

  BAD_REQUEST_STORE_CODE = 'ApiError.6008',

  MULE_API_SERVER_ERROR = 'APIError.7004',

  GMO_ERROR = 'APIError.7005',

  MULE_API_UNAUTHORIZED_ACCESS = 'APIError.7003',

  MULE_API_BAD_REQUEST = 'APIError.7002',

  ORDER_ID_NOT_FOUND = 'RETURN_STATUS_21001',

  FETCH_ORDER_DOCUMENT_FAIL = 'RETURN_STATUS_21002',

  SET_RETURN_DATE_FAILED = 'RETURN_STATUS_21003',

  BAD_REQUEST_INVALID_ORDER_ID = 'RETURN_STATUS_21004',

  BAD_REQUEST_PARAMETERS = 'RETURN_STATUS_21005',

  UNAUTHORIZED_ACCESS = 'RETURN_STATUS_21006',

  // Register MemberId API / MemberId API の登録
  INVALID_TOKEN_ID = 'APIError.7001',

  // Firestore operation failed
  FIRESTORE_OPERATION = 'ApiError.7009',

  // Private member acquisition api error
  PRIVATE_MEMBER_INFO_ACQUISITION_ERROR = 'ApiError.7010',

  // Fetch cartProductsFromFirestore error
  CARTPRODUCTS_FETCH_FROM_DB = 'ApiError.7007',

  // Data not found for a product
  DETAIL_NG_NOT_FOUND = 'ApiError.7008',

  // Bad parameter for membership rank update
  PARAM_BAD_PARAMETER_UPDATE_MEMBERSHIPRANK = 'ApiError.7011',
}

export const ErrorMessage = {
  // Anonymous Migrate API as example
  [ErrorCode.ANONYMOUS_MIGRATE_INVALID_USER]: 'invalid user',

  [ErrorCode.INTERAL_API_ERROR]: 'Internal API Error',

  [ErrorCode.INVALID_SHOP_CODE]: 'Inavlid store code',

  [ErrorCode.UNSUPPORTED_SHOP_CODE]:
    'Store is not eligible for Pocket Register.',

  [ErrorCode.USER_NOT_FOUND]: 'User not found',

  [ErrorCode.INVALID_CHECKIN_TIME]: 'Inavlid check in time',

  [ErrorCode.PARAM_BAD_PARAMETER_IS_WEB]: 'is_web value must be 1 or 0',

  [ErrorCode.PRODUCT_DETAIL_API_ERROR]: 'Product detail not found',

  [ErrorCode.PRICE_API_ERROR]: 'Price detail not found for product',

  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal Server Error',

  [ErrorCode.BAD_REQUEST_PRODUCT_ID]: 'Product Id is empty or not a string',

  [ErrorCode.BAD_REQUEST_STORE_CODE]: 'StoreCode is empty or not a string',

  [ErrorCode.MULE_API_SERVER_ERROR]: 'Internal server/mule error',

  [ErrorCode.MULE_API_UNAUTHORIZED_ACCESS]: 'Unauthorized request',

  [ErrorCode.GMO_ERROR]: 'Gmo system error',

  [ErrorCode.MULE_API_BAD_REQUEST]: 'Bad request',

  [ErrorCode.ORDER_ID_NOT_FOUND]: 'Order ID not found',

  [ErrorCode.FETCH_ORDER_DOCUMENT_FAIL]: 'Failed to fetch the Order Document',

  [ErrorCode.SET_RETURN_DATE_FAILED]: 'Failed to set return date to firestore',

  [ErrorCode.BAD_REQUEST_INVALID_ORDER_ID]: 'Bad Request Invalid Order Id',

  [ErrorCode.BAD_REQUEST_PARAMETERS]: 'Bad Request Parameters',

  [ErrorCode.UNAUTHORIZED_ACCESS]: 'Unauthorized Access',

  // Register MemberId API / MemberId API の登録
  [ErrorCode.INVALID_TOKEN_ID]: 'Invalid user token',

  // Firestore operation failed
  [ErrorCode.FIRESTORE_OPERATION]: 'Firestore operation failed',

  // Private member acquisition api error
  [ErrorCode.PRIVATE_MEMBER_INFO_ACQUISITION_ERROR]:
    'Unable to fetch rank of member',

  // Fetch cartProductsFromFirestore error
  [ErrorCode.CARTPRODUCTS_FETCH_FROM_DB]: 'No data available',

  // Data not found for a product
  [ErrorCode.DETAIL_NG_NOT_FOUND]: 'No data available for products',

  // Bad parameter for membership rank update
  [ErrorCode.PARAM_BAD_PARAMETER_UPDATE_MEMBERSHIPRANK]:
    'Bad parameter in request',
};
