import { Auditable } from './common/auditable';

export const MIGRATIONS_COLLECTION_NAME = 'migrations';

export interface Migration extends Auditable {
  legacyUserId: string;
  migrated: boolean;
}

export type UpdateMigrated = Pick<
  Migration,
  'migrated' | 'updatedAt' | 'updatedBy'
>;
export type MigrateTarget = Pick<Migration, 'legacyUserId' | 'migrated'>;
