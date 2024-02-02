export enum ErrorCode {
  // Flyer Batch
  FLYER_IMPORT_UNEXPECTED = 'FLYER_IMPORT_1000',
  FLYER_IMPORT_CONNECT_LEGACY_DB = 'FLYER_IMPORT_1001',
  FLYER_IMPORT_STORE_TO_DB = 'FLYER_IMPORT_1002',
}

export const ErrorMessage = {
  // Flyer Batch
  [ErrorCode.FLYER_IMPORT_UNEXPECTED]: 'unexpected error',
  [ErrorCode.FLYER_IMPORT_CONNECT_LEGACY_DB]: 'failed to connect legacy db',
  [ErrorCode.FLYER_IMPORT_STORE_TO_DB]: 'failed to store flyers to db',
};
