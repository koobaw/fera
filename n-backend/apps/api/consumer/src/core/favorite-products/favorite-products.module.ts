import { Module } from '@nestjs/common';
import { DeleteFavoriteProductsService } from './delete.favorite-products/delete.favorite-products.service';
import { FavoriteProductsController } from './favorite-products.controller';
import { FavoriteProductsMuleApiService } from './favorite-products-mule-api/favorite-products-mule-api.service';
import { RegisterFavoriteProductsService } from './register.favorite-products/register.favorite-products.service';

@Module({
  providers: [
    RegisterFavoriteProductsService,
    DeleteFavoriteProductsService,
    FavoriteProductsMuleApiService,
  ],
  controllers: [FavoriteProductsController],
})
export class FavoriteProductsModule {}
