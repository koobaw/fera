export enum ErrorCode {
  ORDER_CREATION_FAILED = 'ORDER_1000',
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
  // Parameter Validation
  PARAM_BAD_PARAMETER_IS_WEB = 'PARAM_1000',
  // Create cart API
  CART_CREATE_ID_FAILED = 'CART_1000',
  CART_STORE_CODE_OR_PREFECTURE_REQUIRED = 'CART_1001',
  CART_FIRE_STORE_ERROR = 'CART_1002',
  CART_NOT_FOUND = 'CART_1003',
  CHECKOUT_CREATE_ID_FAILED = 'CHECKOUT_1000',
  CHECKOUT_FIRE_STORE_ERROR = 'CHECKOUT_1001',
  USER_NOT_FOUND = 'USER_1004',
  GET_INVALID_WEB_BACK_ORDER_FLAG_ERROR = 'GET_INVALID_WEB_BACK_ORDER_FLAG_ERROR',
}

export const CartErrorMessage = {
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
  // Parameter Validation
  [ErrorCode.PARAM_BAD_PARAMETER_IS_WEB]: 'is_web value must be 1 or 0',
  // Create Cart API
  [ErrorCode.CART_CREATE_ID_FAILED]: 'failed to generate cart id',
  [ErrorCode.CART_STORE_CODE_OR_PREFECTURE_REQUIRED]:
    'Store Code or prefecture required',
  [ErrorCode.CART_FIRE_STORE_ERROR]: 'Something went wrong',
  [ErrorCode.CART_NOT_FOUND]: 'Cart with id not found',
};

export const CheckoutErrorMessage = {
  [ErrorCode.CHECKOUT_CREATE_ID_FAILED]: 'failed to generate checkout id',
  [ErrorCode.CHECKOUT_FIRE_STORE_ERROR]:
    'failed to finish the payment for order',
  [ErrorCode.USER_NOT_FOUND]: 'User id not found',
};

export const OrderCreationErrorMessage = {
  [ErrorCode.ORDER_CREATION_FAILED]:
    'Failed to create the orderId ,order confirmation failed please try again!!',
};

export const checkItemCategory = {
  ORDER_NAMEPLATE: { id: '1', value: 'order nameplate' },
  ORDER_AGRICULTURAL: { id: '2', value: 'order agricultural sheet' },
  ORDER_AGRICULTURAL_MULCH: {
    id: '3',
    value: 'Order agricultural mulch sheet',
  },
  EASY_ORDER: { id: '4', value: 'Easy order curtain' },
  SEMI_ORDER: { id: '5', value: 'semi-order curtain' },
  ROSE_SEEDLINGS: { id: '6', value: 'Rose seedlings' },
  MOTHERS_DAY: { id: '7', value: 'Mothers day' },
  FATHERS_DAY: { id: '8', value: 'Fathers day' },
  CUSTOM_SCREEN: { id: '9', value: 'custom screen door' },
};

export enum PaymentMethod {
  CREDIT_CARD = '1',
  CONVENIENCE_STORE = '2',
  GMO_DEFERRED_PAYMENT = '3',
  CASH_ON_DELIVERY = '4',
  FULL_AMOUNT_POINTS = '5',
  GMO_BILL_PAYMENT = '6',
  D_PAYMENT = '7',
  AMAZON_PAY = '8',
}
