import * as admin from 'firebase-admin';

import { Auditable } from '@cainz-next-gen/types';

export const makeAuditableFields = (): Auditable => ({
  createdBy: 'this/is/dummy/path:GET',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedBy: 'this/is/dummy/path:GET',
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
});
