import { Module } from '@nestjs/common';

import { Storage } from '@google-cloud/storage';
import { ProductExtendDescriptionImportService } from './product-extend-description-import.service';
import { StorageClientService } from './storage-client/storage-client.service';

const StorageProvider = { provide: 'Storage', useClass: Storage };

@Module({
  providers: [
    ProductExtendDescriptionImportService,
    StorageClientService,
    StorageProvider,
  ],
})
export class ProductExtendDescriptionImportModule {}
