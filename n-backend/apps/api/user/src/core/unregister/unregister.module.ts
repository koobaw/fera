import { Module } from '@nestjs/common';
import { UnregisterService } from './unregister.service';
import { UnregisterController } from './unregister.controller';
import { LogoutService } from '../logout/logout.service';

@Module({
  controllers: [UnregisterController],
  providers: [UnregisterService, LogoutService],
})
export class UnregisterModule {}
