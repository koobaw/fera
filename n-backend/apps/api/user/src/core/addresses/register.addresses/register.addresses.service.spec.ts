import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@cainz-next-gen/logging';
import { CommonService } from '@cainz-next-gen/common';
import { INestApplication } from '@nestjs/common';
import { GlobalsModule } from '../../../globals.module';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';
import { RegisterAddressesService } from './register.addresses.service';
import { RegisterAddressesBodyDto } from '../dto/register.addresses-body.dto';

describe('RegisterAddressesService', () => {
  let app: INestApplication;
  let service: RegisterAddressesService;
  let addressesMuleApiService: AddressesMuleApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        RegisterAddressesService,
        AddressesMuleApiService,
        ConfigService,
        LoggingService,
        CommonService,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<RegisterAddressesService>(RegisterAddressesService);
    addressesMuleApiService = module.get<AddressesMuleApiService>(
      AddressesMuleApiService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAddresses', () => {
    it('should successfully create address', async () => {
      // define parameter
      const accountId = 'dummyAccountId';
      const registerAddressRequestBody: RegisterAddressesBodyDto = {
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
      // define mock
      jest
        .spyOn(addressesMuleApiService, 'createAddresses')
        .mockImplementation(async () => {});
      // check method
      await expect(
        service.registerAddressees(accountId, registerAddressRequestBody),
      ).resolves.toBeUndefined();
    });
  });
});
