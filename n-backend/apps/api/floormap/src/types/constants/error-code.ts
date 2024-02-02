export enum ErrorCode {
  // FloorMap API
  //  Navigation information acquisition API product code error / ナビ情報取得API 商品コード不正
  FLOOR_MAP_BADREQUESTPRODUCTCODE = 'FLOOR_MAP_3061',
  // Navigation information acquisition API store code error / ナビ情報取得API 店舗コード不正
  FlOOR_MAP_BADREQUESTSTORECODE = 'FLOOR_MAP_3062',
  // Navigation information acquisition API authentication failure / ナビ情報取得API 認証失敗
  FlOOR_MAP_AUTHENTICATIONFAILED = 'FLOOR_MAP_3063',
  // Connecting to legacy database failure / 従来のデータベースへの接続エラー
  FlOOR_MAP_CONNECT_LEGACY_DB = 'FLOOR_MAP_3064',
  // Price API
  FLOOR_MAP_GET_MULE_API = 'FLOOR_MAP_3065',
  // FloorMap Mule system error / FloorMap Mule システムエラー
  MULE_API_BAD_REQUEST = 'APIError.7002',
  MULE_API_UNAUTHORIZED_ACCESS = 'APIError.7003',
  MULE_API_SERVER_ERROR = 'APIError.7004',
  MULE_API_RESOURCE_NOT_FOUND = 'APIError.7006',
  // FloorMap GMO system error / クレジットカードGMOシステムエラー
  GMO_ERROR = 'APIError.7005',
}

export const ErrorMessage = {
  // FloorMap API
  [ErrorCode.FLOOR_MAP_BADREQUESTPRODUCTCODE]: 'product code api error',
  [ErrorCode.FlOOR_MAP_BADREQUESTSTORECODE]: 'store code api error',
  [ErrorCode.FlOOR_MAP_AUTHENTICATIONFAILED]: 'authentication api error',
  [ErrorCode.FlOOR_MAP_CONNECT_LEGACY_DB]: 'authentication api error',
  [ErrorCode.FLOOR_MAP_GET_MULE_API]: 'mule floor map api error',
  // CreditCard Mule system error / CreditCard Mule システムエラー
  [ErrorCode.MULE_API_BAD_REQUEST]: 'Bad request',
  [ErrorCode.MULE_API_UNAUTHORIZED_ACCESS]: 'Unauthorized request',
  [ErrorCode.MULE_API_SERVER_ERROR]: 'Internal server/mule error',
  [ErrorCode.MULE_API_RESOURCE_NOT_FOUND]:
    'The requested mule resource could not be found',
  // CreditCard GMO system error / クレジットカードGMOシステムエラー
  [ErrorCode.GMO_ERROR]: 'Gmo system error',
};
