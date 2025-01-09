import { LoggingModule } from '@fera-next-gen/logging';
import { Module } from '@nestjs/common';

import { CommonService } from './common.service';

@Module({
  providers: [CommonService],
  imports: [LoggingModule],
  exports: [CommonService],
})
export class CommonModule {}
