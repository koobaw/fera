import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ProductInventory,
  PRODUCTS_COLLECTION_NAME,
  PRODUCTS_INVENTORIES_COLLECTION_NAME,
} from '@cainz-next-gen/types';
import firestore from '@google-cloud/firestore';

import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { FindInventoriesDto } from './dto/find.inventories.dto';
import { MuleProductInventoryResponseSuccess } from './interfaces/mule-api.interface';
import { InventoriesMuleApiService } from './inventories-mule-api/inventories-mule-api.service';
import { InventoryResponse } from './interfaces/inventory.interface';

@Injectable()
export class InventoriesService {
  constructor(
    private readonly logger: LoggingService,
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly muleApi: InventoriesMuleApiService,
    private readonly commonService: CommonService,
  ) {}

  /**
   * 在庫取得
   */
  public async fetchInventories(
    findInventoriesDto: FindInventoriesDto,
    coefficient: number,
  ): Promise<Array<InventoryResponse>> {
    const muleData = await this.muleApi.fetchInventories(
      findInventoriesDto,
      coefficient,
    );

    return this.transformToInventories(muleData);
  }

  /**
   * 在庫結果をfirestoreに保存
   */
  public async saveToFirestore(
    products: Array<InventoryResponse>,
    operatorName: string,
  ) {
    this.logger.debug('start saving to firestore');

    const productInventories: ProductInventory[] = products.map((product) => ({
      productId: product.productId,
      storeCode: product.storeCode,
      quantityOpening: product.quantityOpening,
      quantitySold: product.quantitySold,
      quantityAvailable: product.quantityAvailable,
      quantityAllocated: product.quantityAllocated,
      quantityExpected: product.quantityExpected,
      expectedArrivalDate: product.expectedArrivalDate
        ? firestore.Timestamp.fromDate(new Date(product.expectedArrivalDate))
        : null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdBy: operatorName,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      updatedBy: operatorName,
    }));

    try {
      await Promise.all(
        productInventories.map((productInventory) => {
          const inventoryCollection = this.firestoreBatchService
            .findCollection(PRODUCTS_COLLECTION_NAME)
            .doc(productInventory.productId.split('').reverse().join(''))
            .collection(PRODUCTS_INVENTORIES_COLLECTION_NAME);
          const docRef = inventoryCollection.doc(productInventory.storeCode);

          return this.firestoreBatchService.batchSet(docRef, productInventory, {
            merge: true,
          });
        }),
      );

      await this.firestoreBatchService.batchCommit();
    } catch (error) {
      this.commonService.logException('Save to firestore is failed', error);
      throw new HttpException(
        {
          errorCode: ErrorCode.INVENTORY_GET_STORE_TO_DB,
          message: ErrorMessage[ErrorCode.INVENTORY_GET_STORE_TO_DB],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.logger.debug('end saving to firestore');
  }

  private transformToInventories(
    data: Array<MuleProductInventoryResponseSuccess>,
  ): Array<InventoryResponse> {
    return data.map(
      (inventoryRes): InventoryResponse => ({
        productId: inventoryRes.productCode,
        storeCode: inventoryRes.storeCode,
        quantityOpening: inventoryRes.quantityOpening,
        quantitySold: inventoryRes.quantitySold,
        quantityAvailable: inventoryRes.quantityAvailable,
        quantityAllocated: inventoryRes.quantityAllocated,
        quantityExpected: inventoryRes.quantityExpected,
        ...(inventoryRes.expectedArrivalDate
          ? {
              expectedArrivalDate: this.commonService.convertDateToJST(
                inventoryRes.expectedArrivalDate,
              ),
            }
          : {}),
      }),
    );
  }
}
