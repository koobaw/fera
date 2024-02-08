export interface PACItemResponseSuccess {
  RESULT_CODE: string; // 結果コード
  RESULT_MESSAGE: string; // 結果メッセージ
  MEMBER_INFO?: MemberInfo; // 会員階層
}

interface MemberInfo {
  MEMBER_RANK: string; // 会員ランク
  PROMOTION_INFO?: PromotionInfo[]; // プロモーション階層
}

interface PromotionInfo {
  PROMOTION_CODE: string; // プロモーションコード
  PROMOTION_DESC: string; // プロモーション説明
  PROMOTION_EDT: string; // プロモーション終了日時
  ITERM_INFO?: ItemInfo[]; // 商品階層
}

interface ItemInfo {
  JAN_CODE: string; // 商品コード
  POINT_PLUS: string; // 付与ポイント
  STORE_CODE: string; // ストアコード
}

export type PACItemErrorResponse = PACItemResponseSuccess;
