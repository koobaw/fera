/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpException, INestApplication } from '@nestjs/common';
import { GlobalsModule } from '../../../globals.module';
import { AddressesMuleApiService } from './addresses-mule-api.service';
import { MuleAddressUpdateSuccessResponse } from '../interface/update.mule-api.interface';
import { UpdateAddressBodyDto } from '../dto/update.address-body.dto';
import { UpdateAddressParamDto } from '../dto/update.address-param.dto';
import { RegisterAddressesBodyDto } from '../dto/register.addresses-body.dto';

describe('AddressesMuleApiService', () => {
  let app: INestApplication;
  let service: AddressesMuleApiService;
  let httpService: HttpService;
  let env: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [AddressesMuleApiService],
    }).compile();

    service = module.get<AddressesMuleApiService>(AddressesMuleApiService);
    httpService = module.get<HttpService>(HttpService);
    env = module.get<ConfigService>(ConfigService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateAddress', () => {
    it('should be defined', () => {
      expect(service.updateAddress).toBeDefined();
    });

    it('should request to target url', async () => {
      const response: MuleAddressUpdateSuccessResponse = {
        status: 0,
        cid: '',
        timestamp: '',
        successful: true,
        item: undefined,
      };

      const observableResponse = of({ data: response });

      let sendedUrl;
      jest.spyOn(httpService as any, 'get').mockImplementation((url) => {
        sendedUrl = url;
        return { pipe: jest.fn().mockReturnValue(observableResponse) };
      });
      const updateAddressParamDto: UpdateAddressParamDto = {
        addressId: 'addressId',
      };

      const updateAddressBodyDto: UpdateAddressBodyDto = {
        isFavorite: true,
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        firstNameKana: 'firstNameKana',
        lastNameKana: 'lastNameKana',
        zipCode: '0000000',
        prefecture: 'prefecture',
        address1: 'address1',
        address2: 'address2',
        address3: 'address3',
        phone: 'phone',
        phone2: 'phone2',
        email: 'email',
        companyName: 'companyName',
        departmentName: 'departmentName',
        memo: 'memo',
        isDeleted: false,
      };

      await service.updateAddress(updateAddressParamDto, updateAddressBodyDto);

      const baseUrl = env.get<string>('MULE_CRM_API_BASE_URL');
      const endPoint = env.get<string>('MULE_CRM_API_MY_ADDRESSES_ENDPOINT');

      const url = `${baseUrl}${endPoint}/${updateAddressParamDto.addressId}`;
      expect(sendedUrl).toEqual(url);
    });

    it('should throw error When response data is not successful', async () => {
      const response: MuleAddressUpdateSuccessResponse = {
        status: 0,
        cid: '',
        timestamp: '',
        successful: false,
        item: undefined,
      };

      const updateAddressParamDto: UpdateAddressParamDto = {
        addressId: 'addressId',
      };

      const updateAddressBodyDto: UpdateAddressBodyDto = {
        isFavorite: true,
        title: 'title',
        firstName: 'firstName',
        lastName: 'lastName',
        firstNameKana: 'firstNameKana',
        lastNameKana: 'lastNameKana',
        zipCode: '0000000',
        prefecture: 'prefecture',
        address1: 'address1',
        address2: 'address2',
        address3: 'address3',
        phone: 'phone',
        phone2: 'phone2',
        email: 'email',
        companyName: 'companyName',
        departmentName: 'departmentName',
        memo: 'memo',
        isDeleted: false,
      };

      const observableResponse = of({ data: response });

      jest.spyOn(httpService as any, 'get').mockImplementation(() => ({
        pipe: jest.fn().mockReturnValue(observableResponse),
      }));

      await expect(
        service.updateAddress(updateAddressParamDto, updateAddressBodyDto),
      ).rejects.toThrow();
    });
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
