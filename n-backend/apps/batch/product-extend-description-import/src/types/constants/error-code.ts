export enum ErrorCode {
  // product extend description import Batch
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_UNEXPECTED = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_1000',
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_CSV = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_1001',
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_TEMP_FILE = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_1002',
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_STORAGE = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_2000',
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_DOWNLOAD = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_2001',
  PRODUCT_EXTEND_DESCRIPTION_IMPORT_ARCHIVE = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_2002',
  PRODUCT_EXTEND_DESCRIPTION_STORE_TO_DB = 'PRODUCTS_EXTEND_DESCRIPTION_IMPORT_3000',
}

export const ErrorMessage = {
  // product extend description import Batch
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_UNEXPECTED]: 'unexpected error',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_CSV]:
    'csv file is invalid or broken',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_TEMP_FILE]:
    'delete temp file is failed',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_STORAGE]:
    'failed to connect storage',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_DOWNLOAD]:
    'csv file download is failed',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_ARCHIVE]:
    'move csv file to archive is failed',
  [ErrorCode.PRODUCT_EXTEND_DESCRIPTION_STORE_TO_DB]:
    'failed to store description to db',
};
