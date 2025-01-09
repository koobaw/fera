import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@fera-next-gen/common';
import { FavoriteProductsMuleApiService } from '../favorite-products-mule-api/favorite-products-mule-api.service';

@Injectable()
export class DeleteFavoriteProductsService {
  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly muleApiService: FavoriteProductsMuleApiService,
  ) {}

  public async deleteFavoriteProducts(
    encryptedMemberId,
    ...objectIds: string[]
  ) {
    const key = this.env.get<string>('CRYPTO_KEY');
    const iv = this.env.get<string>('CRYPTO_IV');

    const decryptedMemberId = this.commonService.decryptAES256(
      encryptedMemberId,
      key,
      iv,
    );
    await this.muleApiService.deleteFavoriteProducts(
      decryptedMemberId,
      ...objectIds,
    );
  }
}
