import { Request } from 'express';

import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { Claims } from '@cainz-next-gen/types';
import {
  Body,
  Controller,
  HttpStatus,
  Put,
  Get,
  Req,
  UseGuards,
  HttpException,
} from '@nestjs/common';

import { MemberAuthGuard } from '@cainz-next-gen/guard';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

import { UserIdDto } from './dto/userid.dto';
import {
  MystoreUpdateRes,
  MystoreGetRes,
} from './interface/mystore-response.interface';

import { UpdateMystoreService } from './update.mystore/update.mystore.service';
import { ReadMystoreService } from './read.mystore/read.mystore.service';

@Controller('member/mystore')
export class MystoreController {
  constructor(
    private readonly updateMystoreService: UpdateMystoreService,
    private readonly readMystoreService: ReadMystoreService,
    private readonly commonService: CommonService,
    private readonly logger: LoggingService,
  ) {}

  @Put('/')
  @UseGuards(MemberAuthGuard)
  async update(@Req() req: Request, @Body() userId: UserIdDto) {
    const { sfdcUserId, encryptedMemberId } = userId;
    const operatorName = this.commonService.createFirestoreSystemName(
      req.originalUrl,
      req.method,
    );

    const userExists = await this.updateMystoreService.userExists(
      encryptedMemberId,
    );

    if (!userExists) {
      this.logger.error('user not found');
      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_UPDATE_INVALID_USER,
          message: ErrorMessage[ErrorCode.MYSTORE_UPDATE_INVALID_USER],
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // muleよりデータ取得
    const mystoreRecord = await this.updateMystoreService.getMystoreFromMule(
      sfdcUserId,
    );

    // firestoreへ保存
    await this.updateMystoreService.saveToFirestoreMystore(
      encryptedMemberId,
      mystoreRecord,
      operatorName,
    );

    const result: MystoreUpdateRes = {
      code: HttpStatus.OK,
      message: 'ok',
    };
    return result;
  }

  @Get('/')
  @UseGuards(MemberAuthGuard)
  async getMystore(@Req() req: Request & { claims?: Claims }) {
    const userClaims: Claims = req.claims;
    const { encryptedMemberId } = userClaims;

    if (typeof encryptedMemberId === 'undefined' || encryptedMemberId === '') {
      this.logger.error('member is not login.');
      throw new HttpException(
        {
          errorCode: ErrorCode.MYSTORE_GET_INVALID_USER,
          message: ErrorMessage[ErrorCode.MYSTORE_GET_INVALID_USER],
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mystoreList = await this.readMystoreService.getMystore(
      encryptedMemberId,
    );

    const result: MystoreGetRes = {
      code: HttpStatus.OK,
      message: 'ok',
      data: mystoreList,
    };
    return result;
  }
}
