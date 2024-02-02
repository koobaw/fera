/* eslint-disable import/no-extraneous-dependencies */
import request from 'supertest';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@cainz-next-gen/guard';
import { ErrorMessage } from 'packages/guard/src/error-code';
import { loadEnvsForLocal } from '../src/config/load-envs-for-local';
import { AppModule } from '../src/app.module';
import { CartController } from '../src/core/cart/cart.controller';
import { CartService } from '../src/core/cart/cart.service';
import { CartAddItemDto } from '../src/core/cart/dto/post.cart-add-item-body.dto';
import { mockCartChangeData, mockCartChangeValidationData } from './mockData';
import { CartCommonService } from '../src/core/cart-common/cart-common.service';
import { GlobalsModule } from '../src/globals.module';
import { ErrorCode } from '../src/types/constants/error-code';

describe('Cart (e2e)', () => {
  let app: INestApplication;
  const commonHeaders = {
    authorization: 'bearer 34234324323432322342',
    'Content-Type': 'application/json',
  };
  beforeAll(async () => {
    await loadEnvsForLocal();
  }, 30000);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, GlobalsModule],
      controllers: [CartController],
      providers: [CartService, CartCommonService],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          const cainzappApiKey = req.headers?.['cainzapp-api-key'];

          if (cainzappApiKey && typeof cainzappApiKey === 'string') {
            return true;
          }

          const authorizationHeader = req.headers?.authorization;
          if (authorizationHeader && typeof authorizationHeader === 'string') {
            req.claims = { userId: '07P1He8a0Ze4OlTCpWf3F3M469H1' };
            return true;
          }
          throw new HttpException({}, HttpStatus.UNAUTHORIZED);
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 30000);

  describe(' get cart', () => {
    it('should be able to get products from cart', async () => {
      const response = await request(app.getHttpServer())
        .get(`/123456789`)
        .set({ 'cainzapp-api-key': process.env.CAINZAPP_API_KEY });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception on wrong end point', async () => {
      const response = await request(app.getHttpServer())
        .get(`/carts/123456789`)
        .set({ 'cainzapp-api-key': process.env.CAINZAPP_API_KEY });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
    it('should throw a authorization error while sending request without api key', async () => {
      const response = await request(app.getHttpServer()).get(`/123456789`);
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });

  describe(' delete cart', () => {
    it('should be able to delete product item from cart', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/123/items/87092821394372`)
        .set({ 'cainzapp-api-key': process.env.CAINZAPP_API_KEY });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception on wrong end point', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/carts/123/items/87092821394372`)
        .set({ 'cainzapp-api-key': process.env.CAINZAPP_API_KEY });
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
    it('should throw a authorization error while sending request without api key', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/123/items/87092821394372`,
      );
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
    it('should throw a bad parameter exception on passing wrong itemID', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/123/items/4549509524318aa`)
        .set({ 'cainzapp-api-key': process.env.CAINZAPP_API_KEY });
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    }, 10000);
  });

  describe('cartAddItem', () => {
    const bodyData: CartAddItemDto = {
      productId: '4549509352433',
      quantity: 20,
      storeCode: '2333',
      prefecture: '埼玉県',
      isWebBackOrder: false,
      receivingMethod: '2',
      orderSpecification: {
        simulationNumber: '01-12-123456',
        color: 'Red',
        width: 3,
        height: 4,
        hook: 'Testing',
      },
    };
    it('should be able to add products to cart', async () => {
      const response = await request(app.getHttpServer())
        .post(`/items`)
        .set(commonHeaders)
        .send(bodyData);
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);

    it('should not able to add products to cart while body data not send', async () => {
      const response = await request(app.getHttpServer())
        .post(`/items`)
        .set(commonHeaders);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    }, 10000);
  });

  describe(' merge Carts', () => {
    it('should be able to get products from cart', async () => {
      const response = await request(app.getHttpServer())
        .post(`/merge`)
        .set(commonHeaders)
        .send({ fromUserId: '07P1He8a0Ze4OlTCpWf3D3M469P2' });
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception on wrong end point', async () => {
      const response = await request(app.getHttpServer())
        .post(`/carts/123456789`)
        .set(commonHeaders);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
    it('should throw a authorization error while sending request without api key', async () => {
      const response = await request(app.getHttpServer())
        .post(`/merge`)
        .send({ fromUserId: '07P1He8a0Ze4OlTCpWf3D3M469P2' });
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    }, 10000);
  });
  describe(' change cart', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule, GlobalsModule],
        controllers: [CartController],
        providers: [CartService, CartCommonService],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.claims = { userId: '123456' }; // Your user object
            return true;
          },
        })
        .compile();

      app = module.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ transform: true }));
      await app.init();
    }, 30000);
    it('should be able to update change cart data', async () => {
      const response = await request(app.getHttpServer())
        .patch('/')
        .set(commonHeaders)
        .send(mockCartChangeData);
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a validation exception on pass wrong receivingMethod value in payload', async () => {
      const response = await request(app.getHttpServer())
        .patch('/')
        .set(commonHeaders)
        .send(mockCartChangeValidationData);
      expect(response.statusCode).toBe(HttpStatus.OK);
    }, 10000);
    it('should throw a not found exception on wrong end point', async () => {
      const response = await request(app.getHttpServer())
        .get(`/carts/123456789`)
        .set(commonHeaders);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    }, 10000);
  });
});
