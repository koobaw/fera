/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import {
  INestApplication,
  HttpStatus,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@fera-next-gen/guard';
import { loadEnvsForLocal } from '../src/config/load-envs-for-local';
import { AppModule } from '../src/app.module';
import { CheckoutController } from '../src/core/checkout/checkout.controller';
import { CheckoutService } from '../src/core/checkout/checkout.service';
import { CheckoutModule } from '../src/core/checkout/checkout.module';
import {
  mockCheckOutComplete2Id,
  mockCheckOutComplete2Dto,
  mockCheckOutChangeData,
  mockcheckoutId,
} from './mock';

describe('Checkout (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await loadEnvsForLocal();
  }, 30000);

  describe('checkout-begin', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule, CheckoutModule],
        controllers: [CheckoutController],
        providers: [CheckoutService],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            const feraappApiKey = req.headers?.['feraapp-api-key'];

            if (feraappApiKey && typeof feraappApiKey === 'string') {
              return true;
            }

            const authorizationHeader = req.headers?.authorization;
            if (
              authorizationHeader &&
              typeof authorizationHeader === 'string'
            ) {
              req.claims = { userId: '123456' };
              return true;
            }
            throw new HttpException({}, HttpStatus.UNAUTHORIZED);
          },
        })
        .compile();

      app = module.createNestApplication();
      await app.init();
    }, 30000);
    it('should post products and create a checkout id', async () => {
      const commonHeaders = {
        authorization: 'bearer 34234324323432322342',
        'Content-Type': 'application/json',
      };
      const response = await request(app.getHttpServer())
        .post('')
        .set(commonHeaders)
        .send({
          amazonCheckoutSessionId: '97361744-42c9-4d1b-80f2-be2fb371a506',
          selectedItems: [
            'MlgzTxGMz9XWS4J81BB0',
            'LlgzTxGMz9XWS4J81TT0',
            'NlgzTxGMz9XWS4J81AA0',
          ],
        });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception after entering wrong url', async () => {
      const commonHeaders = {
        authorization: 'bearer 34234324323432322342',
        'Content-Type': 'application/json',
      };
      const response = await request(app.getHttpServer())
        .post('/checkouts')
        .set(commonHeaders)
        .send({
          amazonCheckoutSessionId: '97361744-42c9-4d1b-80f2-be2fb371a506',
          selectedItems: [
            'MlgzTxGMz9XWS4J81BB0',
            'LlgzTxGMz9XWS4J81TT0',
            'NlgzTxGMz9XWS4J81AA0',
          ],
        });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
    it('should throw a unauthorized exception if the bearer token is not passed', async () => {
      const response = await request(app.getHttpServer())
        .post('')
        .send({
          amazonCheckoutSessionId: '97361744-42c9-4d1b-80f2-be2fb371a506',
          selectedItems: [
            'MlgzTxGMz9XWS4J81BB0',
            'LlgzTxGMz9XWS4J81TT0',
            'NlgzTxGMz9XWS4J81AA0',
          ],
        });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });

  describe('checkout-change', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule, CheckoutModule],
        controllers: [CheckoutController],
        providers: [CheckoutService],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            const feraappApiKey = req.headers?.['feraapp-api-key'];

            if (feraappApiKey && typeof feraappApiKey === 'string') {
              return true;
            }

            const authorizationHeader = req.headers?.authorization;
            if (
              authorizationHeader &&
              typeof authorizationHeader === 'string'
            ) {
              req.claims = { userId: '123456' };
              return true;
            }
            throw new HttpException({}, HttpStatus.UNAUTHORIZED);
          },
        })
        .compile();

      app = module.createNestApplication();
      await app.init();
    }, 30000);
    it('should update data checkout change', async () => {
      const commonHeaders = {
        authorization: 'bearer 34234324323432322342',
        'Content-Type': 'application/json',
      };
      const response = await request(app.getHttpServer())
        .patch(`/${mockcheckoutId}`)
        .set(commonHeaders)
        .send(mockCheckOutChangeData);
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception after entering wrong url', async () => {
      const commonHeaders = {
        authorization: 'bearer 34234324323432322342',
        'Content-Type': 'application/json',
      };
      const response = await request(app.getHttpServer())
        .patch(`/checkout/${mockcheckoutId}`)
        .set(commonHeaders)
        .send(mockCheckOutChangeData);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
    it('should throw a unauthorized exception if the api key is not passed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/${mockcheckoutId}`)
        .send(mockCheckOutChangeData);
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });

  describe('checkout-complete', () => {
    it('should get Order confirmation  if payment is successful from payment gateway through different payment methods', async () => {
      const checkoutId = '10130759-c3fa-4136-a619-e30a4ec41aa7';
      const response = await request(app.getHttpServer())
        .post(`/${checkoutId}/complete`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send({
          userId: 'a3a2d619-e97c-4c68-8d29-2db0231250f6',
          customerInfo: {
            customerLastName: '埼玉',
            customerFirstName: '太郎',
            customerLastNameKana: 'サイタマ',
            customerFirstNameKana: 'サイタマ',
            customerPostalCode: '3670030',
            customerPrefecture: '埼玉県',
            customerCity: '埼玉県',
            customerAddress1: '本庄市早稲田の杜',
            customerAddress2: 'Cainsville',
            customerCompanyName: 'EC Replace Co., Ltd.',
            customerDepartmentName: 'Information System Department',
            customerPhone: '04811100000',
            customerEmail: 'bftest@bftest.com',
          },
          shippingInfo: {
            isSameAsPurchaser: false,
            selectedAddressBookId: '1',
            shippingLastName: '埼玉',
            shippingFirstName: '太郎',
            shippingLastNameKana: 'サイタマ',
            shippingFirstNameKana: 'タロウ',
            shippingPostalCode: '3670030',
            shippingPrefecture: '埼玉県',
            shippingCity: '埼玉県',
            shippingAddress1: '本庄市早稲田の杜',
            shippingAddress2: 'Akahira Mansion Room 1',
            shippingCompanyName: 'Hokkaido Co., Ltd.',
            shippingDepartmentName: 'Information System Department',
            shippingPhone: '04811100000',
            desiredDeliveryDate: '2023/12/20(Wed)',
            desiredDeliveryTimeZoneId: null,
            isDeliveryBox: false,
            isGift: true,
          },
          affiliateTrackingId: '123ABCdefg456HIJklm789NOPqrs789TUV',
          affiliateVisitDateTime: '2023-10-23T13:32:06Z',
          creditCardTokenList: null,
          httpHeader: null,
        });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);

    it('should get error if wrong checkout Id is passed', async () => {
      const checkoutId = '19eaf9df';

      const response = await request(app.getHttpServer())
        .post(`/${checkoutId}/complete`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send({
          userId: 'a3a2d619-e97c-4c68-8d29-2db0231250f6',
          customerInfo: {
            customerLastName: '埼玉',
            customerFirstName: '太郎',
            customerLastNameKana: 'サイタマ',
            customerFirstNameKana: 'サイタマ',
            customerPostalCode: '3670030',
            customerPrefecture: '埼玉県',
            customerCity: '埼玉県',
            customerAddress1: '本庄市早稲田の杜',
            customerAddress2: 'Cainsville',
            customerCompanyName: 'EC Replace Co., Ltd.',
            customerDepartmentName: 'Information System Department',
            customerPhone: '04811100000',
            customerEmail: 'bftest@bftest.com',
          },
          shippingInfo: {
            isSameAsPurchaser: false,
            selectedAddressBookId: '1',
            shippingLastName: '埼玉',
            shippingFirstName: '太郎',
            shippingLastNameKana: 'サイタマ',
            shippingFirstNameKana: 'タロウ',
            shippingPostalCode: '3670030',
            shippingPrefecture: '埼玉県',
            shippingCity: '埼玉県',
            shippingAddress1: '本庄市早稲田の杜',
            shippingAddress2: 'Akahira Mansion Room 1',
            shippingCompanyName: 'Hokkaido Co., Ltd.',
            shippingDepartmentName: 'Information System Department',
            shippingPhone: '04811100000',
            desiredDeliveryDate: '2023/12/20(Wed)',
            desiredDeliveryTimeZoneId: null,
            isDeliveryBox: false,
            isGift: true,
          },
          affiliateTrackingId: '123ABCdefg456HIJklm789NOPqrs789TUV',
          affiliateVisitDateTime: '2023-10-23T13:32:06Z',
          creditCardTokenList: null,
          httpHeader: null,
        });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    }, 10000);

    it('should get error if wrong endpoint is passed', async () => {
      const checkoutId = '10130759-c3fa-4136-a619-e30a4ec41aa7';

      const response = await request(app.getHttpServer())
        .post(`/${checkoutId}/comp`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send({
          userId: 'a3a2d619-e97c-4c68-8d29-2db0231250f6',
          customerInfo: {
            customerLastName: '埼玉',
            customerFirstName: '太郎',
            customerLastNameKana: 'サイタマ',
            customerFirstNameKana: 'サイタマ',
            customerPostalCode: '3670030',
            customerPrefecture: '埼玉県',
            customerCity: '埼玉県',
            customerAddress1: '本庄市早稲田の杜',
            customerAddress2: 'Cainsville',
            customerCompanyName: 'EC Replace Co., Ltd.',
            customerDepartmentName: 'Information System Department',
            customerPhone: '04811100000',
            customerEmail: 'bftest@bftest.com',
          },
          shippingInfo: {
            isSameAsPurchaser: false,
            selectedAddressBookId: '1',
            shippingLastName: '埼玉',
            shippingFirstName: '太郎',
            shippingLastNameKana: 'サイタマ',
            shippingFirstNameKana: 'タロウ',
            shippingPostalCode: '3670030',
            shippingPrefecture: '埼玉県',
            shippingCity: '埼玉県',
            shippingAddress1: '本庄市早稲田の杜',
            shippingAddress2: 'Akahira Mansion Room 1',
            shippingCompanyName: 'Hokkaido Co., Ltd.',
            shippingDepartmentName: 'Information System Department',
            shippingPhone: '04811100000',
            desiredDeliveryDate: '2023/12/20(Wed)',
            desiredDeliveryTimeZoneId: null,
            isDeliveryBox: false,
            isGift: true,
          },
          affiliateTrackingId: '123ABCdefg456HIJklm789NOPqrs789TUV',
          affiliateVisitDateTime: '2023-10-23T13:32:06Z',
          creditCardTokenList: null,
          httpHeader: null,
        });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);

    it('should get error if authentication fails', async () => {
      const checkoutId = '10130759-c3fa-4136-a619-e30a4ec41aa7';

      const response = await request(app.getHttpServer())
        .post(`/${checkoutId}/complete`)
        .send({
          userId: 'a3a2d619-e97c-4c68-8d29-2db0231250f6',
          customerInfo: {
            customerLastName: '埼玉',
            customerFirstName: '太郎',
            customerLastNameKana: 'サイタマ',
            customerFirstNameKana: 'サイタマ',
            customerPostalCode: '3670030',
            customerPrefecture: '埼玉県',
            customerCity: '埼玉県',
            customerAddress1: '本庄市早稲田の杜',
            customerAddress2: 'Cainsville',
            customerCompanyName: 'EC Replace Co., Ltd.',
            customerDepartmentName: 'Information System Department',
            customerPhone: '04811100000',
            customerEmail: 'bftest@bftest.com',
          },
          shippingInfo: {
            isSameAsPurchaser: false,
            selectedAddressBookId: '1',
            shippingLastName: '埼玉',
            shippingFirstName: '太郎',
            shippingLastNameKana: 'サイタマ',
            shippingFirstNameKana: 'タロウ',
            shippingPostalCode: '3670030',
            shippingPrefecture: '埼玉県',
            shippingCity: '埼玉県',
            shippingAddress1: '本庄市早稲田の杜',
            shippingAddress2: 'Akahira Mansion Room 1',
            shippingCompanyName: 'Hokkaido Co., Ltd.',
            shippingDepartmentName: 'Information System Department',
            shippingPhone: '04811100000',
            desiredDeliveryDate: '2023/12/20(Wed)',
            desiredDeliveryTimeZoneId: null,
            isDeliveryBox: false,
            isGift: true,
          },
          affiliateTrackingId: '123ABCdefg456HIJklm789NOPqrs789TUV',
          affiliateVisitDateTime: '2023-10-23T13:32:06Z',
          creditCardTokenList: null,
          httpHeader: null,
        });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });

  describe('checkout Complete 2', () => {
    it('should get order confirmation if the checkout 2 is successful', async () => {
      const CheckOutComplete2Id = '74234354598';
      const response: any = await request(app.getHttpServer())
        .post(`/${CheckOutComplete2Id}/complete2`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send(mockCheckOutComplete2Dto);
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw bad parameters exception when no payment id is passed', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${mockCheckOutComplete2Id}/complete2`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send({ ...mockCheckOutComplete2Dto, paymentId: '' });

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    }, 10000);
    it('should throw not found exception when wrong checkout id is passed', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/12345/complete2`)
        .set({ 'feraapp-api-key': process.env.feraAPP_API_KEY })
        .send(mockCheckOutComplete2Dto);

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    }, 10000);
    it('should throw exception when no api key is passed', async () => {
      const response: any = await request(app.getHttpServer())
        .post(`/${mockCheckOutComplete2Id}/complete2`)
        .send(mockCheckOutComplete2Dto);
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });
});
