import { Request } from 'express';
import { Claims } from 'packages/types/src/claims';

import { AuthGuard } from '@cainz-next-gen/guard';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * Registers memberId into mule system using post request
   * @param {req: import type from express, claims: Custom claim object}
   * @returns object with code, message , data
   */
  @Post()
  @UseGuards(AuthGuard)
  async registerMemberId(@Req() req: Request & { claims?: Claims }) {
    // Get the claims object / クレームオブジェクトを取得する
    const userClaims: Claims = req.claims;

    const result = await this.membersService.registerMemberId(userClaims);

    return result;
  }
}
