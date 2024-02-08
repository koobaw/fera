import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { ResponseInterceptor } from '@cainz-next-gen/interceptor';
import { UtilsModule } from './utils/utils.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UtilsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
  exports: [ConfigModule, UtilsModule],
})
export class GlobalsModule {}
