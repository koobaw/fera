export enum ErrorCode {
  // Addresses API
  ADDRESSES_UPDATE_API_CONNECTION_ERROR = 'ADDRESSES_1000',
  ADDRESSES_UPDATE_API_UPDATE_ERROR = 'ADDRESSES_1001',

  // Anonymous Migrate API
  ANONYMOUS_MIGRATE_USER_NOT_EXIST = 'ANONYMOUS_MIGRATE_999',
  ANONYMOUS_MIGRATE_NO_USER_DATA = 'ANONYMOUS_MIGRATE_1000',
  ANONYMOUS_MIGRATE_STORE_TO_DB = 'ANONYMOUS_MIGRATE_1001',
  ANONYMOUS_MIGRATE_MISSING_NEED_PARAM = 'ANONYMOUS_MIGRATE_1002',
  ANONYMOUS_MIGRATE_MISSING_LEGACY_USER = 'ANONYMOUS_MIGRATE_1003',
  ANONYMOUS_MIGRATE_INVALID_USER_TYPE = 'ANONYMOUS_MIGRATE_1004',

  // Anonymous Create API
  ANONYMOUS_CREATE_INVALID_USER = 'ANONYMOUS_CREATE_1000',
  ANONYMOUS_CREATE_STORE_TO_DB = 'ANONYMOUS_CREATE_1001',
  ANONYMOUS_CREATE_USER_EXISTS = 'ANONYMOUS_CREATE_1002',

  // Favorites Common
  FAVORITES_DEFAULT_EXISTS_MULTIPLE = 'FAVORITES_1000',

  // Favorite Products API
  FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED = 'FAVORITE_PRODUCTS_1000',
  FAVORITE_PRODUCTS_MULE_MY_LIST_API_DEFAULT_LIST_NOT_FOUND = 'FAVORITE_PRODUCTS_1001',
  FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED = 'FAVORITE_PRODUCTS_2000',
  FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_AVAILABILITY_API_FAILED = 'FAVORITE_PRODUCTS_2001',
  FAVORITE_PRODUCTS_STORE_TO_DB = 'FAVORITE_PRODUCTS_3000',
  FAVORITE_PRODUCTS_GET_FROM_FIRESTORE = 'FAVORITE_PRODUCTS_4000',
  FAVORITE_PRODUCTS_GET_FROM_BFF = 'FAVORITE_PRODUCTS_5000',

  // Favorite Products Register API
  FAVORITE_PRODUCTS_REGISTER_STORE_TO_DB = 'FAVORITE_PRODUCTS_REGISTER_1000',
  FAVORITE_PRODUCTS_REGISTER_CREATE_TASK = 'FAVORITE_PRODUCTS_REGISTER_1001',

  // Favorite Products Delete API
  FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB = 'FAVORITE_PRODUCTS_DELETE_1000',
  FAVORITE_PRODUCTS_DELETE_CLAIM_EMPTY = 'FAVORITE_PRODUCTS_DELETE_1001',
  FAVORITE_PRODUCTS_DELETE_USER_DATA_NOT_EXISTS = 'FAVORITE_PRODUCTS_DELETE_1002',
  FAVORITE_PRODUCTS_DELETE_FROM_DB = 'FAVORITE_PRODUCTS_DELETE_1003',
  FAVORITE_PRODUCTS_DELETE_PUSH_TO_TASK_QUEUE = 'FAVORITE_PRODUCTS_DELETE_1004',
  FAVORITE_PRODUCTS_DELETE_INVALID_USER_DATA = 'FAVORITE_PRODUCTS_DELETE_1005',

  // Address Common API
  ADDRESSES_CLAIM_EMPTY = 'ADDRESSES_1000',

  // Address Find API
  ADDRESSES_MULE_FIND_API_FAILED = 'ADDRESSES_FIND_1000',

  // Addresses Create API
  ADDRESSES_CREATE_MULE_API_FAILED = 'ADDRESSES_CREATE_1000',

  // login API
  LOGIN_UNKNOWN = 'LOGIN_1000',
  LOGIN_NG_PARAMS = 'LOGIN_1001',
  LOGIN_INVALID_USER = 'LOGIN_1002',
  LOGIN_NG_CODE = 'LOGIN_1003',
  LOGIN_NG_TOKEN = 'LOGIN_1004',
  LOGIN_NG_SALESFORCE_USER_ID = 'LOGIN_1005',

  // logout API
  LOGOUT_INVALID_USER = 'LOGOUT_1000',
  LOGOUT_NG_TOKEN = 'LOGOUT_1001',
  LOGOUT_DELETE_FROM_CLAIM = 'LOGOUT_1002',
  LOGOUT_CLAIM_EMPTY = 'LOGOUT_1003',

  // personal API
  PERSONAL_INFORMATION_FAILED_TO_GET_SALESFORCE_USER_ID = 'PERSONAL_INFORMATION_1000',
  // mystore更新API
  MYSTORE_UPDATE_INVALID_USER = 'MYSTORE_UPDATE_1000',
  MYSTORE_UPDATE_FROM_MULE = 'MYSTORE_UPDATE_1001',
  MYSTORE_UPDATE_STORE_TO_DB = 'MYSTORE_UPDATE_1002',
  // mystore取得API
  MYSTORE_GET_INVALID_USER = 'MYSTORE_GET_1000',
  MYSTORE_GET_FROM_DB = 'MYSTORE_GET_1001',

  // point取得API
  MEMBER_POINT_GET_CONNECTION_FAILED = 'MemberPoint_1000',
  MEMBER_POINT_GET_ATTESTATION_FAILED = 'MemberPoint_1001',
  MEMBER_POINT_GET_DELETE_BY_DUPLICATE = 'MemberPoint_1002',
  MEMBER_POINT_GET_PARSE_USER_ID = 'MemberPoint_1003',
  MEMBER_POINT_GET_GET_POINT_FAILED = 'MemberPoint_1004',
  MEMBER_POINT_GET_STORE_TO_DB = 'MemberPoint_1005',
  MEMBER_POINT_GET_CLAIM_MEMBER_NOT_FOUND = 'MemberPoint_1006',

  // 退会API
  UNREGISTER_CLAIM_EMPTY = 'UNREGISTER_1000',
  UNREGISTER_DELETE_FROM_DB = 'UNREGISTER_1001',
  UNREGISTER_ALREADY_DELETED = 'UNREGISTER_1002',
}

export const ErrorMessage = {
  // Addresses API
  [ErrorCode.ADDRESSES_UPDATE_API_CONNECTION_ERROR]:
    'failed to connect mule api for update address',
  [ErrorCode.ADDRESSES_UPDATE_API_UPDATE_ERROR]: 'failed to update address',

  // Anonymous Migrate API
  [ErrorCode.ANONYMOUS_MIGRATE_USER_NOT_EXIST]: 'user not exist',
  [ErrorCode.ANONYMOUS_MIGRATE_NO_USER_DATA]: 'no user data',
  [ErrorCode.ANONYMOUS_MIGRATE_STORE_TO_DB]: 'failed to store prices to db',
  [ErrorCode.ANONYMOUS_MIGRATE_MISSING_NEED_PARAM]:
    'required params not registered',
  [ErrorCode.ANONYMOUS_MIGRATE_MISSING_LEGACY_USER]:
    'can not find legacy user data',
  [ErrorCode.ANONYMOUS_MIGRATE_INVALID_USER_TYPE]: 'invalid user type',
  // Anonymous Create API
  [ErrorCode.ANONYMOUS_CREATE_INVALID_USER]: 'invalid user',
  [ErrorCode.ANONYMOUS_CREATE_STORE_TO_DB]: 'failed to store prices to db',
  [ErrorCode.ANONYMOUS_CREATE_USER_EXISTS]: 'user already exists',

  // Favorites Common
  [ErrorCode.FAVORITES_DEFAULT_EXISTS_MULTIPLE]:
    'favorites deafult exists multiple',

  // Favorite Products API
  [ErrorCode.FAVORITE_PRODUCTS_MULE_MY_LIST_API_FAILED]:
    'failed to get favorite product list from mule api',
  [ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_API_FAILED]:
    'failed to get favorite products from mule api',
  [ErrorCode.FAVORITE_PRODUCTS_MULE_MY_PRODUCTS_AVAILABILITY_API_FAILED]:
    'failed to get favorite products availability from mule api',

  // Favorite Products Read API
  [ErrorCode.FAVORITE_PRODUCTS_GET_FROM_FIRESTORE]:
    'failed to get data from firestore',

  // Favorite Products Register API
  [ErrorCode.FAVORITE_PRODUCTS_REGISTER_STORE_TO_DB]: 'failed to save to db',
  [ErrorCode.FAVORITE_PRODUCTS_REGISTER_CREATE_TASK]: 'failed to create task',

  // Favorite Products Delete API
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_FAILED_REFERENCE_USER_FROM_DB]:
    'failed to reference user data from firestore',
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_CLAIM_EMPTY]:
    'user is already logout or not login',
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_USER_DATA_NOT_EXISTS]:
    'user data is not exists',
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_FROM_DB]: 'failed to delete from db',
  [ErrorCode.FAVORITE_PRODUCTS_GET_FROM_BFF]:
    'failed to get data from bff products service',
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_PUSH_TO_TASK_QUEUE]:
    'failed to push task queue',
  [ErrorCode.FAVORITE_PRODUCTS_DELETE_INVALID_USER_DATA]:
    'default mylist is not single',

  // Address Common API
  [ErrorCode.ADDRESSES_CLAIM_EMPTY]: 'user is already logout or not login',

  // Address Find API
  [ErrorCode.ADDRESSES_MULE_FIND_API_FAILED]:
    'failed to gate address list from mule api',

  // Addresses Create API
  [ErrorCode.ADDRESSES_CREATE_MULE_API_FAILED]:
    'failed to create addresses in mule',

  // login API
  [ErrorCode.LOGIN_UNKNOWN]: 'unknown error',
  [ErrorCode.LOGIN_NG_PARAMS]: 'bad parameters',
  [ErrorCode.LOGIN_INVALID_USER]: 'invalid firebase user',
  [ErrorCode.LOGIN_NG_CODE]: 'failed to get token',
  [ErrorCode.LOGIN_NG_TOKEN]: 'failed to get salesforce user id',
  [ErrorCode.LOGIN_NG_SALESFORCE_USER_ID]:
    'failed to get user info from mule api',
  // logout API
  [ErrorCode.LOGOUT_INVALID_USER]: 'invalid user',
  [ErrorCode.LOGOUT_NG_TOKEN]: 'failed to get token',
  [ErrorCode.LOGOUT_DELETE_FROM_CLAIM]: 'failed to delete from claim',
  [ErrorCode.LOGOUT_CLAIM_EMPTY]: 'user is already logout or not login',
  // mystore更新API
  [ErrorCode.MYSTORE_UPDATE_INVALID_USER]: 'invalid user',
  [ErrorCode.MYSTORE_UPDATE_FROM_MULE]: 'failed to mystore data from mule',
  [ErrorCode.MYSTORE_UPDATE_STORE_TO_DB]: 'failed to mystore to db',
  // mystore取得API
  [ErrorCode.MYSTORE_GET_INVALID_USER]: 'invalid user',
  [ErrorCode.MYSTORE_GET_FROM_DB]: 'failed to get mystore data from db',
  // point取得API
  [ErrorCode.MEMBER_POINT_GET_CONNECTION_FAILED]: 'cm server connection error',
  [ErrorCode.MEMBER_POINT_GET_ATTESTATION_FAILED]: 'Invalid user id',
  [ErrorCode.MEMBER_POINT_GET_DELETE_BY_DUPLICATE]:
    'This userId has been deleted through consolidation.',
  [ErrorCode.MEMBER_POINT_GET_PARSE_USER_ID]:
    'Failed to get user id from sended token',
  [ErrorCode.MEMBER_POINT_GET_GET_POINT_FAILED]: 'Failed to get point',
  [ErrorCode.MEMBER_POINT_GET_STORE_TO_DB]: 'Firestore save was failure',
  [ErrorCode.MEMBER_POINT_GET_CLAIM_MEMBER_NOT_FOUND]:
    'Your claims were expired',
  // 退会API
  [ErrorCode.UNREGISTER_CLAIM_EMPTY]: 'user is already logout or not login',
  [ErrorCode.UNREGISTER_DELETE_FROM_DB]: 'failed delete user data from db',
  [ErrorCode.UNREGISTER_ALREADY_DELETED]:
    'user data is already deleted or not exist',
};
