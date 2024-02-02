import { Injectable } from '@nestjs/common';

import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { CommonService } from '@cainz-next-gen/common';

import { LoggingService } from '@cainz-next-gen/logging';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class StorageClientService {
  private readonly storage: Storage;

  private readonly IMAGE_URL_TOKEN_EXPIRE_INTERVAL_DAYS = 7;

  constructor(
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {
    this.storage = new Storage();
  }

  async generateSignedUrl(filepath: string) {
    const date = new Date();
    date.setDate(date.getDate() + this.IMAGE_URL_TOKEN_EXPIRE_INTERVAL_DAYS);
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'read',
      expires: date,
    };
    const bucketName = this.env.get<string>('FLYER_IMAGE_BUCKET_NAME');

    try {
      const file = await this.storage.bucket(bucketName).file(filepath);
      const [isExists] = await file.exists();
      let url;
      if (isExists) {
        [url] = await file.getSignedUrl(options);
      } else {
        url = null;
        this.logger.warn(`File is not exists. FilePath:${filepath}`);
      }

      return url;
    } catch (e: unknown) {
      this.commonService.logException(
        `get flyer images signed url is failed`,
        e,
      );
      throw new Error(ErrorMessage[ErrorCode.FLYER_IMPORT_UNEXPECTED]);
    }
  }
}
