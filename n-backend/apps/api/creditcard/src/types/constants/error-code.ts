export enum ErrorCode {
  // CreditCard Invalid Token / クレジットカードが無効なトークン
  MEMBER_ID_GET_CLAIM_MEMBER_NOT_FOUND = 'APIError.7001',
  // CreditCard Mule system error / CreditCard Mule システムエラー
  MULE_API_BAD_REQUEST = 'APIError.7002',
  MULE_API_UNAUTHORIZED_ACCESS = 'APIError.7003',
  MULE_API_SERVER_ERROR = 'APIError.7004',
  MULE_API_RESOURCE_NOT_FOUND = 'APIError.7006',
  CART_PRODUCTS_NOT_FOUND = 'APIError.7007',
  // CreditCard GMO system error / クレジットカードGMOシステムエラー
  GMO_ERROR = 'APIError.7005',
  // Parameter Validation / パラメータの検証
  PARAM_BAD_PARAMETER_IS_WEB = 'PARAM_1000',
  CARDS_STORE_TO_DB = 'CARDS_1001',
  CARDS_DELETE_TO_DB = 'CARDS_1002',
  CARDS_UPDATE_TO_DB = 'CARDS_1003',
  CARD_COLLECTION_NOT_EXISTS_IN_DB = 'CARDS_1004',
}

export const ErrorMessage = {
  // CreditCard Invalid Token / クレジットカードが無効なトークン
  [ErrorCode.MEMBER_ID_GET_CLAIM_MEMBER_NOT_FOUND]: 'Invalid user token',
  // CreditCard Mule system error / CreditCard Mule システムエラー
  [ErrorCode.MULE_API_BAD_REQUEST]: 'Bad request',
  [ErrorCode.MULE_API_UNAUTHORIZED_ACCESS]: 'Unauthorized request',
  [ErrorCode.MULE_API_SERVER_ERROR]: 'Internal server/mule error',
  [ErrorCode.MULE_API_RESOURCE_NOT_FOUND]:
    'The requested mule resource could not be found',
  [ErrorCode.CART_PRODUCTS_NOT_FOUND]: 'There is no products in cart',
  // CreditCard GMO system error / クレジットカードGMOシステムエラー
  [ErrorCode.GMO_ERROR]: 'Gmo system error',
  // Parameter Validation / パラメータの検証
  [ErrorCode.PARAM_BAD_PARAMETER_IS_WEB]: 'is_web value must be 1 or 0',
  [ErrorCode.CARDS_STORE_TO_DB]: 'failed to store credit card to db',
  [ErrorCode.CARDS_DELETE_TO_DB]: 'failed to delete credit card to db',
  [ErrorCode.CARDS_UPDATE_TO_DB]: 'failed to update credit card to db',
  [ErrorCode.CARD_COLLECTION_NOT_EXISTS_IN_DB]:
    'targetcardCollection is not exists in db',
};
