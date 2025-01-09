import { FirestoreBatchModule } from '@fera-next-gen/firestore-batch';
import { CommonModule } from '@fera-next-gen/common';
import { LoggingModule } from '@fera-next-gen/logging';
import { Module } from '@nestjs/common';

@Module({
  imports: [FirestoreBatchModule, CommonModule, LoggingModule],
  exports: [LoggingModule, CommonModule, FirestoreBatchModule],
})
export class UtilsModule {}
