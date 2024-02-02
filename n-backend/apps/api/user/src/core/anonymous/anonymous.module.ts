import { Module } from '@nestjs/common';
import { AnonymousService } from './anonymous.service';
import { AnonymousController } from './anonymous.controller';

@Module({
  controllers: [AnonymousController],
  providers: [AnonymousService],
})
export class AnonymousModule {}
