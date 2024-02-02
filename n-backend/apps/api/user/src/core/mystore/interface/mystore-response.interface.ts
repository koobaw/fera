export interface MystoreRegistRes {
  code: number;
  message: string;
}

export interface MystoreUpdateRes {
  code: number;
  message: string;
}

export interface MystoreGetRes {
  code: number;
  message: string;
  data: MystoreRecord[];
}

export interface MystoreRecord {
  code: string;
  name: string;
  address: string;
  businessTime: string;
  isFavoriteStore: boolean;
  originalCreatedAt: string;
}

export type MystoreListWithStoreCodeKey = {
  [keys: string]: MystoreRecord;
};
