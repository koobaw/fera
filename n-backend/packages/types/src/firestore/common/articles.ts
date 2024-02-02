import { Timestamp } from '@google-cloud/firestore';
import { Auditable } from './auditable';

export interface Article extends Auditable {
  id: string;
  title: string;
  publishedAt: Timestamp;
  thumbnailUrl: string;
  articleUrl: string;
}

export type TonakaiArticle = Article;
