import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { AuthGuard } from '@cainz-next-gen/guard';
import { CommonService } from '@cainz-next-gen/common';
import { GlobalsModule } from '../../globals.module';
import { CartProductsController } from './cartproducts.controller';
import { AddProductDetailService } from './add.cartproducts/add.cartproducts.service';
import { UpdateProductQuantityService } from './update.cartproducts/update.cartproducts.service';
import { DeleteProductService } from './delete.cartproducts/delete.cartproducts.service';
import { CartProductsService } from './get.cartproducts/get.cartproducts.service';
import { GetMembershipRank } from '../../utils/membershipRank/membershiprank.utils';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp().getRequest();
    http.claims = {
      userId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
      encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
    };
    return true; // always allow
  }
}
describe('CartProductController', () => {
  let controller: CartProductsController;
  let addProductDetailService: AddProductDetailService;
  let app: INestApplication;
  let updateProductQuantityService: UpdateProductQuantityService;
  let deleteProductService: DeleteProductService;
  let mockClaims;
  let mockGetProductRequest;
  let mockUpdateProductRequest;
  let mockDeleteProductRequest;
  let mockProductId;
  let mockqty;
  const mockAuthGuard = new MockAuthGuard();
  const mockCartProductsService = {
    getDiscountedPriceForCartProducts: jest.fn(),
    getResponse: jest.fn(),
    saveToFirestore: jest.fn(),
    fetchMembershipRank: jest.fn(),
  };
  const mockCommonService = {
    createFirestoreSystemName: jest.fn(),
  };
  const mockGetMembershipRankService = {
    getMembershipRank: jest.fn(),
  };
  beforeEach(async () => {});

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [CartProductsController],
      providers: [
        {
          provide: CartProductsService,
          useFactory: () => mockCartProductsService,
        },
        {
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
        {
          provide: AddProductDetailService,
          useFactory: () => ({
            fetchProductDetails: jest.fn(),
          }),
        },
        {
          provide: UpdateProductQuantityService,
          useFactory: () => ({
            updateCartProduct: jest.fn(),
          }),
        },
        {
          provide: DeleteProductService,
          useFactory: () => ({
            deleteCartProduct: jest.fn(),
          }),
        },
        {
          provide: GetMembershipRank,
          useFactory: () => mockGetMembershipRankService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<CartProductsController>(CartProductsController);
    addProductDetailService = module.get<AddProductDetailService>(
      AddProductDetailService,
    );
    updateProductQuantityService = module.get<UpdateProductQuantityService>(
      UpdateProductQuantityService,
    );
    deleteProductService =
      module.get<DeleteProductService>(DeleteProductService);
    mockClaims = {
      encryptedMemberId: 'pk6fe0d9ead469eb5eb617d5119e108cb',
    };
    mockGetProductRequest = {
      headers: {
        authorization:
          'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBiYmQyOTllODU2MmU3MmYyZThkN2YwMTliYTdiZjAxMWFlZjU1Y2EiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUtRVjJBUmg2eFVjY0lTZmdKWDhyMzIxdExCY0p5anlqZGVtZXNYX2xGMXVsOXkzRE9td1cuMmxLelIzN01McGVxMS43QTRNczNOWW9DbXY2VkJoeEtnN25icFIiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbjRieEo0MGd1TVpVUWZLRC5PaUJNZ3ptTHJ5bVhHSXJpcDBTMTUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6IjZmZTBkOWVhZDQ2OWViNWViNjE3ZDUxMTllMTA4Y2JiZWI0YjZhNjkxMTRlMzJlNzlhNDIwOGE5MGNjYmI0MDUiLCJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1ZCI6ImNhaW56LWNhaW56YXBwLWJhY2tlbmQtZGV2IiwiYXV0aF90aW1lIjoxNjk5OTQ0MTM1LCJ1c2VyX2lkIjoiZ2VJanhQbVdoQmJOazE4bmE1ZVdKa3I3Qkh1MiIsInN1YiI6ImdlSWp4UG1XaEJiTmsxOG5hNWVXSmtyN0JIdTIiLCJpYXQiOjE3MDExNTcxMzIsImV4cCI6MTcwMTE2MDczMiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.FdwLO5qQSxTDVbsV7WbW1EKEwESIK7u32FzAI7hLP7cdTsQGiOiqmNmPtaxHNSTrJ-T7EBbgxYkl8eHrxhs4kfqxFNOQeheasoo3ZhjmX-EjcNBSwdV3pzYNGH1XG8Ynfj7VLb5fRVPGyWOZRj4cnuywFoi0he7-OleDfnmZ-jnrSldslFTResOQhvD6PRWUq_4VEmzmO42iBdB6nY548nd7ukOPWLiS6idUGLjrR3TjuD4S9DpA8vJnuQj777ojJaZZrhWs_i68yu8fc4pfXmjA9wKQWB-v0JmT4SjB0uNgF0ZRMKQUIhRGpO4UMRr3mCO0G7exSKyz7SJhe5qxFQ',
      },
      body: {
        productId: '45478954991',
        storeCode: '777',
        membershipRank: '4',
        stickerDiscountCode: '',
      },
      claims: mockClaims,
    };
    mockUpdateProductRequest = {
      params: {
        productId: '45478954991',
        quantity: 2,
      },
      claims: mockClaims,
    };

    mockDeleteProductRequest = {
      params: {
        productId: '45478954991',
      },
      claims: mockClaims,
    };

    mockProductId = {
      productId: '45478954991',
    };

    mockqty = {
      quantity: 2,
    };
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined methods', () => {
    expect(controller.getProductDetail).toBeDefined();
    expect(controller.updateProductQuantity).toBeDefined();
    expect(controller.deleteProduct).toBeDefined();
  });

  describe('getProductsInCart', () => {
    it('should call the service methods and return status code 200 when updatemembershiprank flag is not passed from front end', async () => {
      // Create a mock Request object
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'EncryptedMemberId',
        },
        // Add any other properties you need for the test
      };
      // Make a POST request to trigger the route handler
      await request(app.getHttpServer())
        .get('/cart-products')
        .set(
          'Authorization',
          `Bearer ${mockRequest}`, // Replace with your actual auth token
        )
        .query({ storeCode: '859' })
        .send({
          message: {
            data: '',
          },
        })
        .expect(200);
      // Assuming a successful response
      expect(mockCartProductsService.fetchMembershipRank).toBeCalled();
      expect(mockCommonService.createFirestoreSystemName).toBeCalled();
      expect(
        mockCartProductsService.getDiscountedPriceForCartProducts,
      ).toBeCalled();
      expect(mockCartProductsService.saveToFirestore).toBeCalled();
      expect(mockCartProductsService.getResponse).toBeCalled();
    });
    it('should call the service methods and return status code 200 when updatemembershiprank flag is passed from front end and make the api call with updated membership rank', async () => {
      // Create a mock Request object
      const mockRequest: any = {
        claims: {
          userId: 'UserId',
          encryptedMemberId: 'EncryptedMemberId',
        },
        // Add any other properties you need for the test
      };
      jest
        .spyOn(mockGetMembershipRankService, 'getMembershipRank')
        .mockReturnValue({ rank: '1' });
      // Make a POST request to trigger the route handler
      await request(app.getHttpServer())
        .get('/cart-products')
        .set(
          'Authorization',
          `Bearer ${mockRequest}`, // Replace with your actual auth token
        )
        .query({ storeCode: '859', updateMembershipRank: 'true' })
        .send({
          message: {
            data: '',
          },
        })
        .expect(200);
      // Assuming a successful response
      expect(
        mockGetMembershipRankService.getMembershipRank,
      ).toHaveBeenCalledTimes(1);
      expect(mockCommonService.createFirestoreSystemName).toBeCalled();
      expect(
        mockCartProductsService.getDiscountedPriceForCartProducts,
      ).toBeCalled();
      expect(mockCartProductsService.saveToFirestore).toBeCalled();
      expect(mockCartProductsService.getResponse).toBeCalled();
    });
  });

  describe('call get product details', () => {
    const expectedResult = {
      code: 201,
      message: 'ok',
      data: {
        productId: '45478954991',
        stickerDiscountCode: null,
        productName: 'クロレッツＸＰクリアミントボトル',
        imageUrls: [
          'https://imgix.cainz.com/4547894154991/product/4547894154991_01.jpg',
          'https://imgix.cainz.com/4547894154991/product/4547894154991_02.jpg',
          'https://imgix.cainz.com/4547894154991/product/4547894154991_03.jpg',
          'https://imgix.cainz.com/4547894154991/product/4547894154991_04.jpg',
          'https://imgix.cainz.com/4547894154991/product/4547894154991_05.jpg',
          'https://imgix.cainz.com/4547894154991/product/4547894154991_06.jpg',
        ],
        quantity: 1,
        taxRate: 8,
        priceIncludingTax: 698,
        salePriceIncludingTax: 528,
        isAlcoholic: false,
        code128DiscountDetails: null,
      },
      requestId: '2936cbd0-6a2f-432c-848c-7686f5d368a0',
      timestamp: '2023-11-27T21:39:20+09:00',
    };

    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .post('/cart-products')
        .send(mockGetProductRequest);
      expect(response.statusCode).toBe(HttpStatus.CREATED);
      jest
        .spyOn(addProductDetailService, 'fetchProductDetails')
        .mockResolvedValue(expectedResult);
      const result = await controller.getProductDetail(
        mockGetProductRequest,
        mockGetProductRequest.headers.authorization,
      );
      expect(result).toBe(expectedResult);
      expect(addProductDetailService.fetchProductDetails).toBeCalled();
    });
  });

  describe('call update cart product', () => {
    const expectedResult = {
      code: 200,
      message: 'OK',
    };
    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/cart-products/?productId=${4547894154991}&quantity=${2}`)
        .set(
          'Authorization',
          'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNWM1ZTlmNTdjOWI2NDYzYzg1ODQ1YTA4OTlhOWQ0MTI5MmM4YzMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUY4X09qZ3NtdjVHWWhGVlBoZVVRbmx5d05YcVR0Ykd1V1R3eVNmVld1NEU3Y1NETmxNdFkxbEhXZmxtTm0xb3hCQ2JaVm4uNFpaazhRYWdvRFl0bFZ1QkhUcUMiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbFcuakxVY2FLeDNEX3FhS3ZZaG9OWHNLcHRoRkpsVHFxTmZJbHUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkFTWmpWS0ptNG1uNzlLOCtRTUszUVU9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTk4NzY2MiwidXNlcl9pZCI6IjFPdFFYemNabWZoOWV5SklxYUdEMk9jajdwSjIiLCJzdWIiOiIxT3RRWHpjWm1maDlleUpJcWFHRDJPY2o3cEoyIiwiaWF0IjoxNjk1OTg3NzA3LCJleHAiOjE2OTU5OTEzMDcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.vyd1vOQAjxhYP8AMUio1rQkbRCT_yZWNJ-odH5ouDiHlVfCeGx2TkVp6gT1wo71b5KyV9KlN8Q2OTEaEUOGsDyNUADBPEJlcKXiFLc_IG0d_mVCC7hPBrea1-RUlO0fyhqOXjL4yw1z8pVO4d222AFilhG985mS4qZA0y97SHKU_jx437w2n6Bs1nrQ_3znubqn9yt25rVUFbKuBnxBz_AGkbTnpYrPiZzycQsQ5MApQ81vAAXArNPkU3DdDV_QxadVyVrhRxajLOIkkE5ew_0ocXzrb3R1x-TRWsu9zA_aUfwGZebdCZAPiAVc9M7a2UtMZVKQ4Yy0rrbp9kAT4AQ',
        )
        .send(mockUpdateProductRequest);
      expect(response.statusCode).toBe(HttpStatus.OK);
      jest
        .spyOn(updateProductQuantityService, 'updateCartProduct')
        .mockResolvedValue(expectedResult);
      const result = await controller.updateProductQuantity(
        mockProductId,
        mockqty,
        mockClaims,
      );
      expect(result).toBe(expectedResult);
      expect(updateProductQuantityService.updateCartProduct).toBeCalled();
    });
  });

  describe('call delete cart product', () => {
    const expectedResult = {
      code: 200,
      message: 'OK',
    };
    it('should call the service method', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/cart-products/?productId=${4946842521814}`)
        .set(
          'Authorization',
          'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFkNWM1ZTlmNTdjOWI2NDYzYzg1ODQ1YTA4OTlhOWQ0MTI5MmM4YzMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NUb2tlbiI6IjAwRE8wMDAwMDA1NENBRCFBUnNBUUY4X09qZ3NtdjVHWWhGVlBoZVVRbmx5d05YcVR0Ykd1V1R3eVNmVld1NEU3Y1NETmxNdFkxbEhXZmxtTm0xb3hCQ2JaVm4uNFpaazhRYWdvRFl0bFZ1QkhUcUMiLCJyZWZyZXNoVG9rZW4iOiI1QWVwODYxMTBLQ2pVRFZWaDBpbmJQVEN6ejNXODlHVUhVRHRCd2lETUtpdnlBRWpVbFcuakxVY2FLeDNEX3FhS3ZZaG9OWHNLcHRoRkpsVHFxTmZJbHUiLCJlbmNyeXB0ZWRNZW1iZXJJZCI6Ik5ZOFJOVkRzRWFOUUxrUnRIMUx2dkFTWmpWS0ptNG1uNzlLOCtRTUszUVU9IiwicHJvdmlkZXJfaWQiOiJhbm9ueW1vdXMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FpbnotY2FpbnphcHAtYmFja2VuZC1kZXYiLCJhdWQiOiJjYWluei1jYWluemFwcC1iYWNrZW5kLWRldiIsImF1dGhfdGltZSI6MTY5NTk4NzY2MiwidXNlcl9pZCI6IjFPdFFYemNabWZoOWV5SklxYUdEMk9jajdwSjIiLCJzdWIiOiIxT3RRWHpjWm1maDlleUpJcWFHRDJPY2o3cEoyIiwiaWF0IjoxNjk1OTg3NzA3LCJleHAiOjE2OTU5OTEzMDcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiYW5vbnltb3VzIn19.vyd1vOQAjxhYP8AMUio1rQkbRCT_yZWNJ-odH5ouDiHlVfCeGx2TkVp6gT1wo71b5KyV9KlN8Q2OTEaEUOGsDyNUADBPEJlcKXiFLc_IG0d_mVCC7hPBrea1-RUlO0fyhqOXjL4yw1z8pVO4d222AFilhG985mS4qZA0y97SHKU_jx437w2n6Bs1nrQ_3znubqn9yt25rVUFbKuBnxBz_AGkbTnpYrPiZzycQsQ5MApQ81vAAXArNPkU3DdDV_QxadVyVrhRxajLOIkkE5ew_0ocXzrb3R1x-TRWsu9zA_aUfwGZebdCZAPiAVc9M7a2UtMZVKQ4Yy0rrbp9kAT4AQ',
        )
        .send(mockDeleteProductRequest);
      expect(response.statusCode).toBe(HttpStatus.OK);
      jest
        .spyOn(deleteProductService, 'deleteCartProduct')
        .mockResolvedValue(expectedResult);
      const result = await controller.deleteProduct(mockProductId, mockClaims);
      expect(result).toBe(expectedResult);
      expect(deleteProductService.deleteCartProduct).toBeCalled();
    });
  });
});
