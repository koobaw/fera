import { Request } from 'express';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { CommonService } from '@cainz-next-gen/common';
import {
  TONAKAINEWERPOSTS_COLLECTION_NAME,
  TonakaiNewerPost,
} from '@cainz-next-gen/types';
import { ConfigService } from '@nestjs/config';
import {
  ArticleGetParamsDto,
  sortByAllowedList,
} from './dto/article-get-params.dto';
import { ArticleService } from './article.service';
import { ArticleDto, GetArticleResponse } from './interface/article.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findArticles(
    @Req() req: Request,
    @Query() articleGetParams: ArticleGetParamsDto,
  ): Promise<GetArticleResponse> {
    // get from article from Firestore
    const collectionName = TONAKAINEWERPOSTS_COLLECTION_NAME;
    const articlesFromFirestore =
      await this.articleService.getAllDocumentFromFirestore<TonakaiNewerPost>(
        collectionName,
      );

    // check article in Firestore
    const periodMs = Number(this.env.get<string>('TTL_MS') ?? 0);
    const needGetArticleFromTonakai = this.articleService.isArticleExpired(
      articlesFromFirestore,
      periodMs,
    );
    let articles: ArticleDto[];
    if (
      needGetArticleFromTonakai ||
      articleGetParams.limit > articlesFromFirestore.length
    ) {
      // get article from tonakai and store to Firestore
      articles = await this.articleService.getArticlesFromTonakai(
        articleGetParams,
      );
      if (!articles) {
        throw new HttpException(
          {
            errorCode: ErrorCode.ARTICLE_NG_NOT_FOUND,
            message: ErrorMessage[ErrorCode.ARTICLE_NG_NOT_FOUND],
          },
          HttpStatus.NOT_FOUND,
        );
      }
      const operatorName = this.commonService.createFirestoreSystemName(
        req.originalUrl,
        req.method,
      );
      await this.articleService.saveToFirestore(
        articles,
        operatorName,
        collectionName,
      );
      // delete old article from Firestore
      const nonUpdatedFirestoreArticles =
        this.articleService.extractNonUpdatedFirestoreArticles(
          articlesFromFirestore,
          articles,
        );
      await this.articleService.batchDeleteArticle(
        nonUpdatedFirestoreArticles,
        collectionName,
      );
    } else {
      articles =
        this.articleService.convertToArticleResponseFromFirestoreArticleScheme(
          articlesFromFirestore,
        );
    }
    // sort by property and slice articles by limit
    let sortKey: keyof ArticleDto;
    switch (articleGetParams.order) {
      case sortByAllowedList[0]:
        sortKey = 'publishedAt';
        break;
      default:
        sortKey = 'publishedAt';
    }
    const slicedArticles = this.articleService.sortByPropertyAndSliceArray(
      articles,
      sortKey,
      articleGetParams.order,
      articleGetParams.limit,
    );
    return this.transformToResponse(slicedArticles);
  }

  /**
   * 成功時の共通responseを付与
   * @param articles
   * @returns
   */
  private transformToResponse(articles: ArticleDto[]): GetArticleResponse {
    const response: GetArticleResponse = {
      code: HttpStatus.OK,
      message: 'ok',
      data: articles,
    };
    return response;
  }
}
