import { LoggingModule } from '@cainz-next-gen/logging';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OrderService } from './order.service';

@Module({
  providers: [OrderService],
  imports: [LoggingModule, HttpModule, ConfigModule],
  exports: [OrderService],
})
export class OrderModule {}
