import { Module } from '@nestjs/common';
import { FavoriteProductsController } from './favorite-products.controller';
import { FavoritesMuleApiService } from './favorites-mule-api/favorites-mule-api.service';
import { FavoriteProductsMuleApiService } from './favorite-products-mule-api/favorite-products-mule-api.service';
import { ReadFavoriteProductsService } from './read.favorite-products/read.favorite-products.service';
import { RegisterFavoriteProductsService } from './register.favorite-products/register.favorite-products.service';
import { DeleteFavoriteProductsService } from './delete.favorite-products/delete.favorite-products.service';
import { CommonFavoriteProductsService } from './common.favorite-products.service';

@Module({
  providers: [
    ReadFavoriteProductsService,
    FavoriteProductsMuleApiService,
    CommonFavoriteProductsService,
    FavoritesMuleApiService,
    RegisterFavoriteProductsService,
    DeleteFavoriteProductsService,
  ],
  controllers: [FavoriteProductsController],
})
export class FavoriteProductsModule {}
