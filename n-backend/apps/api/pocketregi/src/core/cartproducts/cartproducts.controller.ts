import { Request } from 'express';
import {
  Controller,
  Req,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { Claims } from '@cainz-next-gen/types';
import { CommonService } from '@cainz-next-gen/common';
import {
  ProductAndPriceDetailRes,
  ProductDeleteRequest,
} from './interfaces/cartproducts.interface';
import { AddProductDetailService } from './add.cartproducts/add.cartproducts.service';
import { UpdateProductQuantityService } from './update.cartproducts/update.cartproducts.service';
import { DeleteProductService } from './delete.cartproducts/delete.cartproducts.service';
import {
  CartProductsDto,
  AddCartProductsDto,
  DeleteCartProductsDto,
  UpdateCartProductsDto,
} from './dto/cartproduct.dto';
import { CartProductsService } from './get.cartproducts/get.cartproducts.service';
import { TransformSavePipe } from '../../pipes/save.pipe';
import { GetMembershipRank } from '../../utils/membershipRank/membershiprank.utils';

@Controller('cart-products')
export class CartProductsController {
  private readonly MEMBER_SHIP_RANK = 'rank';

  constructor(
    private readonly cartProductsService: CartProductsService,
    private readonly getMembershipRankService: GetMembershipRank,
    private readonly addProductDetailService: AddProductDetailService,
    private readonly updateProductQuantityService: UpdateProductQuantityService,
    private readonly deleteProductService: DeleteProductService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * To get the product detail / 製品の詳細を取得するには
   * @param { Request } req containing bearerToken and user claims /
   * bearToken とユーザー クレームを含む
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @param { CartProductsDto } cartProductsDto containing the storeCode /
   * storeCodeを含む
   * @param { boolean } updateMembershipRank containing the boolean value true or false by default value is false /
   * ブール値 true または false が含まれます。デフォルト値は false です。
   * @returns response after saving details in firestore /
   *  Firestore に詳細を保存した後の応答
   */
  @Get()
  @UseGuards(AuthGuard)
  async getProductsInCart(
    @Req() req: Request & { claims?: Claims },
    @Query() cartProductsDto: CartProductsDto,
    @Query('updateMembershipRank', TransformSavePipe) updateMembershipRank,
  ) {
    const userClaim: Claims = req.claims;
    const { encryptedMemberId } = userClaim;
    const { storeCode } = cartProductsDto;
    let membershipRank: string;

    if (updateMembershipRank) {
      const bearerToken = req.headers.authorization;
      const { rank } = await this.getMembershipRankService.getMembershipRank(
        bearerToken,
        this.MEMBER_SHIP_RANK,
      );
      membershipRank = rank;
    } else {
      membershipRank = await this.cartProductsService.fetchMembershipRank(
        encryptedMemberId,
      );
    }

    const cartProductsAfterDiscountPrice =
      await this.cartProductsService.getDiscountedPriceForCartProducts(
        storeCode,
        encryptedMemberId,
        membershipRank,
      );

    const operatorName = this.commonService.createFirestoreSystemName(
      req.url,
      req.method,
    );
    const savedProductDetails = await this.cartProductsService.saveToFirestore(
      cartProductsAfterDiscountPrice,
      operatorName,
      encryptedMemberId,
    );

    const response = this.cartProductsService.getResponse(savedProductDetails);
    return response;
  }

  /**
   * To get the product detail / 製品の詳細を取得するには
   * @param { Request } req containing bearerToken and user claims /
   * bearToken とユーザー クレームを含む
   * @param { Body } productDetailReq containing the productId, storeCode /
   * productId、storeCodeを含む
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   *  @returns the Promise of the fetchProductDetail response / fetchProductDetail レスポンスの Promise
   */
  @Post()
  @UseGuards(AuthGuard)
  public async getProductDetail(
    @Req() req: Request & { claims?: Claims },
    @Body() productDetailReq: AddCartProductsDto,
  ) {
    const bearerToken = req.headers.authorization;

    const { claims } = req;

    const result: ProductAndPriceDetailRes =
      await this.addProductDetailService.fetchProductDetails(
        productDetailReq,
        bearerToken,
        claims,
      );

    return result;
  }

  /**
   * To update the product / 製品をアップデートするには
   * @param { Request } req containing bearerToken and user claims /
   * bearToken とユーザー クレームを含む
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @param { UpdateCartProductsDto } productIdQuery   containing the product id /
   * 製品IDを含む
   * @param { UpdateCartProductsDto } quantityQuery containing the storeCode /
   * ストアコードを含む
   * @returns the Promise of the updateCartProduct response / updateCartProduct レスポンスの Promise
   */
  @Patch()
  @UseGuards(AuthGuard)
  public async updateProductQuantity(
    @Req() req: Request & { claims?: Claims },
    @Query() productIdQuery: UpdateCartProductsDto,
    @Query() quantityQuery: UpdateCartProductsDto,
  ) {
    const { productId } = productIdQuery;
    const { quantity } = quantityQuery;

    const { claims } = req;

    const result = await this.updateProductQuantityService.updateCartProduct(
      productId,
      quantity,
      claims,
    );
    return result;
  }

  /**
   * To delete the product / 製品をアップデートするには
   *  @param { Request } req containing bearerToken and user claims /
   * bearToken とユーザー クレームを含む
   * @param claims Claims represents custom claims associated with a user /
   * クレームはユーザーに関連付けられたカスタム クレームを表します
   * @param { DeleteCartProductsDto } productIdQuery   containing the product id /
   * 製品IDを含む
   * @returns the Promise of the deleteProductService response / deleteProductService レスポンスの Promise
   */
  @Delete()
  @UseGuards(AuthGuard)
  public async deleteProduct(
    @Req() req: Request & { claims?: Claims },
    @Query() productIdQuery: DeleteCartProductsDto,
  ) {
    const { productId } = productIdQuery;
    const ProductRequest: ProductDeleteRequest = {
      productId,
    };

    const { claims } = req;

    const result = await this.deleteProductService.deleteCartProduct(
      ProductRequest,
      claims,
    );
    return result;
  }
}
