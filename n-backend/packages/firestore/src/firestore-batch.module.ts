import { LoggingModule } from '@cainz-next-gen/logging';
import { Firestore } from '@google-cloud/firestore';
import { Module } from '@nestjs/common';

import { FirestoreBatchService } from './firestore-batch.service';

const FirestoreProvider = { provide: 'Firestore', useClass: Firestore };

@Module({
  providers: [FirestoreBatchService, FirestoreProvider],
  imports: [LoggingModule],
  exports: [FirestoreBatchService, FirestoreProvider],
})
export class FirestoreBatchModule {}
