import { Module } from '@nestjs/common';

import { GeomagnetismAuthService } from './auth/geomagnetismAuth.service';
import { GeomagnetismRegisterService } from './register/geomagnetismRegister.service';
import { GeomagnetismController } from './geomagnetism.controller';

@Module({
  controllers: [GeomagnetismController],
  providers: [GeomagnetismAuthService, GeomagnetismRegisterService],
})
export class GeomagnetismModule {}
