import { FirestoreBatchModule } from '@cainz-next-gen/firestore-batch';
import { CommonModule } from '@cainz-next-gen/common';
import { LoggingModule } from '@cainz-next-gen/logging';
import { Module } from '@nestjs/common';

@Module({
  imports: [FirestoreBatchModule, CommonModule, LoggingModule],
  exports: [LoggingModule, CommonModule, FirestoreBatchModule],
})
export class UtilsModule {}
