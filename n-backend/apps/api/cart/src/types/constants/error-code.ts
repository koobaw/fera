export const ErrorMessage = {};
export enum ErrorCode {
  USER_NOT_FOUND = 'USER_1000',
  GET_INVALID_WEB_BACK_ORDER_FLAG_ERROR = 'SOMETHING_WENT_WRONG_1000',
  INTERNAL_SERVER_ERROR = 'INTERNAL_1000',
}
export const CartErrorMessage = {
  [ErrorCode.USER_NOT_FOUND]: 'wrong UserId',
  [ErrorCode.GET_INVALID_WEB_BACK_ORDER_FLAG_ERROR]:
    'GET INVALID WEB BACK ORDER FLAG VALUE ERROR',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'internal server error',
};
export enum ReceivingMethod {
  DELIVERY_TO_SPECIFIED_ADDRESS = '1',
  STORE_RESERVE = '2',
}
export enum DropShippingCategory {
  TRUSCO_NAKAYAMA = '1',
  PRODUCT_WITHOUT_JAN = '2',
  MP = '3',
}
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

export enum CommonProcessCategoryError {
  CART_CATEGORY = 'cart',
  CART_CATEGORY_PRODUCTITEM = 'detail 1',
  CART_DATA_CODE1 = 'carts-data-error-001',
  CART_LINE_CODE1 = 'carts-line-error-001',
  CART_LINE_CODE2 = 'carts-line-error-002',
  CART_LINE_CODE3 = 'carts-line-error-003',
  CART_LINE_CODE4 = 'carts-line-error-004',
}

export const CommonProcessCategoryErrorMessage = {
  CART_DATA_CODE1_DESCRIPTION: '同時購入できない商品が選択されています。',
  CART_LINE_CODE1_DESCRIPTION:
    '同時購入できない商品があります。商品を削除するか、それ以外の商品を削除してください。',
  CART_LINE_CODE2_DESCRIPTION:
    'バラ苗と同時購入できない商品があります。バラ苗を削除するか、それ以外の商品を削除してください。',
  CART_LINE_CODE3_DESCRIPTION:
    '母の日商品と同時購入できない商品があります。母の日商品を削除するか、それ以外の商品を削除してください。',
  CART_LINE_CODE4_DESCRIPTION:
    '父の日商品と同時購入できない商品があります。父の日商品を削除するか、それ以外の商品を削除してください。',
};

export enum CartCommonErrorCategory {
  CART_CATEGORY = 'cart',
  CART_CATEGORY_CODE = 'carts-data-error-003',
}

export const CartCommonErrorCategoryErrors = {
  CART_CATEGORY_MAX_MINI_STEP_COMMON: '指定された数量が正しくありません。',
  CART_CATEGORY_MIN_ORDER_QTY: '本商品の一注文における最小注文数は{}です。',
  CART_CATEGORY_MAX_ORDER_QTY: '本商品の一注文における最大注文数は{}です。',
  CART_CATEGORY_STEP_QTY: '最小注文単位は{}です。{}個ずつの注文が可能です。',
};
