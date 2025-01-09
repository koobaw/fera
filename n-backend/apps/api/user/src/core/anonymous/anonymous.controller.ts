import { Request } from 'express';

import { AuthGuard } from '@fera-next-gen/guard';
import { CommonService } from '@fera-next-gen/common';
import { Claims } from '@fera-next-gen/types';
import {
  Controller,
  HttpStatus,
  Post,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AnonymousService } from './anonymous.service';

@Controller('anonymous')
export class AnonymousController {
  constructor(
    private readonly anonymousService: AnonymousService,
    private readonly commonService: CommonService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async create(@Req() req: Request & { claims?: Claims }) {
    const userClaims: Claims = req.claims;
    const docId = userClaims.userId;
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );

    const userExist = await this.anonymousService.isUserExist(docId);
    if (!userExist) {
      const defaultData = this.anonymousService.createDefaultUserData(
        docId,
        operatorName,
      );

      await this.anonymousService.saveToFirestore(docId, defaultData);
    }

    return { code: HttpStatus.CREATED, message: 'ok' };
  }

  @Post('/migrate')
  @UseGuards(AuthGuard)
  async migrate(
    @Headers('x-correlation-id') correlationId: string,
    @Req() req: Request & { claims?: Claims },
    @Headers('Authorization') bearerHeader: string,
  ) {
    const userClaims: Claims = req.claims;
    await this.anonymousService.pushToTaskQueue(
      userClaims.userId,
      bearerHeader,
      correlationId,
    );
    return {
      code: HttpStatus.OK,
      message: 'ok',
    };
  }
}
