import { addPickupArticlesData } from './seed/pickupArticles';
import { addCampaignsData } from './seed/campaign';
import { addFeaturedSaleData } from './seed/featuredSale';
import { addPopularProductsData } from './seed/popularProducts';
import { addRecentHotSellersData } from './seed/recentHotSellers';
import { addRecommendedProducts10Data } from './seed/recommendedProducts10';

import { addStoresData } from './seed/stores';
import { addStoresDetailData } from './seed/stores.detail';
import { addSurgeInViewsData } from './seed/surgeInViews';
import { addTonakaiNewerPostsData } from './seed/tonakaiNewerPosts';
import { addTonakaiRankingData } from './seed/tonakaiRanking';
import { addStoresAnnouncementsData } from './seed/stores.announcements';
import { addFlyersData } from './seed/flyers';
import { addStoresFlyersData } from './seed/stores.flyers';
import { addProductCategoriesData } from './seed/products.categories';

/* eslint no-console: ["error", { allow: ["error","warn","log"] }] */
async function main() {
  console.log('start generating dummy');
  await Promise.all([
    addPickupArticlesData(),
    addCampaignsData(),
    addFeaturedSaleData(),
    addPopularProductsData(),
    addRecentHotSellersData(),
    addRecommendedProducts10Data(),
    addSurgeInViewsData(),
    addTonakaiNewerPostsData(),
    addTonakaiRankingData(),
    addProductCategoriesData(),
    (async () => {
      // SubCollection must execute before Collection
      try {
        await Promise.all([
          addStoresDetailData(),
          addFlyersData(),
          addStoresAnnouncementsData(),
        ]);
        await addStoresFlyersData();
        await addStoresData();
      } catch (error) {
        console.error(error);
      }
    })(),
  ]).catch(console.error);
  console.log('end generating dummy');
}

(async () => {
  await main();
})();
