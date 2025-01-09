import { Test, TestingModule } from '@nestjs/testing';
import { CommonService } from '@fera-next-gen/common';
import { MemberAuthGuard } from '@fera-next-gen/guard';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { LoggingService } from '@fera-next-gen/logging';
import { MockAuthGuard } from '@fera-next-gen/test';
import { FindAddressesService } from './find.addresses/find.addresses.service';
import { AddressesController } from './addresses.controller';
import { GlobalsModule } from '../../globals.module';
import { RegisterAddressesService } from './register.addresses/register.addresses.service';
import { RegisterAddressesBodyDto } from './dto/register.addresses-body.dto';
import { UpdateAddressesService } from './update.addresses/update.addresses.service';
import { AddressesMuleApiService } from './addresses-mule-api/addresses-mule-api.service';
import { UpdateAddressBodyDto } from './dto/update.address-body.dto';

describe('AddressesController', () => {
  let controller: AddressesController;
  let app: INestApplication;
  let mockFindAddressesService: Partial<FindAddressesService>;
  let registerAddressesService: RegisterAddressesService;
  let updateAddressesService: UpdateAddressesService;

  beforeEach(async () => {
    mockFindAddressesService = {
      getAddresses: jest.fn().mockImplementation(() => Promise.resolve([])),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [AddressesController],
      providers: [
        {
          provide: FindAddressesService,
          useValue: mockFindAddressesService,
        },
        {
          provide: RegisterAddressesService,
          useFactory: () => ({
            registerAddressees: jest.fn(),
          }),
        },
        UpdateAddressesService,
        AddressesMuleApiService,
        {
          provide: LoggingService,
          useFactory: () => ({
            info: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
            createFirestoreSystemName: jest.fn(),
            decryptAES256: jest.fn().mockImplementation(() => 'dummyDecrypt'),
          }),
        },
      ],
    })
      .overrideGuard(MemberAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    controller = module.get<AddressesController>(AddressesController);
    registerAddressesService = module.get<RegisterAddressesService>(
      RegisterAddressesService,
    );
    updateAddressesService = module.get<UpdateAddressesService>(
      UpdateAddressesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerAddress', () => {
    it('should successfully create address', async () => {
      // define parameter
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
        phone: '0120444444',
        phone2: '08099999999',
        email: 'test@example.com',
        companyName: 'テスト会社',
        departmentName: 'テスト部',
        memo: 'サンプルメモ',
      };
      const timestamp = '2023-12-25T15:37:00+09:00';
      const expectedResponse = {
        code: HttpStatus.CREATED,
        message: 'ok',
        timestamp,
      };
      // define mock
      jest
        .spyOn(registerAddressesService, 'registerAddressees')
        .mockImplementation(async () => {});
      // check method
      const response = await request(app.getHttpServer())
        .post('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .send(registerAddressRequestBody);
      // check response
      expect({ ...response.body, timestamp }).toEqual(expectedResponse);
    });

    it('should return error by validation in Kana name', async () => {
      // define parameter
      const registerAddressRequestBody: RegisterAddressesBodyDto = {
        isFavorite: true,
        title: 'test title',
        firstName: '太郎',
        lastName: '山田',
        firstNameKana: '太郎',
        lastNameKana: '山田',
        zipCode: '1234567',
        prefecture: '埼玉県',
        address1: '本庄市早稲田の杜',
        address2: '一丁目2番1号',
        address3: 'カインズマンション100号室',
        phone: '09099999999',
        email: 'test@example.com',
      };
      const expectedResponse = {
        error: 'Bad Request',
        message: [
          'firstNameKana must match /^[\\u30A0-\\u30FF]+$/ regular expression',
          'lastNameKana must match /^[\\u30A0-\\u30FF]+$/ regular expression',
        ],
        statusCode: 400,
      };
      // check method
      const response = await request(app.getHttpServer())
        .post('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .send(registerAddressRequestBody);
      // check response
      expect(response.body).toEqual(expectedResponse);
    });
    it('should return error by validation in zip code', async () => {
      // define parameter
      const registerAddressRequestBody: RegisterAddressesBodyDto = {
        isFavorite: true,
        title: 'test title',
        firstName: '太郎',
        lastName: '山田',
        firstNameKana: 'タロウ',
        lastNameKana: 'ヤマダ',
        zipCode: '123-4567',
        prefecture: '埼玉県',
        address1: '本庄市早稲田の杜',
        address2: '一丁目2番1号',
        address3: 'カインズマンション100号室',
        phone: '09099999999',
        email: 'test@example.com',
      };
      const expectedResponse = {
        error: 'Bad Request',
        message: ['zipCode must match /^\\d{7}$/ regular expression'],
        statusCode: 400,
      };
      // check method
      const response = await request(app.getHttpServer())
        .post('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .send(registerAddressRequestBody);
      // check response
      expect(response.body).toEqual(expectedResponse);
    });
    it('should return error by validation in phone', async () => {
      // define parameter
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
        phone: '77357729034',
        phone2: '0120-9999-9999',
        email: 'test@example.com',
      };
      const expectedResponse = {
        error: 'Bad Request',
        message: [
          'phone must be a valid phone number',
          'phone2 must be a valid phone number',
        ],
        statusCode: 400,
      };
      // check method
      const response = await request(app.getHttpServer())
        .post('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .send(registerAddressRequestBody);
      // check response
      expect(response.body).toEqual(expectedResponse);
    });
  });

  it('should define get method', () => {
    expect(controller.getAddresses).toBeDefined();
  });
  describe('getAddresses', () => {
    it('should return an array of addresses when query parameter isFavorite is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' })
        .query({ isFavorite: true });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('code', HttpStatus.OK);
      expect(response.body).toHaveProperty('message', 'ok');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should return an array of addresses when no query parameters are provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/member/addresses')
        .set({ Authorization: 'Bearer VALID_TOKEN' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toHaveProperty('code', HttpStatus.OK);
      expect(response.body).toHaveProperty('message', 'ok');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('updateAddress', () => {
    it('should response success', async () => {
      jest.spyOn(updateAddressesService, 'updateAddress').mockImplementation();
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
        email: 'email@example.com',
        companyName: 'companyName',
        departmentName: 'departmentName',
        memo: 'memo',
        isDeleted: false,
      };
      await expect(
        controller.updateAddress(
          { addressId: 'addressId' },
          updateAddressBodyDto,
        ),
      ).resolves.not.toThrow();
    });
  });
});
