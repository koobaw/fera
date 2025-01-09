import { Request } from 'express';

import { AuthGuard } from '@fera-next-gen/guard';
import { CommonService } from '@fera-next-gen/common';
import { Claims, MigrateTarget } from '@fera-next-gen/types';
import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AnonymousService } from './anonymous.service';
import { MigrateData } from './interface/migrate-data.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

@Controller('anonymous')
export class AnonymousController {
  constructor(
    private readonly anonymousService: AnonymousService,
    private readonly commonService: CommonService,
  ) {}

  @Post('/migrate')
  @UseGuards(AuthGuard)
  async migrate(@Req() req: Request & { claims?: Claims }) {
    const currentUserId: string = req.claims.userId;
    if (!currentUserId) {
      throw new HttpException(
        {
          errorCode: ErrorCode.ANONYMOUS_MIGRATE_USER_NOT_EXIST,
          message: ErrorMessage[ErrorCode.ANONYMOUS_MIGRATE_USER_NOT_EXIST],
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );

    const migrateTarget: MigrateTarget =
      await this.anonymousService.getMigrateTarget(currentUserId);

    if (migrateTarget.legacyUserId && !migrateTarget.migrated) {
      const migrateData: MigrateData =
        await this.anonymousService.getMigrateData(migrateTarget.legacyUserId);
      await this.anonymousService.migrate(
        currentUserId,
        migrateData,
        operatorName,
      );
    }
    return { code: HttpStatus.CREATED, message: 'ok' };
  }
}
