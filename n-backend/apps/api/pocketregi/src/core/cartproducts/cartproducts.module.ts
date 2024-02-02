import { Module } from '@nestjs/common';
import { CartProductsController } from './cartproducts.controller';
import { AddProductDetailService } from './add.cartproducts/add.cartproducts.service';
import { UpdateProductQuantityService } from './update.cartproducts/update.cartproducts.service';
import { DeleteProductService } from './delete.cartproducts/delete.cartproducts.service';
import { PocketRegiCartCommonService } from '../../utils/cartproducts.utils';
import { CartProductsService } from './get.cartproducts/get.cartproducts.service';
import { GetDiscountedPriceApiService } from './get.discountedPrice/get.discountedPrice.service';
import { GetMembershipRank } from '../../utils/membershipRank/membershiprank.utils';

@Module({
  controllers: [CartProductsController],
  providers: [
    AddProductDetailService,
    UpdateProductQuantityService,
    DeleteProductService,
    PocketRegiCartCommonService,
    CartProductsService,
    GetDiscountedPriceApiService,
    GetMembershipRank,
  ],
})
export class CartProductsModule {}
