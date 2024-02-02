import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CATEGORIES_COLLECTION_NAME, Category } from '@cainz-next-gen/types';

import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import {
  CategoryResponse,
  ChildCategoryResponse,
} from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  private readonly MAX_LEVEL = 3;

  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly commonService: CommonService,
  ) {}

  public async getCategories(): Promise<CategoryResponse[]> {
    try {
      const categories = await this.getCategoryForFirestore();

      return this.transformToCategories(categories);
    } catch (e: unknown) {
      this.commonService.logException(
        `Save to firestore/${CATEGORIES_COLLECTION_NAME} is failed`,
        e,
      );
      throw new HttpException(
        {
          errorCode: ErrorCode.CATEGORY_NG_FIRESTORE,
          message: ErrorMessage[ErrorCode.CATEGORY_NG_FIRESTORE],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * firestoreからカテゴリを取得
   */
  private async getCategoryForFirestore(): Promise<Category[]> {
    this.logger.debug('start accessing to firestore');

    const collection = this.firestoreBatchService.findCollection(
      CATEGORIES_COLLECTION_NAME,
    );
    const querySnapshot = await collection
      .where('level', '<=', this.MAX_LEVEL)
      .get();
    const categories = querySnapshot.empty
      ? []
      : querySnapshot.docs.map((doc) => doc.data() as Category);

    this.logger.debug('end accessing to firestore');

    return categories;
  }

  /**
   * レスポンスに合わせて整形
   */
  private transformToCategories(categories: Category[]): CategoryResponse[] {
    return categories
      .filter((category) => category.parentCategoryCode === 'root')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((category) => ({
        code: category.code,
        name: category.name,
        description: category.description,
        thumbnailUrl: category.thumbnailUrl,
        displayOrder: category.displayOrder,
        level: category.level,
        parentCategoryCode: category.parentCategoryCode,
        childCategories: this.transformToChildCategories(
          categories,
          category.childCategories,
        ),
      }));
  }

  /**
   * レスポンスに合わせて整形(子カテゴリ)
   */
  private transformToChildCategories(
    categories: Category[],
    childCategories: ChildCategoryResponse[],
  ): ChildCategoryResponse[] | null {
    const childCategory = categories
      .filter((category) =>
        childCategories?.some((child) => category.code === child.code),
      )
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return childCategory.length === 0
      ? null
      : childCategory.map((child) => ({
          code: child.code,
          name: child.name,
          displayOrder: child.displayOrder,
          childCategories: this.transformToChildCategories(
            categories,
            child.childCategories,
          ),
        }));
  }
}
