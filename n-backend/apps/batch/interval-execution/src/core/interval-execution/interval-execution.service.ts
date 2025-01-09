// import firestore from '@google-cloud/firestore';

import { LoggingService } from '@fera-next-gen/logging';
// import { OmitTimestampFlyer, Timestamp } from '@fera-next-gen/types';
import { Injectable } from '@nestjs/common';
import { CommonService } from '@fera-next-gen/common';

// import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Injectable()
export class IntervalExecutionService {
  // private readonly APP_NAME = 'interval_execution_batch';

  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
  ) {}

  async import() {
    this.logger.debug('start interval execution batch');
    const rowData = await this.getStart();
    this.logger.debug(`end interval execution batch ${rowData}`);
  }

  private async getStart() {
    this.logger.debug('start get data from firestore');
    const data = 'success';

    this.logger.debug('end get data from firestore');
    return data;
  }
}
