import { Auditable } from './common/auditable';

export const STORES_COLLECTION_NAME = 'stores';

export interface Store extends Auditable {
  code: string; // 店舗コード
  name: string; // 店舗名
  address: string; //  住所
  postCode: string; // 郵便番号
  telNumberList: {
    // 電話番号リスト
    contactName: string; // 連絡先名称
    telNumber: string; // 電話番号（ハイフォン付）
  }[];
  businessTime: string; // 営業時間
  businessTimeNote: string | null; // 営業時間注記
  regularHoliday: string; // 定休日
  regularHolidayNote: string | null; // 定休日注記
}

export type OmitTimestampStore = Omit<
  Store,
  'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;
