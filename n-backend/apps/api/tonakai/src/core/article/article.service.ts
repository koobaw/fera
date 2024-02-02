/* eslint-disable no-underscore-dangle */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CommonService } from '@cainz-next-gen/common';
import firestore, {
  DocumentReference,
  Timestamp,
} from '@google-cloud/firestore';
import { TonakaiArticle, TonakaiNewerPost } from '@cainz-next-gen/types';
import { RawArticlesResponse } from './interface/tonakai.interface';
import { ArticleDto } from './interface/article.interface';
import {
  ArticleGetParamsDto,
  OrderAllowedValue,
} from './dto/article-get-params.dto';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class ArticleService {
  constructor(
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly httpService: HttpService,
    private readonly commonService: CommonService,
    private readonly firestoreBatchService: FirestoreBatchService,
  ) {}

  /**
   * 指定したcollectionが持つ全てdocumentを取得
   * @param collectionName 取得したいcollection名
   * @returns Tで指定した型のdocumentのリスト
   */
  async getAllDocumentFromFirestore<T>(collectionName: string): Promise<T[]> {
    this.logger.debug('start getAllDocumentFromFirestore(Article)');
    try {
      const articleCollection =
        this.firestoreBatchService.findCollection(collectionName);
      const snapshot = await articleCollection.get();
      const articles: T[] = [];
      snapshot?.forEach((doc) => articles.push(doc.data() as T));
      this.logger.debug('end getAllDocumentFromFirestore(Article)');
      return articles;
    } catch (e) {
      this.commonService.logException('get from firestore is failed', e);
      throw new HttpException(
        {
          errorCode: ErrorCode.ARTICLE_NG_GET_FROM_FIRESTORE,
          message: ErrorMessage[ErrorCode.ARTICLE_NG_GET_FROM_FIRESTORE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * となカイから検索条件に基づいて記事情報を取得
   * @param searchParams
   * @returns 記事情報の配列
   */
  async getArticlesFromTonakai(
    searchParams: ArticleGetParamsDto,
  ): Promise<ArticleDto[]> {
    this.logger.debug('start get article from tonakai');
    // define parameters
    const params = {
      size: searchParams.limit,
      sort: `sort_${searchParams.sortBy}:${searchParams.order}`,
      _source: 'id,title,image.url,sort_date,release_date,client_post',
    };
    const url = this.env.get<string>('TONARINO_CAINZ_API');

    // get data from tonakai
    const { data } = await firstValueFrom(
      this.httpService.get<RawArticlesResponse>(url, { params }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException('Tonakai API occurred Error', error);
          throw new HttpException(
            {
              errorCode: ErrorCode.ARTICLE_NG_TONAKAI_API,
              message: ErrorMessage[ErrorCode.ARTICLE_NG_TONAKAI_API],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );

    // convert to service's response from raw data
    const response: ArticleDto[] = data.hits.hits.map(
      (article) =>
        ({
          id: String(article._source.id),
          title: article._source.title,
          imageUrl: article._source.image.url,
          publishedAt: this.convertRowPublishedAtToDate(
            article._source.release_date,
          ),
          articleUrl: `${this.env.get<string>('MAGAZINE_CAINZ_URL')}/${
            article._source.id
          }`,
        } as ArticleDto),
    );
    this.logger.debug('end get article from tonakai');
    return response;
  }

  /**
   * Firestoreに指定したcollection名で記事情報を保存する
   * @param articles
   * @param operatorName
   * @param collectionName
   */
  async saveToFirestore(
    articles: ArticleDto[],
    operatorName: string,
    collectionName: string,
  ) {
    this.logger.debug('start saveToFirestore(article)');

    try {
      const articleCollection =
        this.firestoreBatchService.findCollection(collectionName);

      await Promise.all(
        articles.map(async (article: ArticleDto) => {
          const hashedArticleId = this.commonService.createMd5(
            article.id.toString(),
          );
          const articleDocRef = articleCollection.doc(hashedArticleId);
          await this.batchSetArticle(
            articleDocRef,
            article,
            operatorName,
            collectionName,
          );
        }),
      );
      await this.firestoreBatchService.batchCommit();
      this.logger.debug('end saveToFirestore(article)');
    } catch (e) {
      this.commonService.logException(`Save to firestore is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.ARTICLE_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.ARTICLE_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 記事情報をfirestoreBatchServiceにセットする
   * @param articleDocRef
   * @param article
   * @param operatorName
   * @param collectionName
   */
  private async batchSetArticle(
    articleDocRef: DocumentReference,
    article: ArticleDto,
    operatorName: string,
    collectionName: string,
  ) {
    this.logger.debug('start batchSetArticle');
    try {
      const oldArticle = await articleDocRef.get();
      let saveArticleData: TonakaiNewerPost;

      if (oldArticle.exists) {
        saveArticleData = {
          id: article.id,
          title: article.title,
          publishedAt: Timestamp.fromDate(article.publishedAt),
          thumbnailUrl: article.imageUrl,
          articleUrl: `${this.env.get<string>('MAGAZINE_CAINZ_URL')}/${
            article.id
          }`,
          createdBy: oldArticle.data()?.createdBy,
          createdAt: oldArticle.data()?.createdAt,
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      } else {
        saveArticleData = {
          id: article.id,
          title: article.title,
          publishedAt: Timestamp.fromDate(article.publishedAt),
          thumbnailUrl: article.imageUrl,
          articleUrl: `${this.env.get<string>('MAGAZINE_CAINZ_URL')}/${
            article.id
          }`,
          createdBy: operatorName,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: operatorName,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      }

      await this.firestoreBatchService.batchSet(
        articleDocRef,
        saveArticleData,
        { merge: true },
      );
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${collectionName} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.ARTICLE_NG_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.ARTICLE_NG_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Firestoreから指定した記事情報をまとめて削除する
   * @param articlesFromFirestore
   * @param collectionName
   */
  async batchDeleteArticle(
    articlesFromFirestore: TonakaiArticle[],
    collectionName: string,
  ) {
    this.logger.debug('start batchDeleteArticle');

    try {
      const articleCollection =
        this.firestoreBatchService.findCollection(collectionName);
      await Promise.all(
        articlesFromFirestore.map(
          async (articleFromFirestore: TonakaiArticle) => {
            const hashedArticleId = this.commonService.createMd5(
              articleFromFirestore.id,
            );
            const articleDocRef = articleCollection.doc(hashedArticleId);
            await this.firestoreBatchService.batchDelete(articleDocRef);
          },
        ),
      );
      await this.firestoreBatchService.batchCommit();
      this.logger.debug('end batchDeleteArticle');
    } catch (e) {
      this.commonService.logException(`delete from firestore is failed`, e);
      throw new HttpException(
        {
          errorCode: ErrorCode.ARTICLE_NG_DELETE_FROM_FIRESTORE,
          message: ErrorMessage[ErrorCode.ARTICLE_NG_DELETE_FROM_FIRESTORE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 期限以内の記事情報かチェックする。trueだと期限切れを表す
   * @param articles
   * @param period_ms
   * @returns
   */
  isArticleExpired(
    articlesFromFirestore: TonakaiNewerPost[],
    period_ms: number,
  ) {
    const nowMs = new Date().getTime();
    let isExpired = false;
    if (articlesFromFirestore.length > 0) {
      for (let i = 0; i < articlesFromFirestore.length; i++) {
        const castTimestamp = articlesFromFirestore[i].updatedAt as Timestamp;
        const deadLineMs = new Date(
          castTimestamp.toMillis() + period_ms,
        ).getTime();
        if (nowMs >= deadLineMs) {
          isExpired = true;
          break;
        }
      }
    } else {
      isExpired = true;
    }
    return isExpired;
  }

  /**
   * firestoreで保存されている型からAPI responseの型に変換
   * @param articlesFromFirestore firestoreのschema定義の型の記事リスト
   * @returns となカイAPIのresponseに変換した記事リスト
   */
  convertToArticleResponseFromFirestoreArticleScheme(
    articlesFromFirestore: TonakaiNewerPost[],
  ): ArticleDto[] {
    const articles: ArticleDto[] = articlesFromFirestore.map(
      (articleFromFirestore) =>
        ({
          id: articleFromFirestore.id,
          title: articleFromFirestore.title,
          imageUrl: articleFromFirestore.thumbnailUrl,
          publishedAt: articleFromFirestore.publishedAt.toDate(),
          articleUrl: articleFromFirestore.articleUrl,
        } as ArticleDto),
    );
    return articles;
  }

  /**
   * 登録前の値と登録した値を比較して更新しなかった記事情報を抽出する
   * @param articlesFromFirestore Firestoreから取得した値
   * @param articles となカイから取得してFirestoreに登録した値
   * @returns
   */
  extractNonUpdatedFirestoreArticles(
    articlesFromFirestore: TonakaiArticle[],
    articles: ArticleDto[],
  ): TonakaiArticle[] {
    const nonUpdatedFirestoreArticles = articlesFromFirestore.filter(
      (articleFromFirestore) =>
        !articles.find((article) => articleFromFirestore.id === article.id),
    );
    return nonUpdatedFirestoreArticles;
  }

  /**
   * となカイから取得したyyyy.mm.dd形式のデータをUTC時間のDate型に変換する
   * @param releaseDate
   * @returns
   */
  private convertRowPublishedAtToDate(releaseDate: string): Date {
    const timeElementArray = releaseDate.split('.').map((e) => parseInt(e, 10));
    return new Date(
      Date.UTC(
        timeElementArray[0],
        timeElementArray[1] - 1,
        timeElementArray[2],
      ),
    );
  }

  /**
   * 配列を指定したプロパティで並びかえて、limit分で切り取る
   * @param array 並びかえて、limitの数分に切り取りたい配列
   * @param key arrayの要素のどれか
   * @param order ascもしくはdesc
   * @param limit 切り取る長さ
   * @returns 並びかえてlimit分で切り取った配列
   */
  sortByPropertyAndSliceArray<T>(
    array: T[],
    key: keyof T,
    order: OrderAllowedValue,
    limit: number,
  ): T[] {
    const sortOrder = order === 'asc' ? 1 : -1;
    return array
      .slice()
      .sort((a, b) => {
        if (a[key] === b[key]) {
          return 0;
        }
        return sortOrder * (a[key] > b[key] ? 1 : -1);
      })
      .slice(0, limit);
  }
}
