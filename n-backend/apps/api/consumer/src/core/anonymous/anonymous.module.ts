import { Module } from '@nestjs/common';
import { AnonymousService } from './anonymous.service';
import { AnonymousController } from './anonymous.controller';
import { MigrateService } from './migrate/migrate.service';

@Module({
  controllers: [AnonymousController],
  providers: [AnonymousService, MigrateService],
})
export class AnonymousModule {}
