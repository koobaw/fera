export enum ErrorCode {
  // Category Batch
  CATEGORY_NG_MULE_CATEGORY_API = 'CATEGORY_IMPORT_1000',
  CATEGORY_IMPORT_UNEXPECTED = 'CATEGORY_IMPORT_1001',
}

export const ErrorMessage = {
  // Category Batch
  [ErrorCode.CATEGORY_NG_MULE_CATEGORY_API]: 'mule category api error',
  [ErrorCode.CATEGORY_IMPORT_UNEXPECTED]: 'unexpected error',
};
