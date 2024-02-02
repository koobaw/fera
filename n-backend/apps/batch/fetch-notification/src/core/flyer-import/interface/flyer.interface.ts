import { DocumentReference } from '@google-cloud/firestore';

export interface LegacyFlyerList {
  campaign_id: string;
  plan_id: string;
  store_code: string;
  campaign_title: string;
  campaign_start: string;
  campaign_stop: string;
  head_image_url: string;
  tail_image_url: string;
}

export type StoreFlyerList = {
  [keys: string]: DocumentReference[];
};
