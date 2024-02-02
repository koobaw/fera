import { Module } from '@nestjs/common';

import { MystoreController } from './mystore.controller';
import { MystoreMuleApiService } from './mystore-mule-api/mystore-mule-api.service';
import { ReadMystoreService } from './read.mystore/read.mystore.service';
import { UpdateMystoreService } from './update.mystore/update.mystore.service';

@Module({
  controllers: [MystoreController],
  providers: [ReadMystoreService, UpdateMystoreService, MystoreMuleApiService],
})
export class MystoreModule {}
