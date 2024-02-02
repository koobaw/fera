import { Module } from '@nestjs/common';

import { FlyerImportService } from './flyer-import.service';
import { StorageClientService } from './storage-client/storage-client.service';

@Module({
  providers: [FlyerImportService, StorageClientService],
})
export class FlyerImportModule {}
