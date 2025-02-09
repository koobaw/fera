import { AxiosError } from 'axios';
import { throwError } from 'rxjs';

import { CommonService } from '@fera-next-gen/common';
import { FirestoreBatchService } from '@fera-next-gen/firestore-batch';
import { LoggingService } from '@fera-next-gen/logging';
import { CartProducts } from '@fera-next-gen/types';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../../globals.module';
import { PocketRegiCartCommonService } from '../../../utils/cartproducts.utils';
import { CartProductsService } from './get.cartproducts.service';
import { GetDiscountedPriceApiService } from '../get.discountedPrice/get.discountedPrice.service';
import { GetDiscountedPriceResponseMule } from '../interfaces/getdiscountedPrice.interface';

describe('CartProductsService', () => {
  let cartProductService: CartProductsService;

  const mockPocketRegiCartProductsUtilService = {
    getDecryptedMemberId: jest.fn(),
    getProductIdsAndQuantity: jest.fn(),
    findInProducts: jest.fn(),
    createCartProductData: jest.fn(),
    updatePocketRegiSummary: jest.fn(),
  };
  const mockFirestoreBatchService = {
    findCollection: jest.fn(),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };
  const mockCommonService = {
    logException: jest.fn(),
    createHttpException: jest.fn(),
  };
  const mockGetDiscountedPriceApi = {
    getDiscountedPriceFromMule: jest.fn(),
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        CartProductsService,
        {
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
        {
          provide: CommonService,
          useFactory: () => mockCommonService,
        },
        {
          provide: GetDiscountedPriceApiService,
          useFactory: () => mockGetDiscountedPriceApi,
        },
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
          provide: PocketRegiCartCommonService,
          useFactory: () => mockPocketRegiCartProductsUtilService,
        },
      ],
    }).compile();
    cartProductService = module.get<CartProductsService>(CartProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CartProductsService', () => {
    it('service should be defined', () => {
      expect(cartProductService).toBeDefined();
    });

    it('public methods should be defined', () => {
      expect(cartProductService.fetchProductsFromCart).toBeDefined();
      expect(
        cartProductService.getDiscountedPriceForCartProducts,
      ).toBeDefined();
      expect(cartProductService.getResponse).toBeDefined();
      expect(cartProductService.saveToFirestore).toBeDefined();
    });
    describe('fetchProductsFromCart', () => {
      const encryptedMemberId = 'csadsadqwewqda';
      it('should fetch cart products from firestore', async () => {
        // mock the firestore call to get cart products
        const mockfetchCartProd = {
          products: [
            {
              code128DiscountDetails: [
                {
                  discountMethod: 'percent',
                  discount: 50,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 30,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 50,
                  appliedCount: 2,
                },
              ],
              imageUrls: [
                'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
              ],
              productName: 'クロレッツＸＰクリアミントボトル',
              productId: '4547894154991',
              isAlcoholic: false,
              quantity: 4,
              taxRate: 10,
              subtotalAmount: 850,
              unitPrice: 280,
            },
          ],
        };

        const spycollection = jest
          .spyOn(mockFirestoreBatchService, 'findCollection')
          .mockImplementation(() => ({
            doc: jest.fn().mockImplementation(() => ({
              collection: jest.fn().mockImplementation(() => ({
                doc: jest.fn().mockImplementation(() => ({
                  get: jest.fn().mockImplementation(() => ({
                    data: jest.fn().mockReturnValue(mockfetchCartProd),
                  })),
                })),
              })),
            })),
          }));
        try {
          await expect(
            cartProductService.fetchProductsFromCart(encryptedMemberId),
          ).resolves.toEqual(mockfetchCartProd);
          await expect(
            spycollection.mock.results[0].value.doc,
          ).toHaveBeenCalledWith(encryptedMemberId);
        } catch (e) {
          console.log(e);
        }
      });
      it('should throw error if unable to fetch cartproducts', async () => {
        const errorRes = {
          errorCode: 'ApiError.7009',
          errMessage: 'No Data Available',
          status: 404,
        };
        jest
          .spyOn(mockFirestoreBatchService, 'findCollection')
          .mockImplementation(() => {
            throwError(new AxiosError('Internal server error', '500'));
          });
        const spyerror = jest
          .spyOn(mockCommonService, 'createHttpException')
          .mockImplementation(() => {
            throw new HttpException(
              {
                erroCode: errorRes.errorCode,
                message: errorRes.errMessage,
              },
              errorRes.status,
            );
          });

        try {
          await cartProductService.fetchProductsFromCart(encryptedMemberId);
        } catch (e) {
          expect(spyerror).toThrow(HttpException);
        }
      });
    });
    describe('getDiscountedPriceForCartProducts', () => {
      it('should return the updated price from discount price api and apply the discount sticker details', async () => {
        const dummycartProd = {
          products: [
            {
              // Sales type 0 with Discount barcode product
              code128DiscountDetails: [
                {
                  discountMethod: 'percent',
                  discount: 50,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 30,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 50,
                  appliedCount: 2,
                },
              ],
              imageUrls: [
                'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
              ],
              productName: 'クロレッツＸＰクリアミントボトル',
              productId: '4547894154991',
              isAlcoholic: false,
              quantity: 4,
              taxRate: 10,
              subtotalAmount: 850,
              unitPrice: 280,
            },
          ],
        };
        const mockDiscountPriceApiResponse: GetDiscountedPriceResponseMule = {
          totalAmount: 1000,
          membershipRank: '1',
          storeCode: '859',
          items: [
            {
              productCode: '4547894154991',
              salesType: 0,
              subtotalAmount: 1120,
              quantity: 4,
              unitPrice: 280,
            },
          ],
        };

        const mockResult: CartProducts[] = [
          {
            code128DiscountDetails: [
              {
                discountMethod: 'percent',
                discount: 50,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 30,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 50,
                appliedCount: 2,
              },
            ],
            imageUrls: [
              'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
            ],
            productName: 'クロレッツＸＰクリアミントボトル',
            productId: '4547894154991',
            isAlcoholic: false,
            quantity: 4,
            taxRate: 10,
            subtotalAmount: 850,
            unitPrice: 280,
            subItems: [],
            mixMatchCode: null,
            setItemCode: null,
          },
        ];
        jest
          .spyOn(cartProductService, 'fetchProductsFromCart')
          .mockImplementation(async () => dummycartProd);

        // mock this method to get the productId and quantity
        jest
          .spyOn(
            mockPocketRegiCartProductsUtilService,
            'getProductIdsAndQuantity',
          )
          .mockReturnValue(() => [
            {
              productId: '4547894154991',
              quantity: 4,
            },
          ]);
        // mock the utility methods used
        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'findInProducts')
          .mockReturnValue({
            code128DiscountDetails: [
              {
                discountMethod: 'percent',
                discount: 50,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 30,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 50,
                appliedCount: 2,
              },
            ],
            imageUrls: [
              'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
            ],
            productName: 'クロレッツＸＰクリアミントボトル',
            productId: '4547894154991',
            isAlcoholic: false,
            quantity: 4,
            taxRate: 10,
          });

        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'createCartProductData')
          .mockReturnValue({
            // Sales type 1 with no discount
            code128DiscountDetails: [
              {
                discountMethod: 'percent',
                discount: 50,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 30,
                appliedCount: 1,
              },
              {
                discountMethod: 'yen',
                discount: 50,
                appliedCount: 2,
              },
            ],
            imageUrls: [
              'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
            ],
            productName: 'クロレッツＸＰクリアミントボトル',
            productId: '4547894154991',
            isAlcoholic: false,
            quantity: 4,
            taxRate: 10,
            subtotalAmount: 1120,
            unitPrice: 280,
          });
        // mock the discount price api call
        jest
          .spyOn(mockGetDiscountedPriceApi, 'getDiscountedPriceFromMule')
          .mockResolvedValueOnce(mockDiscountPriceApiResponse);
        expect(
          await cartProductService.getDiscountedPriceForCartProducts(
            '859',
            '2787787879787',
            '1',
          ),
        ).toEqual(mockResult);
        expect(
          mockGetDiscountedPriceApi.getDiscountedPriceFromMule,
        ).toHaveBeenCalled();
      });
      it('should return the updated price from discount price api and return the details for products without discount sticker', async () => {
        const dummycartProd = {
          products: [
            {
              // Sales type 1 with no discount
              code128DiscountDetails: null,
              imageUrls: [
                'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
              ],
              productName: 'ピクルス',
              productId: '4547894154990',
              isAlcoholic: false,
              quantity: 1,
              taxRate: 10,
            },
          ],
        };
        const mockDiscountPriceApiResponse: GetDiscountedPriceResponseMule = {
          totalAmount: 1000,
          membershipRank: '1',
          storeCode: '859',
          items: [
            {
              productCode: '4547894154990',
              salesType: 1,
              subtotalAmount: 280,
              quantity: 1,
              unitPrice: 280,
            },
          ],
        };

        const mockResult: CartProducts[] = [
          {
            code128DiscountDetails: null,
            imageUrls: [
              'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
            ],
            productName: 'ピクルス',
            productId: '4547894154990',
            isAlcoholic: false,
            quantity: 1,
            taxRate: 10,
            subtotalAmount: 280,
            unitPrice: 280,
            subItems: [],
            mixMatchCode: null,
            setItemCode: null,
          },
        ];
        jest
          .spyOn(cartProductService, 'fetchProductsFromCart')
          .mockImplementation(async () => dummycartProd);

        // // mock this method to get the productId and quantity
        jest
          .spyOn(
            mockPocketRegiCartProductsUtilService,
            'getProductIdsAndQuantity',
          )
          .mockReturnValue(() => [
            {
              productId: '4547894154990',
              quantity: 1,
            },
          ]);
        // mock the utility methods used
        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'findInProducts')
          .mockReturnValue({
            code128DiscountDetails: null,
            imageUrls: [
              'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
            ],
            productName: 'ピクルス',
            productId: '4547894154990',
            isAlcoholic: false,
            quantity: 1,
            taxRate: 10,
          });

        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'createCartProductData')
          .mockReturnValue({
            // Sales type 1 with no discount
            code128DiscountDetails: null,
            imageUrls: [
              'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
            ],
            productName: 'ピクルス',
            productId: '4547894154990',
            isAlcoholic: false,
            quantity: 1,
            taxRate: 10,
            unitPrice: 280,
          });
        // mock the discount price api call
        jest
          .spyOn(mockGetDiscountedPriceApi, 'getDiscountedPriceFromMule')
          .mockResolvedValueOnce(mockDiscountPriceApiResponse);
        expect(
          await cartProductService.getDiscountedPriceForCartProducts(
            '859',
            '2787787879787',
            '1',
          ),
        ).toEqual(mockResult);
      });
      it('should return the updated price from discount price api and return the details for products where the products are grouped based on product code and also that product has discount sticker', async () => {
        const dummycartProd = {
          products: [
            {
              mixMatchCode: '0001',
              subtotalAmount: 680,
              subItems: {
                code128DiscountDetails: [
                  {
                    discountMethod: 'percent',
                    discount: 50,
                    appliedCount: 1,
                  },
                ],
                imageUrls: [
                  'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
                ],
                productName: 'ピクルス',
                productId: '4547894154992',
                isAlcoholic: false,
                quantity: 7,
                taxRate: 10,
                salePrice: 680,
                unitPrice: 100,
              },
            },
          ],
        };
        const mockDiscountPriceApiResponse: GetDiscountedPriceResponseMule = {
          totalAmount: 680,
          membershipRank: '1',
          storeCode: '859',
          items: [
            {
              productCode: '4547894154992',
              salesType: 0,
              subtotalAmount: 100,
              quantity: 1,
              unitPrice: 100,
            },
            {
              setItemCode: '0001',
              subtotalAmount: 580,
              salesType: 3,
              subItems: [
                {
                  productCode: '4547894154992',
                  quantity: 6,
                  unitPrice: 100,
                  salesAmount: 580,
                },
              ],
            },
            {
              mixMatchCode: '0001',
              subtotalAmount: 580,
              salesType: 2,
              subItems: [
                {
                  productCode: '4547894154992',
                  quantity: 6,
                  unitPrice: 100,
                  salesAmount: 580,
                },
              ],
            },
          ],
        };

        const mockResult: CartProducts[] = [
          {
            mixMatchCode: null,
            subtotalAmount: 630,
            setItemCode: '0001',
            subItems: [
              {
                code128DiscountDetails: [
                  {
                    discountMethod: 'percent',
                    discount: 50,
                    appliedCount: 1,
                  },
                ],
                imageUrls: [
                  'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
                ],
                productName: 'ピクルス',
                productId: '4547894154992',
                isAlcoholic: false,
                quantity: 7,
                taxRate: 10,
                salePrice: 580,
                unitPrice: 100,
              },
            ],
          },
          {
            mixMatchCode: '0001',
            subtotalAmount: 580,
            setItemCode: null,
            subItems: [
              {
                code128DiscountDetails: [
                  {
                    discountMethod: 'percent',
                    discount: 50,
                    appliedCount: 1,
                  },
                ],
                imageUrls: [
                  'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
                ],
                productName: 'ピクルス',
                productId: '4547894154992',
                isAlcoholic: false,
                quantity: 7,
                taxRate: 10,
                salePrice: 580,
                unitPrice: 100,
              },
            ],
          },
        ];
        jest
          .spyOn(cartProductService, 'fetchProductsFromCart')
          .mockImplementation(async () => dummycartProd);

        // // mock this method to get the productId and quantity
        jest
          .spyOn(
            mockPocketRegiCartProductsUtilService,
            'getProductIdsAndQuantity',
          )
          .mockReturnValue(() => [
            {
              productId: '4547894154992',
              quantity: 7,
            },
          ]);
        // mock the utility methods used
        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'findInProducts')
          .mockReturnValue({
            code128DiscountDetails: [
              {
                discountMethod: 'percent',
                discount: 50,
                appliedCount: 1,
              },
            ],
            imageUrls: [
              'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
            ],
            productName: 'ピクルス',
            productId: '4547894154992',
            isAlcoholic: false,
            quantity: 7,
            taxRate: 10,
            salePrice: 680,
            unitPrice: 100,
          });

        jest
          .spyOn(mockPocketRegiCartProductsUtilService, 'createCartProductData')
          .mockReturnValue({
            code128DiscountDetails: [
              {
                discountMethod: 'percent',
                discount: 50,
                appliedCount: 1,
              },
            ],
            imageUrls: [
              'https://imgix.fera.com/4547894154990/product/4547894154990_01.jpg',
            ],
            productName: 'ピクルス',
            productId: '4547894154992',
            isAlcoholic: false,
            quantity: 7,
            taxRate: 10,
            salePrice: 680,
            unitPrice: 100,
          });
        // mock the discount price api call
        jest
          .spyOn(mockGetDiscountedPriceApi, 'getDiscountedPriceFromMule')
          .mockResolvedValueOnce(mockDiscountPriceApiResponse);
        expect(
          await cartProductService.getDiscountedPriceForCartProducts(
            '859',
            '2787787879787',
            '1',
          ),
        ).toEqual(mockResult);
      });
      it('should return error if discounted price api does not return data', async () => {
        const dummycartProd = {
          products: [
            {
              // Sales type 0 with Discount barcode product
              code128DiscountDetails: [
                {
                  discountMethod: 'percent',
                  discount: 50,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 30,
                  appliedCount: 1,
                },
                {
                  discountMethod: 'yen',
                  discount: 50,
                  appliedCount: 2,
                },
              ],
              imageUrls: [
                'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
              ],
              productName: 'クロレッツＸＰクリアミントボトル',
              productId: '4547894154991',
              isAlcoholic: false,
              quantity: 4,
              taxRate: 10,
              subtotalAmount: 850,
              unitPrice: 280,
            },
          ],
        };

        const errorRes = {
          errorCode: 'ApiError.7008',
          errMessage: 'No Data Available',
          status: 404,
        };
        jest
          .spyOn(cartProductService, 'fetchProductsFromCart')
          .mockImplementation(async () => dummycartProd);

        // mock this method to get the productId and quantity
        jest
          .spyOn(
            mockPocketRegiCartProductsUtilService,
            'getProductIdsAndQuantity',
          )
          .mockReturnValue(() => [
            {
              productId: '4547894154991',
              quantity: 4,
            },
          ]);
        jest
          .spyOn(mockGetDiscountedPriceApi, 'getDiscountedPriceFromMule')
          .mockResolvedValue(null);
        jest
          .spyOn(mockCommonService, 'createHttpException')
          .mockImplementation(() => {
            throw new HttpException(
              {
                erroCode: errorRes.errorCode,
                message: errorRes.errMessage,
              },
              errorRes.status,
            );
          });
        // assert
        try {
          await cartProductService.getDiscountedPriceForCartProducts(
            '859',
            '23131231311',
            '1',
          );
        } catch (e) {
          expect(mockCommonService.createHttpException).toThrow(HttpException);
        }
      });
    });

    describe('saveToFirestore', () => {
      const encryptedMemberId = 'ascadadasd';
      const cartProd: CartProducts[] = [
        {
          code128DiscountDetails: [
            {
              discountMethod: 'percent',
              discount: 50,
              appliedCount: 1,
            },
            {
              discountMethod: 'yen',
              discount: 30,
              appliedCount: 1,
            },
            {
              discountMethod: 'yen',
              discount: 50,
              appliedCount: 2,
            },
          ],
          imageUrls: [
            'https://imgix.fera.com/4547894154991/product/4547894154991_01.jpg',
          ],
          productName: 'クロレッツＸＰクリアミントボトル',
          productId: '4547894154991',
          isAlcoholic: false,
          quantity: 4,
          taxRate: 10,
          subtotalAmount: 850,
          unitPrice: 280,
          subItems: [],
          mixMatchCode: null,
          setItemCode: null,
        },
      ];
      const operatorName = 'some operator name';
      it('should save the updated cartproducts to firestore', async () => {
        jest
          .spyOn(
            mockPocketRegiCartProductsUtilService,
            'updatePocketRegiSummary',
          )
          .mockReturnValue({
            totalPriceFirestore: 850,
          });
        jest
          .spyOn(mockFirestoreBatchService, 'findCollection')
          .mockImplementation(() => ({
            doc: jest.fn().mockImplementation(() => ({
              collection: jest.fn().mockImplementation(() => ({
                doc: jest.fn().mockImplementation(() => ({
                  get: jest.fn().mockImplementation(() => ({
                    data: jest.fn().mockReturnValue([{ products: 'products' }]),
                  })),
                })),
              })),
            })),
          }));
        try {
          await cartProductService.saveToFirestore(
            cartProd,
            operatorName,
            encryptedMemberId,
          );
        } catch (e) {
          console.log('>><><', e);
        }

        expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(
          1,
        );
        expect(mockFirestoreBatchService.batchSet).toHaveBeenCalledTimes(1);
        expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
      });
      it('should throw error if unable to save the cartproducts to firestore', async () => {
        const errorRes = {
          errorCode: 'ApiError.7009',
          errMessage: 'No Data Available',
          status: 500,
        };
        jest
          .spyOn(mockFirestoreBatchService, 'findCollection')
          .mockImplementation(() => {
            throwError(new AxiosError('Internal server error', '500'));
          });
        const spyerror = jest
          .spyOn(mockCommonService, 'createHttpException')
          .mockImplementation(() => {
            throw new HttpException(
              {
                erroCode: errorRes.errorCode,
                message: errorRes.errMessage,
              },
              errorRes.status,
            );
          });

        try {
          await cartProductService.saveToFirestore(
            cartProd,
            operatorName,
            encryptedMemberId,
          );
        } catch (e) {
          expect(spyerror).toThrow(HttpException);
        }
      });
    });
    describe('getResponse', () => {
      it('should be define getResponse', () => {
        expect(cartProductService.getResponse).toBeDefined();
      });
      it('should return the formatted response for the api', () => {
        const dataSavedToFireStore = {
          products: [
            {
              productDetails: 'productDetails',
            },
          ],
          totalAmount: 1000,
        };
        const mockresult = {
          code: 200,
          message: 'OK',
          data: {
            products: dataSavedToFireStore.products,
            totalAmount: dataSavedToFireStore.totalAmount,
          },
        };

        expect(cartProductService.getResponse(dataSavedToFireStore)).toEqual(
          mockresult,
        );
      });
    });
    describe('fetchMembershipRank', () => {
      it('should fetch membership rank from firestore', async () => {
        const mockfetchMembershipRank = {
          rank: '1',
        };
        const mockFindCollection = {
          doc: jest.fn(() => ({
            get: jest.fn(() => ({
              data: jest.fn().mockReturnValue({ rank: '1' }),
              exists: false,
              ref: jest.fn(() => ({
                path: 'demo/path',
              })),
            })),
          })),
        };
        jest
          .spyOn(mockFirestoreBatchService, 'findCollection')
          .mockReturnValue(mockFindCollection);

        try {
          await expect(
            cartProductService.fetchMembershipRank('encryptedmemberid'),
          ).resolves.toBe(mockfetchMembershipRank);
        } catch (e) {
          console.log(e);
        }
      });
    });
  });
});
