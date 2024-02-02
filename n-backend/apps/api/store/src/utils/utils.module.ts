import { FirestoreBatchModule } from '@cainz-next-gen/firestore-batch';
import { CommonModule } from '@cainz-next-gen/common';
import { LoggingModule } from '@cainz-next-gen/logging';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    FirestoreBatchModule,
    CommonModule,
    LoggingModule,
    HttpModule.register({
      timeout: 10000, // TODO: 暫定で 10s に設定しているので timeout する時間を決める必要あり
    }),
  ],
  exports: [LoggingModule, CommonModule, HttpModule, FirestoreBatchModule],
})
export class UtilsModule {}
