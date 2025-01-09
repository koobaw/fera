import { CommonModule } from '@fera-next-gen/common';
import { FirestoreBatchModule } from '@fera-next-gen/firestore-batch';
import { LoggingModule } from '@fera-next-gen/logging';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GeoMagnetismService } from './geoMagnetic.service';

@Module({
  providers: [GeoMagnetismService],
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
    GeoMagnetismService,
  ],
})
export class UtilsModule {}
