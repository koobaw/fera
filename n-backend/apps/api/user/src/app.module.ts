import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AnonymousModule } from './core/anonymous/anonymous.module';
import { LoginModule } from './core/login/login.module';
import { LogoutModule } from './core/logout/logout.module';
import { PointModule } from './core/point/point.module';
import { PrivateProfileModule } from './core/private-profile/private-profile.module';
import { MystoreModule } from './core/mystore/mystore.module';
import { GlobalsModule } from './globals.module';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { UnregisterModule } from './core/unregister/unregister.module';
import { FavoriteProductsModule } from './core/favorite-products/favorite-products.module';
import { AddressesModule } from './core/addresses/addresses.module';

@Module({
  imports: [
    AnonymousModule,
    GlobalsModule,
    LoginModule,
    LogoutModule,
    PrivateProfileModule,
    PointModule,
    MystoreModule,
    UnregisterModule,
    FavoriteProductsModule,
    AddressesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
