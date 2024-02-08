import { Module } from '@nestjs/common';

import { IntervalExecutionService } from './interval-execution.service';
import { TopicClientService } from './topic-client/topic-client.service';

@Module({
  providers: [IntervalExecutionService, TopicClientService],
})
export class IntervalExecutionModule {}
