import { ErrorCode } from '../../../types/constants/error-code';

export interface ArticleDto {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: Date;
  articleUrl: string;
}

export interface GetArticleResponse {
  code: number;
  message: string;
  errorCode?: ErrorCode;
  requestId?: string;
  timestamp?: string;
  data: ArticleDto[];
}
