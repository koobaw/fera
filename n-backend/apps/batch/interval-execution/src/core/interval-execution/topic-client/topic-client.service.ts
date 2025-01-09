import { Injectable } from '@nestjs/common';

import { LoggingService } from '@fera-next-gen/logging';

@Injectable()
export class TopicClientService {
  // private readonly storage: Storage;

  private readonly IMAGE_URL_TOKEN_EXPIRE_INTERVAL_DAYS = 7;

  constructor(
    // private readonly env: ConfigService,
    // private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {
    // this.storage = new Storage();
  }

  async generateSignedUrl() {
    const date = new Date();
    this.logger.debug('topic start');
    date.setDate(date.getDate() + this.IMAGE_URL_TOKEN_EXPIRE_INTERVAL_DAYS);
    return date;
  }
}
