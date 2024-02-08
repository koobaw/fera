export enum ErrorCode {
  // IntervalExecution Batch
  INTERVAL_EXECUTION_UNEXPECTED = 'INTERVAL_EXECUTION_1000',
  INTERVAL_EXECUTION_CONNECT_LEGACY_DB = 'INTERVAL_EXECUTION_1001',
  INTERVAL_EXECUTION_STORE_TO_DB = 'INTERVAL_EXECUTION_1002',
}

export const ErrorMessage = {
  // IntervalExecution Batch
  [ErrorCode.INTERVAL_EXECUTION_UNEXPECTED]: 'unexpected error',
  [ErrorCode.INTERVAL_EXECUTION_CONNECT_LEGACY_DB]:
    'failed to connect legacy db',
  [ErrorCode.INTERVAL_EXECUTION_STORE_TO_DB]: 'failed to store flyers to db',
};
