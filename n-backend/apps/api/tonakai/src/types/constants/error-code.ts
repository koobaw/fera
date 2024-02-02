export enum ErrorCode {
  // Tonakai API
  ARTICLE_GET_TONAKAI_API = 'Article_1000',
  ARTICLE_GET_STORE_TO_DB = 'Article_1001',
  ARTICLE_NG_NOT_FOUND = 'Article_1002',
  ARTICLE_NG_TONAKAI_API = 'Article_1003',
  ARTICLE_NG_STORE_TO_DB = 'Article_1004',
  ARTICLE_NG_GET_FROM_FIRESTORE = 'Article_1005',
  ARTICLE_NG_DELETE_FROM_FIRESTORE = 'Article_1006',
}

export const ErrorMessage = {
  // Tonakai API
  [ErrorCode.ARTICLE_GET_TONAKAI_API]: 'article api error',
  [ErrorCode.ARTICLE_GET_STORE_TO_DB]: 'failed to get article from db',
  [ErrorCode.ARTICLE_NG_NOT_FOUND]: 'data not found',
  [ErrorCode.ARTICLE_NG_TONAKAI_API]: 'tonakai api error',
  [ErrorCode.ARTICLE_NG_STORE_TO_DB]: 'failed to store article to db',
  [ErrorCode.ARTICLE_NG_GET_FROM_FIRESTORE]: 'failed to get from firestore',
  [ErrorCode.ARTICLE_NG_DELETE_FROM_FIRESTORE]:
    'failed to delete from firestore',
};
