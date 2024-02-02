/* eslint-disable turbo/no-undeclared-env-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { GlobalsModule } from '../../../globals.module';
import { AddressesMuleApiService } from './addresses-mule-api.service';
import { RegisterAddressesBodyDto } from '../dto/register.addresses-body.dto';

describe('AddressesMuleApiService', () => {
  let app: INestApplication;
  let service: AddressesMuleApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [AddressesMuleApiService],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<AddressesMuleApiService>(AddressesMuleApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAddresses', () => {
    it('should return error', async () => {
      // set env parameter
      process.env.MULE_CRM_API_BASE_URL = 'dummyMuleCrmBaseUrl';
      process.env.MULE_CRM_API_MY_ADDRESSES_ENDPOINT = '/my/addresses';
      // define parameter
      const registerAddressRequestBody: RegisterAddressesBodyDto & {
        accountId: string;
      } = {
        accountId: 'dummyAccountId',
        isFavorite: true,
        title: 'test title',
        firstName: '太郎',
        lastName: '山田',
        firstNameKana: 'タロウ',
        lastNameKana: 'ヤマダ',
        zipCode: '1234567',
        prefecture: '埼玉県',
        address1: '本庄市早稲田の杜',
        address2: '一丁目2番1号',
        address3: 'カインズマンション100号室',
        phone: '09099999999',
        phone2: '08099999999',
        email: 'test@example.com',
        companyName: 'テスト会社',
        departmentName: 'テスト部',
        memo: 'サンプルメモ',
      };
      // check method
      await expect(
        service.createAddresses(registerAddressRequestBody),
      ).rejects.toThrow(HttpException);
    });
  });
});
