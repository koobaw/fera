import { SalesforceApiModule } from '@cainz-next-gen/salesforce-api';
import { Module } from '@nestjs/common';

import { PrivateProfileController } from './private-profile.controller';
import { PrivateProfileService } from './private-profile.service';

@Module({
  imports: [SalesforceApiModule],
  providers: [PrivateProfileService],
  controllers: [PrivateProfileController],
})
export class PrivateProfileModule {}
