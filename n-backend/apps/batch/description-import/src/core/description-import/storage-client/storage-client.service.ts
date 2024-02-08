import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@cainz-next-gen/common';
import { Inject, Injectable } from '@nestjs/common';

import { LoggingService } from '@cainz-next-gen/logging';
import { Readable } from 'stream';

import * as fs from 'fs';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class StorageClientService {
  private readonly dataBucketName: string;

  private readonly archiveBucketName: string;

  private readonly TEMP_DIRECTORY = '/tmp';

  constructor(
    @Inject('Storage') private storage: Storage,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {
    this.dataBucketName = this.env.get<string>('DESCRIPTION_DATA_BUCKET_NAME');
    this.archiveBucketName = this.env.get<string>(
      'DESCRIPTION_ARCHIVE_BUCKET_NAME',
    );
  }

  async getFileNameList() {
    try {
      const bucket = this.storage.bucket(this.dataBucketName);
      const [files] = await bucket.getFiles();
      return files.map((file) => file.name);
    } catch (e: unknown) {
      this.commonService.logException(`get data file list is failed`, e);
      throw new Error(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_STORAGE],
      );
    }
  }

  async getFile(fileName: string) {
    const bucket = this.storage.bucket(this.dataBucketName);
    const fileStream = bucket.file(fileName).createReadStream();
    await this.streamFileDownload(fileName, fileStream);
  }

  async streamFileDownload(fileName: string, fileStream: Readable) {
    const destFileName = `${this.TEMP_DIRECTORY}/${fileName}`;
    return new Promise((resolve) => {
      try {
        fileStream.pipe(fs.createWriteStream(destFileName)).on('finish', () => {
          // The file download is complete
          this.logger.debug(
            `gs://${this.dataBucketName}/${fileName} downloaded to ${destFileName}.`,
          );
          resolve('finish');
        });
      } catch (error) {
        this.commonService.logException(
          `download file: ${fileName} is failed.`,
          error,
        );
        throw new Error(
          ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_DOWNLOAD],
        );
      }
    });
  }

  async moveToArchive(fileName: string, isError = false) {
    try {
      let destFileName = fileName;
      if (isError) {
        // エラーである場合はファイル名を[ファイル名].errorに変更
        destFileName = `${destFileName}.error`;
      }
      const archiveFile = this.storage
        .bucket(this.archiveBucketName)
        .file(destFileName);
      await this.storage
        .bucket(this.dataBucketName)
        .file(fileName)
        .move(archiveFile);
    } catch (error) {
      this.commonService.logException(
        `move to archive file: ${fileName} is failed.`,
        error,
      );
      throw new Error(
        ErrorMessage[ErrorCode.PRODUCT_EXTEND_DESCRIPTION_IMPORT_ARCHIVE],
      );
    }
  }
}
