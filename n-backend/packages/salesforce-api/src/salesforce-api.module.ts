import { LoggingModule } from '@fera-next-gen/logging';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SalesforceApiService } from './salesforce-api.service';

@Module({
  providers: [SalesforceApiService],
  imports: [LoggingModule, HttpModule, ConfigModule],
  exports: [SalesforceApiService],
})
export class SalesforceApiModule {}
