import { GeoPoint } from '@google-cloud/firestore';

import { Auditable } from './common/auditable';
import { Timestamp } from './common/time';

export const STORES_DETAIL_COLLECTION_NAME = 'detail';

export interface StoreDetail extends Auditable {
  code: string; // 店舗コード
  landscape: GeoPoint; // 緯度・経度
  floorGuideList: // フロアガイド
  {
    floorGuideOrder: number; // 表示順
    floorGuideName: string; // 名称(本館など)
    floorGuideUrl: string; // 画像のURL
  }[];
  prefectureName: string; // 都道府県名
  prefectureCode: string; // 都道府県コード
  openingDate: Timestamp; // 開店日
  closingDate: Timestamp; // 閉店日 (閉店予定がない場合は9999年12月31日をセット)
  mainBuildingOpeningTime: Timestamp; // 本館（開店時間）
  mainBuildingClosingTime: Timestamp; // 本館（閉店時間）
  ResourceBuildingOpeningTime: Timestamp; // 資材館（開店時間）
  ResourceBuildingClosingTime: Timestamp; // 資材館（閉店時間）
  storeMapUrl: string[]; // 店舗マップURL
  visible: boolean; // ネット公開可否
  publiclyAccessible: boolean; // ネット公開対象店舗
  publiclyAccessibleFrom: Timestamp; // 公開開始日
  publiclyAccessibleTo: Timestamp; // 公開終了日

  supportPickup: boolean; // pickup 店舗取り置き利用可否
  supportCredit: boolean; // クレジット支払い可否
  supportPickupInnerLocker: boolean; // pickup店内ロッカー利用可否
  supportPickupPlace: boolean; // pickup店外ロッカー利用可否
  supportPickupPlaceParking: boolean; // pickupパーキング駐車場受け取り利用可否
  supportBackOrder: boolean; // 取り寄せ可否
  supportGeomagnetism: boolean; // 地磁気利用可否
  geomagnetismMapId: string; // 地磁気マップID
  supportPocketRegi: boolean; // ポケレジ利用可否
  supportCuttingService: boolean; // 事前加工サービス利用可否
  supportDogRun: boolean; // ドッグラン予約利用可否
  supportDIYReserve: boolean; // ワークショップ予約利用可否
  supportToolRental: boolean; // レンタル工具利用可否
  supportFacilityReservation: boolean; // 施設予約利用可否
  showVisitingNumber: boolean; // 店舗混雑状況表示可否 TODO要確認

  messageSettings: // メッセージ設定
  {
    from: Timestamp; // 実施開始日時
    to: Timestamp; // 実施終了日時
    message: string; // メッセージ
  }[];
  digitalFlyerURL: string; // デジタルチラシURL (EC用)
  materialHallExistence: boolean; // 資材館有無 (EC用)
  cultureClassExistence: boolean; // カルチャー教室有無 (EC用)
  cycleParkExistence: boolean; // サイクルパーク有無 (EC用)
  DIYSTYLEFloorExistence: boolean; // DIY STYLE 売場有無 (EC用)
  dogParkExistence: boolean; // ドッグラン有無 (EC用)
  exteriorPlazaExistence: boolean; // エクステリアプラザ有無 (EC用)
  foodAreaExistence: boolean; // フードコート有無 (EC用)
  gardeningHallExistence: boolean; // 園芸館有無 (EC用)
  greenAdvisorExistence: boolean; // グリーンアドバイザー在籍有無 (EC用)
  petsOneExistence: boolean; // ペッツワン有無 (EC用)
  reformCenterExistence: boolean; // リフォームセンター有無 (EC用)
  workshopExistence: boolean; // 工作室有無 (EC用)
  storePickupExistence: boolean; // 店舗受取サービス有無 (EC用)
  supermarketExistence: boolean; // スーパーマーケット併設有無 (EC用)
}
