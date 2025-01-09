import { CommonModule } from '@fera-next-gen/common';
import { FirestoreBatchModule } from '@fera-next-gen/firestore-batch';
import { LoggingModule } from '@fera-next-gen/logging';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PocketRegiCheckinCommonService } from './checkin.utils';
import { PocketRegiCartCommonService } from './cartproducts.utils';
import { GetMembershipRank } from './membershipRank/membershiprank.utils';

@Module({
  providers: [
    PocketRegiCheckinCommonService,
    PocketRegiCartCommonService,
    GetMembershipRank,
  ],
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
    PocketRegiCheckinCommonService,
    PocketRegiCartCommonService,
    GetMembershipRank,
  ],
})
export class UtilsModule {}
