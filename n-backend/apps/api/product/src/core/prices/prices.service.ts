import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import {
  OmitTimestampPartialProductPrice,
  ProductPrice,
  PRODUCTS_COLLECTION_NAME,
  PRODUCTS_PRICES_COLLECTION_NAME,
} from '@fera-next-gen/types';
import firestore from '@google-cloud/firestore';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { FindPricesDto } from './dto/find.prices.dto';
import { MuleProductPriceSuccessResponse } from './interfaces/price.interface';
import { PricesMuleApiService } from './prices-mule-api/prices-mule-api.service';

@Injectable()
export class PricesService {
  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly muleApi: PricesMuleApiService,
    private readonly commonService: CommonService,
  ) {}

  public async fetchPrices(
    findPricesDto: FindPricesDto,
  ): Promise<OmitTimestampPartialProductPrice[]> {
    const muleProductPrices = await this.muleApi.fetchPrices(findPricesDto);
    return this.transformToProducts(muleProductPrices);
  }

  public async saveToFirestore(
    products: OmitTimestampPartialProductPrice[],
    operatorName: string,
  ) {
    this.logger.debug('start saving to firestore');
    const productPrices: ProductPrice[] = products.map((product) => ({
      productId: product.productId,
      storeCode: product.storeCode,
      membershipRank: product.membershipRank,
      priceIncludingTax: product.priceIncludingTax,
      salePriceIncludingTax: product.salePriceIncludingTax ?? null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdBy: operatorName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    }));

    try {
      await Promise.all(
        productPrices.map((productPrice) => {
          const priceCollection = this.firestoreBatchService
            .findCollection(PRODUCTS_COLLECTION_NAME)
            .doc(productPrice.productId.split('').reverse().join(''))
            .collection(PRODUCTS_PRICES_COLLECTION_NAME);
          const docRef = priceCollection.doc(
            `${productPrice.storeCode}_${productPrice.membershipRank}`,
          );
          return this.firestoreBatchService.batchSet(docRef, productPrice, {
            merge: true,
          });
        }),
      );

      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException('Save to firestore is failed', error);
      throw new HttpException(
        {
          errorCode: ErrorCode.PRICE_GET_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.PRICE_GET_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end saving to firestore');
  }

  private transformToProducts(
    products: MuleProductPriceSuccessResponse[],
  ): OmitTimestampPartialProductPrice[] {
    const transformed = products.map(
      (product): OmitTimestampPartialProductPrice => ({
        productId: product.productCode,
        storeCode: product.storeCode,
        membershipRank: product.membershipRank,
        priceIncludingTax: product.price,
        salePriceIncludingTax: product.salePrice ?? undefined,
      }),
    );

    // remove undefined properties
    return JSON.parse(JSON.stringify(transformed));
  }
}
