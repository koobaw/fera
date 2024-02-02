import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ErrorCode, ErrorMessage } from '../../../types/constants/error-code';

@Injectable()
export class MystoreMuleApiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggingService,
    private readonly env: ConfigService,
    private readonly commonService: CommonService,
  ) {}

  async getMystoreFromMule(sfdcUserId: string) {
    this.logger.info('start get mystore from mule api');
    /*
     * mule側のI/Fが変更になる可能性があるため一旦封印

    const headers = {
      client_id: this.env.get<string>('MULE_CRM_API_CLIENT_ID'),
      client_secret: this.env.get<string>('MULE_CRM_API_CLIENT_SECRET'),
    };
    const params = {
      orderby: 'createdDate desc',
    };
    const baseUrl = this.env.get<string>('MULE_CRM_API_BASE_URL');
    const url = `${baseUrl}/membership/${sfdcUserId}/mystores`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, { headers, params }).pipe(
        catchError((error: AxiosError) => {
          this.commonService.logException(`Mule API occurred Error`, error);
          throw new HttpException(
            {
              errorCode: ErrorCode.MYSTORE_GET_FROM_DB,
              message: ErrorMessage[ErrorCode.MYSTORE_GET_FROM_DB],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      ),
    );
    */
    const data = [
      {
        createdById: 'test',
        createdDate: '2022-12-01T00:00:03Z',
        id: 'ovn2y83r2y800rgaSjn',
        isDeleted: false,
        lastActivityDate: '2023-01-01T00:00:03Z',
        lastModifiedById: 'test',
        lastModifiedDate: '2023-01-01T00:00:03Z',
        lastReferencedDate: '2023-01-01T00:00:03Z',
        lastViewedDate: '2023-01-01T00:00:03Z',
        name: '',
        ownerId: sfdcUserId,
        systemModstamp: '2023-01-01T00:00:03Z',
        accountId: '',
        favoriteStoreFlag: false,
        storeCode: '859',
        storeId: '',
        store: {
          name: 'cainz朝霞店',
        },
      },
      {
        createdById: 'test',
        createdDate: '2023-01-01T00:00:03Z',
        id: 'ovmrJewNJIW39',
        isDeleted: false,
        lastActivityDate: '2023-01-01T00:00:03Z',
        lastModifiedById: 'test',
        lastModifiedDate: '2023-01-01T00:00:03Z',
        lastReferencedDate: '2023-01-01T00:00:03Z',
        lastViewedDate: '2023-01-01T00:00:03Z',
        name: '',
        ownerId: sfdcUserId,
        systemModstamp: '2023-01-01T00:00:03Z',
        accountId: '',
        favoriteStoreFlag: true,
        storeCode: '813',
        storeId: '',
        store: {
          name: 'cainz本庄早稲田店',
        },
      },
      {
        createdById: 'test',
        createdDate: '2023-02-01T00:00:03Z',
        id: 'ovn2y83r2y800rg247290jn',
        isDeleted: true,
        lastActivityDate: '2023-01-01T00:00:03Z',
        lastModifiedById: 'test',
        lastModifiedDate: '2023-01-01T00:00:03Z',
        lastReferencedDate: '2023-01-01T00:00:03Z',
        lastViewedDate: '2023-01-01T00:00:03Z',
        name: '',
        ownerId: sfdcUserId,
        systemModstamp: '2023-01-01T00:00:03Z',
        accountId: '',
        favoriteStoreFlag: false,
        storeCode: '999',
        storeId: '',
        store: {
          name: 'cainz何処園インター店',
        },
      },
    ];

    this.logger.info('end get mystore from mule api');
    return data;
  }
}
