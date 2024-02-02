import dayjs from 'dayjs';
import { LoggingService } from '@cainz-next-gen/logging';
import { Injectable } from '@nestjs/common';
import {
  CATEGORIES_COLLECTION_NAME,
  Category,
  OmitTimestampCategory,
} from '@cainz-next-gen/types';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { CommonService } from '@cainz-next-gen/common';
import firestore, { CollectionReference } from '@google-cloud/firestore';
import { MuleCategoryResponse } from './interfaces/mule-api.interface';
import { CategoriesMuleApiService } from './category-mule-api/categories-mule-api.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class CategoryImportService {
  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly muleApi: CategoriesMuleApiService,
    private readonly commonService: CommonService,
  ) {}

  private readonly APP_NAME = 'category_import_batch';

  private readonly PUBLISHED = '1';

  async import() {
    this.logger.debug('start category import');

    const categories = await this.getCategories();
    await this.saveToFirestore(categories);

    this.logger.debug('end category import');
  }

  /**
   * カテゴリを取得
   */
  private async getCategories(): Promise<OmitTimestampCategory[]> {
    const categories = await this.recursiveFetch('root', []);
    return this.transformToFitFirestore(categories);
  }

  /**
   * 再帰的にカテゴリmuleAPIを呼び出す
   */
  private async recursiveFetch(
    codes: string,
    categories: MuleCategoryResponse[],
  ): Promise<MuleCategoryResponse[]> {
    const muleData = await this.muleApi.fetchCategories(codes);
    // カテゴリが公開されているものだけを取得
    const publishedCategories = muleData.filter(
      (category) => category.publishStatus === this.PUBLISHED,
    );

    categories.push(...publishedCategories);

    const childrenCodes = publishedCategories
      .flatMap((item) => item.children ?? [])
      .map((child) => child.categoryCode)
      .join(',');

    if (childrenCodes) {
      await this.recursiveFetch(childrenCodes, categories);
    }

    return categories;
  }

  /**
   * firestoreに保存する型に合うよう変形
   */
  private transformToFitFirestore(
    categories: MuleCategoryResponse[],
  ): OmitTimestampCategory[] {
    return categories.map((category) => {
      const childCategories =
        category.children?.map((child: MuleCategoryResponse) => ({
          code: child.categoryCode,
          name: child.categoryName,
          displayOrder: child.displayOrder,
        })) || null;

      return {
        code: category.categoryCode,
        name: category.categoryName,
        description: category.description,
        thumbnailUrl: category.imageUrl.portrait,
        displayOrder: category.displayOrder,
        level: category.level,
        parentCategoryCode: category.parentCategoryCode,
        childCategories,
      };
    });
  }

  /**
   * firestoreに保存
   */
  private async saveToFirestore(categories: OmitTimestampCategory[]) {
    this.logger.debug('start save to firestore');
    try {
      const categoryCollection = this.firestoreBatchService.findCollection(
        CATEGORIES_COLLECTION_NAME,
      );

      await Promise.all(
        categories.map(async (category) => {
          await this.batchSetCategory(categoryCollection, category);
        }),
      );
      await this.firestoreBatchService.batchCommit();

      await this.deleteToFirestore(categoryCollection);
      await this.firestoreBatchService.batchCommit();
      this.logger.debug('end save to firestore');
    } catch (e) {
      this.commonService.logException(`import  error. invalid time string`, e);
      throw new Error(ErrorMessage[ErrorCode.CATEGORY_IMPORT_UNEXPECTED]);
    }
  }

  private async batchSetCategory(
    categoryCollection: CollectionReference,
    category: OmitTimestampCategory,
  ) {
    this.logger.debug('start batchSetCategory');

    try {
      const docRef = categoryCollection.doc(category.code);
      const oldCategory = await docRef.get();
      const saveData: Category = (() => {
        if (oldCategory.exists) {
          return {
            ...category,
            createdBy: oldCategory.data()?.createdBy,
            createdAt: oldCategory.data()?.createdAt,
            updatedBy: this.APP_NAME,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          };
        }
        // 新規の場合
        return {
          ...category,
          createdBy: this.APP_NAME,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedBy: this.APP_NAME,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };
      })();

      await this.firestoreBatchService.batchSet(docRef, saveData, {
        merge: true,
      });
      this.logger.debug('end batchSetCategory');
    } catch (e) {
      this.commonService.logException(
        `Save to firestore/${CATEGORIES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.CATEGORY_IMPORT_UNEXPECTED]);
    }
  }

  /**
   * updatedAtがその日に更新されていないものを削除
   */
  private async deleteToFirestore(categoryCollection: CollectionReference) {
    this.logger.debug('start deleteToFirestore');
    try {
      const today = this.commonService.convertDateToJST(
        dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD'),
      );

      const outdatedCategories = await categoryCollection
        .where('updatedAt', '<', firestore.Timestamp.fromDate(new Date(today)))
        .select()
        .get();
      await Promise.all(
        outdatedCategories.docs.map(async (doc) => {
          await this.firestoreBatchService.batchDelete(doc.ref);
        }),
      );
    } catch (e) {
      this.commonService.logException(
        `delete to firestore/${CATEGORIES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.CATEGORY_IMPORT_UNEXPECTED]);
    }
    this.logger.debug('end deleteToFirestore');
  }
}
