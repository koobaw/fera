import * as admin from 'firebase-admin';
import { DocumentReference } from '@google-cloud/firestore';
import { Auditable } from './common/auditable';

export const STORES_FLYERS_COLLECTION_NAME = 'flyers';

export interface StoreFlyer extends Auditable {
  flyerRefIds: DocumentReference<admin.firestore.DocumentData>[];
}
