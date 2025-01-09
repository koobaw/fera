import { Module } from '@nestjs/common';
import { SalesforceApiModule } from '@fera-next-gen/salesforce-api';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [SalesforceApiModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
