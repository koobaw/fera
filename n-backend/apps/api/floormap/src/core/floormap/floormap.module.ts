import { Module } from '@nestjs/common';
import { FloormapController } from './floormap.controller';
import { FloormapService } from './floormap.service';

@Module({
  controllers: [FloormapController],
  providers: [FloormapService],
})
export class FloormapModule {}
