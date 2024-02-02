import { CommonModule } from '@cainz-next-gen/common';
import { FirestoreBatchModule } from '@cainz-next-gen/firestore-batch';
import { LoggingModule } from '@cainz-next-gen/logging';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CreditUtilService } from './credit-util.service';
import { SettlementUtilsService } from './settlement.utils';

@Module({
  providers: [CreditUtilService, SettlementUtilsService],
  imports: [
    FirestoreBatchModule,
    LoggingModule,
    CommonModule,
    HttpModule.register({
      timeout: 10000, // TODO: 暫定で 10s に設定しているので timeout する時間を決める必要あり
    }),
  ],
  exports: [
    LoggingModule,
    HttpModule,
    FirestoreBatchModule,
    CommonModule,
    CreditUtilService,
    SettlementUtilsService,
  ],
})
export class UtilsModule {}
