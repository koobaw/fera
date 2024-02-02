import { LoggingService } from '@cainz-next-gen/logging';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import firestore from '@google-cloud/firestore';

import { Injectable } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';

import { parse } from 'csv-parse';
import { finished } from 'stream/promises';

import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as encode from 'encoding-japanese';

import {
  PRODUCTS_COLLECTION_NAME,
  PRODUCTS_EXTEND_DESCRIPTION_COLLECTION_NAME,
  ProductExtendDescription,
} from '@cainz-next-gen/types';
import { StorageClientService } from './storage-client/storage-client.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { ProductExtendDescriptionRead } from './interface/product-extend-description.interface';

@Injectable()
export class ProductExtendDescriptionImportService {
  private readonly APP_NAME = 'product_extend_description_import_batch';

  private readonly TEMP_DIRECTORY = '/tmp';

  private readonly ENCODE_TYPE = 'UTF8';

  constructor(
    private readonly firestoreBatchService: FirestoreBatchService,
    private readonly logger: LoggingService,
    private readonly storage: StorageClientService,
    private readonly commonService: CommonService,
  ) {}

  async import() {
    this.logger.debug('start import product extend description data.');
    const fileNameList = await this.storage.getFileNameList();

    await Promise.all(
      fileNameList.map(async (fileName) => this.parseFile(fileName)),
    );
    this.logger.debug('end import product extend description data.');
  }

  async parseFile(fileName: string) {
    this.logger.debug(`filename: ${fileName}`);
    const filenameCheckArray = fileName.split('.');
    const { length } = filenameCheckArray;
    if (length < 1) {
      this.logger.error('filename is invalid');
      this.storage.moveToArchive(fileName, true);
      return;
    }
    if (filenameCheckArray[length - 1] !== 'csv') {
      this.logger.error('file is not csv');
      this.storage.moveToArchive(fileName, true);
      return;
    }
    await this.storage.getFile(fileName);
    const tempFileName = `${this.TEMP_DIRECTORY}/${fileName}`;
    const fileEncoding = await this.detectEncoding(tempFileName);
    if (fileEncoding !== this.ENCODE_TYPE) {
      this.logger.error(
        `encode type must be '${this.ENCODE_TYPE}' but '${fileEncoding}'`,
      );
      this.storage.moveToArchive(fileName, true);
      return;
    }
    const errorFlag = await this.readCSV(tempFileName);
    await this.deleteTempFile(tempFileName);
    await this.storage.moveToArchive(fileName, errorFlag);
    this.logger.debug('parse finished.');
  }

  private async readCSV(fileName: string): Promise<boolean> {
    let errorFlag = false;
    const processFile = async () => {
      const records = [];
      const parser = fs
        .createReadStream(fileName)
        .pipe(iconv.decodeStream('utf-8'))
        .pipe(iconv.encodeStream('utf-8'))
        .pipe(
          parse({
            columns: true,
            skip_records_with_error: true,
          }),
        );
      parser.on('readable', () => {
        let record: ProductExtendDescriptionRead | null;
        while (record !== null) {
          record = parser.read();
          if (record !== null) {
            if (typeof record.ID === 'undefined') {
              this.logger.error(
                ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_CSV],
              );
              errorFlag = true;
            } else {
              records.push(record);
            }
          }
        }
      });
      parser.on('skip', (e) => {
        this.logger.error(e.message);
        errorFlag = true;
      });

      await finished(parser);
      return records;
    };
    const records = await processFile();
    if (records.length > 0 && errorFlag === false) {
      await this.saveToFirestore(records);
    }
    return errorFlag;
  }

  private async detectEncoding(fileName: string) {
    const buffer = fs.readFileSync(fileName);
    try {
      const enc = encode.detect(buffer);

      return enc;
    } catch (error) {
      // 処理を続行するため敢えてthrowしない
      this.commonService.logException('detect encode type is failed', error);
      this.logger.error(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_CSV],
      );
      return '';
    }
  }

  private async saveToFirestore(data: Array<ProductExtendDescriptionRead>) {
    this.logger.debug('start save to firestore');

    try {
      const productsCollection = this.firestoreBatchService.findCollection(
        PRODUCTS_COLLECTION_NAME,
      );

      await Promise.all(
        data.map(async (descriptionItem: ProductExtendDescriptionRead) => {
          const productsDocId = this.getProductsDocId(descriptionItem.ID);

          const descriptionDocRef = productsCollection
            .doc(productsDocId)
            .collection(PRODUCTS_EXTEND_DESCRIPTION_COLLECTION_NAME)
            .doc(descriptionItem.ID);
          const oldDescription = await descriptionDocRef.get();
          let extendDescription: ProductExtendDescription;
          if (oldDescription.exists) {
            // 更新の場合
            extendDescription = {
              content: descriptionItem.longDescription__default,
              createdBy: oldDescription.data()?.createdBy,
              createdAt: oldDescription.data()?.createdAt,
              updatedBy: this.APP_NAME,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            };
          } else {
            // 新規の場合
            extendDescription = {
              content: descriptionItem.longDescription__default,
              createdBy: this.APP_NAME,
              createdAt: firestore.FieldValue.serverTimestamp(),
              updatedBy: this.APP_NAME,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            };
          }
          await this.firestoreBatchService.batchSet(
            descriptionDocRef,
            extendDescription,
            {
              merge: true,
            },
          );
        }),
      );
      await this.firestoreBatchService.batchCommit();
    } catch (e) {
      this.commonService.logException(`import  error.`, e);
      throw new Error(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_STORE_TO_DB],
      );
    }

    this.logger.debug('end save to firestore');
  }

  private getProductsDocId(productId: string) {
    // productsのdocumentId(productIdの文字列を反転)を取得する
    try {
      const result = productId.split('').reverse().join('');
      return result;
    } catch (error) {
      this.commonService.logException(
        `invalid product id: ${productId}`,
        error,
      );
      throw error;
    }
  }

  private async deleteTempFile(tempFileName: string) {
    try {
      fs.unlinkSync(tempFileName);
      this.logger.debug(`temp file: ${tempFileName} is deleted.`);
    } catch (error) {
      this.commonService.logException(
        `delete temp file: ${tempFileName} is failed.`,
        error,
      );
      throw new Error(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_TEMP_FILE],
      );
    }
  }
}
