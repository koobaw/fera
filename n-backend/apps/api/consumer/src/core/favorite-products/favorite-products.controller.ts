import { AuthGuard } from '@fera-next-gen/guard';
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoggingService } from '@fera-next-gen/logging';
import { DeleteFavoriteProductsService } from './delete.favorite-products/delete.favorite-products.service';
import { DeleteFavoriteProductsQueryDto } from './dto/delete.favorite-products-query.dto';
import { RegisterFavoriteProductsBodyDto } from './dto/register.favorite-products-body.dto';
import { RegisterFavoriteProductsService } from './register.favorite-products/register.favorite-products.service';

@Controller('favorites/products/')
export class FavoriteProductsController {
  constructor(
    private readonly registerFavoriteProductsService: RegisterFavoriteProductsService,
    private readonly deleteFavoriteProductsService: DeleteFavoriteProductsService,
    private readonly logger: LoggingService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  public async registerFavoriteProducts(
    @Body() requestBody: RegisterFavoriteProductsBodyDto,
  ) {
    const targetFavoriteProductDoc =
      await this.registerFavoriteProductsService.getTargetFavoriteProductDoc(
        requestBody.encryptedMemberId,
        requestBody.productId,
        requestBody.targetFavoriteDocId,
      );

    if (targetFavoriteProductDoc.exists) {
      const id =
        await this.registerFavoriteProductsService.registerFavoriteProduct(
          requestBody.encryptedMemberId,
          requestBody.productId,
          requestBody.mylistId,
        );

      await this.registerFavoriteProductsService.updateFirestore(
        id,
        targetFavoriteProductDoc.ref,
      );
    } else {
      this.logger.warn(
        `${targetFavoriteProductDoc.ref.path} : targetFavoriteProductDoc is not exists.`,
      );
    }

    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }

  @Delete()
  @UseGuards(AuthGuard)
  public async deleteFavoriteProducts(
    @Query() products: DeleteFavoriteProductsQueryDto,
  ) {
    const { objectIds, encryptedMemberId } = products;

    await this.deleteFavoriteProductsService.deleteFavoriteProducts(
      encryptedMemberId,
      ...objectIds,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }
}
