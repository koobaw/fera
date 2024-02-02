export enum CommonProcessCategoryError {
  CART_CATEGORY = 'cart',
  CART_CATEGORY_SHIPPING = 'shipping',
  CART_CATEGORY_STORE = 'store',
  CART_CATEGORY_PRODUCTITEM = 'detail1',
  CART_CATEGORY_PRODUCTITEM_2 = 'detail2',
  CART_DATA_CODE1 = 'carts-data-error-001',
  CART_DATA_CODE2 = 'carts-data-error-002',
  CART_DATA_CODE4 = 'carts-data-error-004',
  CART_DATA_CODE5 = 'carts-data-error-005',
  CART_LINE_CODE1 = 'carts-line-error-001',
  CART_LINE_CODE2 = 'carts-line-error-002',
  CART_LINE_CODE3 = 'carts-line-error-003',
  CART_LINE_CODE4 = 'carts-line-error-004',
  CART_LINE_CODE5 = 'carts-line-error-005',
  CART_LINE_CODE6 = 'carts-line-error-006',
  CART_LINE_CODE7 = 'carts-line-error-007',
  CART_LINE_CODE8 = 'carts-line-error-008',
  CART_LINE_CODE9 = 'carts-line-error-009',
  CART_LINE_CODE10 = 'carts-line-error-010',
  CART_SHIPPING_NOTIFICATION1 = 'carts-shipping-notification-001',
  CART_LINE_NOTIFICATION1 = 'carts-line-notification-001',
  CART_PICKUP_NOTIFICATION1 = 'carts-pickup-notification-001',
  CART_LINE_CODE11 = 'carts-line-error-011',
  CART_LINE_CODE12 = 'carts-line-error-012',
  CART_SHIPPING_LINE_CODE1 = 'carts-shipping-error-001',
}

export const CommonProcessCategoryErrorMessage = {
  CART_DATA_CODE4_MESSAGE:
    '在庫が不足する商品が含まれているため注文手続きに進めません。該当商品を確認し、数量の変更、受取方法、店舗の変更または商品の削除を行ってください。',
  CART_LINE_CODE9_DESCRIPTION: 'ご指定の受取方法の在庫が不足しています。',
  CART_SHIPPING_NOTIFICATION1_MESSAGE: 'お取り寄せとなる商品があります。',
  CART_LINE_NOTIFICATION1_DESCRIPTION:
    'ご希望の商品在庫が不足しているため、お取り寄せでのご注文となります。',
  CART_LINE_CODE10_DESCRIPTION: 'ご指定の受取方法の在庫が不足しています。',
  CART_PICKUP_NOTIFICATION1_DESCRIPTION: 'お取り寄せとなる商品があります。',
};

export const MadeToOrderCategory = {
  ORDER_NAMEPLATE: { id: '1', value: 'order nameplate' },
  EASY_ORDER: { id: '4', value: 'Easy order curtain' },
  SEMI_ORDER: { id: '5', value: 'semi-order curtain' },
  CUSTOM_SCREEN: { id: '9', value: 'custom screen door' },
};

export const CategoryDescriptionMessage = {
  [CommonProcessCategoryError.CART_DATA_CODE2]:
    '入力不備があります。赤字メッセージが記載された商品をご確認ください',
  [CommonProcessCategoryError.CART_LINE_CODE5]:
    'オンラインで販売ができない商品です。商品の削除を行ってください',
  [CommonProcessCategoryError.CART_LINE_CODE6]:
    '店舗取置が選択できない商品です。',
  [CommonProcessCategoryError.CART_LINE_CODE7]:
    '指定住所配送が選択できない商品です。',
  [CommonProcessCategoryError.CART_LINE_CODE8]:
    '対象の店舗で取置ができません。受取店舗を変更するか、指定住所配送を選択して下さい。',
  [CommonProcessCategoryError.CART_LINE_CODE11]:
    'こちらの商品は、ご指定の住所への配送は行っておりません。配送先の変更または商品を削除して下さい。',
  [CommonProcessCategoryError.CART_LINE_CODE12]:
    'こちらの商品は、ご指定の住所への配送は行っておりません。配送先の変更または商品を削除して下さい。',
  [CommonProcessCategoryError.CART_DATA_CODE5]:
    '指定住所を選択している商品のうち、ご指定の住所への配送は行っていない商品があります。配送先の変更または商品を削除して下さい。',
  [CommonProcessCategoryError.CART_SHIPPING_LINE_CODE1]:
    'ご指定の住所への配送は行っていない商品があります。配送先の変更または商品を削除して下さい。',
};

export enum ErrorCode {
  UNDELIVERABLE_CHECK_API = 'UNDELIVERABLE_1000',
}

export const ErrorMessage = {
  [ErrorCode.UNDELIVERABLE_CHECK_API]: 'UNDELIVERABLE_CHECK_API api error',
};
