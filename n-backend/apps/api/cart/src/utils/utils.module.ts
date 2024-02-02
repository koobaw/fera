import { CommonModule } from '@cainz-next-gen/common';
import { FirestoreBatchModule } from '@cainz-next-gen/firestore-batch';
import { LoggingModule } from '@cainz-next-gen/logging';
import { OrderModule } from '@cainz-next-gen/order';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    FirestoreBatchModule,
    LoggingModule,
    CommonModule,
    OrderModule,
    HttpModule.register({
      timeout: 10000, // TODO: 暫定で 10s に設定しているので timeout する時間を決める必要あり
    }),
  ],
  providers: [],
  exports: [
    LoggingModule,
    CommonModule,
    OrderModule,
    HttpModule,
    FirestoreBatchModule,
  ],
})
export class UtilsModule {}
