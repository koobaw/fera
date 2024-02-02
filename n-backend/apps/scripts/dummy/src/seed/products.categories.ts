import { Category } from '@cainz-next-gen/types';

import { addCollectionData } from '../dummyGenerator';
import { makeAuditableFields } from './common/auditable';
import { FirestoreStructure } from '../types';

const categories: Category[] = [
  {
    code: '23',
    name: '洗濯用品・ハンガー',
    description:
      '洗濯用品・ハンガーのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl:
      'https://www.cainz.com/on/demandware.static/-/Sites-site-catalog-cainz-ec/default/dwfeb154c8/ecCategory/category_nav_t10_3.jpg',
    displayOrder: 1,
    level: 1,
    parentCategoryCode: null,
    childCategories: [
      { code: '2310', name: '洗濯ハンガー', displayOrder: 1 },
      { code: '2312', name: '衣類ハンガー', displayOrder: 2 },
    ],
    ...makeAuditableFields(),
  },
  {
    code: '2310',
    name: '洗濯ハンガー',
    description:
      '洗濯ハンガーのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 1,
    level: 2,
    parentCategoryCode: '23',
    childCategories: [
      { code: '231010', name: '洗濯物ハンガー', displayOrder: 1 },
      { code: '231012', name: 'ドライハンガー', displayOrder: 2 },
    ],
    ...makeAuditableFields(),
  },
  {
    code: '2312',
    name: '衣類ハンガー',
    description:
      '衣類ハンガーのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 2,
    level: 2,
    parentCategoryCode: '23',
    childCategories: null,
    ...makeAuditableFields(),
  },
  {
    code: '231010',
    name: '洗濯物ハンガー',
    description:
      '洗濯物ハンガーのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 1,
    level: 3,
    parentCategoryCode: '2310',
    childCategories: null,
    ...makeAuditableFields(),
  },
  {
    code: '231012',
    name: 'ドライハンガー',
    description:
      'ドライハンガーのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 2,
    level: 3,
    parentCategoryCode: '2310',
    childCategories: null,
    ...makeAuditableFields(),
  },
  {
    code: '27',
    name: 'キッチン用品・キッチン雑貨・食器',
    description:
      'キッチン用品・キッチン雑貨・食器のカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl:
      'https://www.cainz.com/on/demandware.static/-/Sites-site-catalog-cainz-ec/default/dw68ea1511/ecCategory/category_nav_t10_1.jpg',
    displayOrder: 2,
    level: 1,
    parentCategoryCode: null,
    childCategories: [
      { code: '2710', name: '鍋・フライパン・やかん', displayOrder: 1 },
    ],
    ...makeAuditableFields(),
  },
  {
    code: '2710',
    name: '鍋・フライパン・やかん',
    description:
      '鍋・フライパン・やかんのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 1,
    level: 2,
    parentCategoryCode: '27',
    childCategories: [{ code: '271010', name: 'フライパン', displayOrder: 1 }],
    ...makeAuditableFields(),
  },
  {
    code: '271010',
    name: 'フライパン',
    description:
      'フライパンのカインズオリジナル商品やアイデア商品など、くらしに役立つ商品を豊富に品揃え。人気カテゴリや各特集ページなどから簡単にお選びいただけます。',
    thumbnailUrl: null,
    displayOrder: 1,
    level: 3,
    parentCategoryCode: '2710',
    childCategories: null,
    ...makeAuditableFields(),
  },
];

const productCategoriesStructure: FirestoreStructure = {
  collectionName: 'categories',
  documents: categories.map((category) => ({
    documentName: category.code,
    data: category,
  })),
};

export const addProductCategoriesData = async () => {
  await addCollectionData(productCategoriesStructure);
};
