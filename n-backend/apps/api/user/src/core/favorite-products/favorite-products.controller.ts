import {
  Headers,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { MemberAuthGuard } from '@fera-next-gen/guard';
import { Claims } from '@fera-next-gen/types';
import { CommonService } from '@fera-next-gen/common';
import { LoggingService } from '@fera-next-gen/logging';

import { ConfigService } from '@nestjs/config';
import { GetFavoriteProductsQueryDto } from './dto/get.favorite-products-query.dto';
import { DeleteFavoriteProductsParamDto } from './dto/delete.favorite-products-param.dto';
import { MuleFavoriteProductReadResponseSuccess } from './interfaces/favorite-products-mule-api.interface';
import {
  FavoriteProductsAvailabilityResponseObject,
  FavoriteProductsResponseObject,
} from './interfaces/favorite-products.interface';
import { RegisterFavoriteProductsParamDto } from './dto/register.favorite-products-param.dto';
import { ReadFavoriteProductsService } from './read.favorite-products/read.favorite-products.service';
import { RegisterFavoriteProductsService } from './register.favorite-products/register.favorite-products.service';

import { DeleteFavoriteProductsService } from './delete.favorite-products/delete.favorite-products.service';
import { GetFavoriteProductsAvailabilityQueryDto } from './dto/get.favorite-products-availability-query.dto';
import { CommonFavoriteProductsService } from './common.favorite-products.service';

@Controller('member/favorites/products')
export class FavoriteProductsController {
  constructor(
    private readonly readFavoriteProductService: ReadFavoriteProductsService,
    private readonly deleteFavoriteProduct: DeleteFavoriteProductsService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly registerFavoriteProductsService: RegisterFavoriteProductsService,
    private readonly commonFavoriteProductsService: CommonFavoriteProductsService,
  ) {}

  @Get('/')
  @UseGuards(MemberAuthGuard)
  public async getFavoriteProducts(
    @Req() req: Request & { claims?: Claims },
    @Query() getFavoriteProductsQueryDto: GetFavoriteProductsQueryDto,
    @Headers('Authorization') bearerHeader: string,
  ) {
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');
    const memberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    // favorite productをTTlで判断してfirestoreもしくはmuleから取得
    const productIds =
      await this.readFavoriteProductService.getFavoriteProductIds(
        encryptedMemberId,
        memberId,
        req.url,
        req.method,
        getFavoriteProductsQueryDto.save,
      );
    // productsに関するデータ(price付き)をBFF ServiceのProductsから取得。
    // TODO: 2023.11.16現在の実装ではどこの店舗の金額なのかの仕様が確定していないので一旦はweb store価格で取得している。
    // 会員rankも既存ではfirestore内のuser情報にないため固定で入れている
    let productsWithPrice: FavoriteProductsResponseObject[];
    if (productIds.length > 0) {
      productsWithPrice =
        await this.readFavoriteProductService.fetchProductWithPrice(
          productIds,
          '888',
          '4',
          bearerHeader.split(' ')[1],
        );
    } else {
      productsWithPrice = [];
    }
    // responseを返す
    // TODO: Mule側の実装が完了したら、`convertToFavoriteProductsResponse`を利用して、`limit`と`offset`による制御を実装する
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: productsWithPrice,
    };
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(MemberAuthGuard)
  public async registerFavoriteProducts(
    @Req() req: Request & { claims?: Claims },
    @Body() registerFavoriteProductsParamDto: RegisterFavoriteProductsParamDto,
    @Headers('x-correlation-id') correlationId: string,
  ) {
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;

    const targetFavoriteDoc =
      await this.registerFavoriteProductsService.getTargetFavoriteDoc(
        registerFavoriteProductsParamDto.mylistId,
        encryptedMemberId,
      );

    const operatorName = this.commonService.createFirestoreSystemName(
      req.url,
      req.method,
    );

    await this.registerFavoriteProductsService.saveToFirestore(
      targetFavoriteDoc,
      registerFavoriteProductsParamDto.productId,
      operatorName,
    );

    await this.registerFavoriteProductsService.createFavoriteProductTaskToRegister(
      encryptedMemberId,
      targetFavoriteDoc.id,
      registerFavoriteProductsParamDto.mylistId,
      registerFavoriteProductsParamDto.productId,
      correlationId,
    );

    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }

  @Delete('/')
  @UseGuards(MemberAuthGuard)
  public async deleteFavoriteProducts(
    @Headers('x-correlation-id') correlationId: string,
    @Req() req: Request & { claims?: Claims },
    @Query() deleteFavoriteProductsParamDto: DeleteFavoriteProductsParamDto,
  ) {
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;
    const { productIds } = deleteFavoriteProductsParamDto;
    let { mylistId } = deleteFavoriteProductsParamDto;

    if (typeof mylistId === 'undefined') {
      // mylistIdがパラメータで指定されなかった場合は規定のmylistIdを取得
      const favoritesDocSnap =
        await this.commonFavoriteProductsService.getFavoritesDocSnapByUser(
          encryptedMemberId,
        );
      if (!favoritesDocSnap || !favoritesDocSnap.exists) {
        this.logger.warn(`default mylist is not exists`);
        return {
          code: HttpStatus.OK,
          message: 'ok',
        };
      }
      mylistId = favoritesDocSnap.id;
    } else {
      const isExistsMylist = await this.deleteFavoriteProduct.existsMylist(
        encryptedMemberId,
        mylistId,
      );
      if (!isExistsMylist) {
        // パラメータで指定されたmylistIdが存在しない場合でも警告ログは出すがOKを返す。
        this.logger.warn(`mylistId:${mylistId} is not exists`);
        return {
          code: HttpStatus.OK,
          message: 'ok',
        };
      }
    }

    const targetDocs = await this.deleteFavoriteProduct.getDeleteTargetDocs(
      encryptedMemberId,
      mylistId,
      productIds,
    );

    await this.deleteFavoriteProduct.deleteFromFirestore(targetDocs);

    await this.deleteFavoriteProduct.pushToTaskQueue(targetDocs, correlationId);

    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }

  // TODO: Mule側の実装が完了していないためoffset/limitによる制御は保留としている
  private async convertToFavoriteProductsResponse(
    favoriteProducts: MuleFavoriteProductReadResponseSuccess[],
    getFavoriteProductsQueryDto: GetFavoriteProductsQueryDto,
  ): Promise<FavoriteProductsResponseObject[]> {
    const ordered = favoriteProducts.sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );

    const limit = getFavoriteProductsQueryDto.limit ?? ordered.length;

    const limited = ordered.slice(
      getFavoriteProductsQueryDto.offset,
      getFavoriteProductsQueryDto.offset + limit,
    );

    const response = limited.map(
      (product): FavoriteProductsResponseObject => ({
        productId: product.jan,
        name: product.name,
        price: 888,
        thumbnailUrl: 'https://example.com',
      }),
    );

    return response;
  }

  @Get('/availability/')
  @UseGuards(MemberAuthGuard)
  public async getFavoriteProductsAvailability(
    @Req() req: Request & { claims?: Claims },
    @Query()
    getFavoriteProductsAvailabilityQueryDto: GetFavoriteProductsAvailabilityQueryDto,
  ) {
    // favorite productをTTlで判断してfirestoreもしくはmuleから取得
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');
    const memberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    const saveToFirestore = true;
    const favoriteProductIds =
      await this.readFavoriteProductService.getFavoriteProductIds(
        encryptedMemberId,
        memberId,
        req.url,
        req.method,
        saveToFirestore,
      );
    // 取得したfavorite productからresponseを生成して返す
    return {
      code: HttpStatus.OK,
      message: 'ok',
      data: getFavoriteProductsAvailabilityQueryDto.productIds.split(',').map(
        (id) =>
          ({
            productId: id,
            isRegistered: !!favoriteProductIds.find(
              (productId) => productId === id,
            ),
          } as FavoriteProductsAvailabilityResponseObject),
      ),
    };
  }
}
