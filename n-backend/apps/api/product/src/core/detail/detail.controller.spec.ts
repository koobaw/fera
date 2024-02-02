import request from 'supertest';

import { HttpStatus, INestApplication } from '@nestjs/common';

import { Test, TestingModule } from '@nestjs/testing';
import { GlobalsModule } from '../../globals.module';
import { DetailController } from './detail.controller';
import { DetailService } from './detail.service';
import { DetailMuleApiService } from './detail-mule-api/detail-mule-api.service';

import { ProductDetails } from './interfaces/detail.interface';

describe('DetailController', () => {
  let controller: DetailController;
  let detailService: DetailService;
  let app: INestApplication;
  process.env.CAINZAPP_API_KEY = 'VALID_API_KEY';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [DetailController],
      providers: [
        {
          provide: DetailService,
          useValue: {
            getDetail: jest.fn(),
            saveToFirestore: jest.fn(),
          },
        },
        DetailMuleApiService,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    detailService = module.get<DetailService>(DetailService);
    controller = module.get<DetailController>(DetailController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined method', () => {
    expect(controller.findDetails).toBeDefined();
  });

  describe('findDetails', () => {
    const mockedData: ProductDetails = {
      header: {
        productId: '4549509623410',
        categoryId: null,
        name: 'お掃除ウェットシート　デザインバケツ　本体',
        imageUrls: [
          'https://imgix.cainz.com/4549509623410/product/4549509623410_01.jpg',
          'https://imgix.cainz.com/4549509623410/product/4549509623410_02.jpg',
          'https://imgix.cainz.com/4549509623410/product/4549509623410_03.jpg',
          'https://imgix.cainz.com/4549509623410/product/4549509623410_04.jpg',
          'https://imgix.cainz.com/4549509623410/product/4549509623410_05.jpg',
          'https://imgix.cainz.com/4549509623410/product/4549509623410_06.jpg',
        ],
      },
      detail: {
        productId: '4549509623410',
        departmentCode: '022',
        lineCode: '220',
        classCode: '2202',
        description: null,
        applicableStartDate: '2023-08-03T00:00:00+09:00',
        salesStartDate: null,
        salesEndDate: null,
        salesEndFlag: false,
        consumptionTaxRate: 10,
        consumptionTaxCategory: '0',
        designatedPharmaceuticalCategory: '0',
        liquorCategory: '',
        tobaccoCategory: '',
        hazardousMaterialFlag: false,
        medicalEquipmentClass: '',
        poisonousDeleteriousSubstanceCategory: '',
        poisonousDrugCategory: '',
        agriculturalChemicalCategory: '',
        animalDrugCategory: '',
        warrantyIssuanceCategory: '',
        pharmaceuticalFlag: false,
        salesTypeCategory: '00',
        warrantyCategory: '',
        warrantyPeriod: '',
        deliveryChargeCategoryEc: '2',
        onlineFlagEc: true,
        onlineStartTimeEc: '2019-10-04T09:00:00',
        onlineEndTimeEc: null,
        consumptionTaxCategoryEc: '1',
        onlineSalesCategoryEc: '1',
        individualDeliveryChargeEc: null,
        setProductFlag: false,
        configurationFlag: false,
        customizedProductCategory: null,
        minOrderQuantity: 1,
        maxOrderQuantity: 500,
        stepQuantity: 1,
        storeMinOrderQuantity: 1,
        storeMaxOrderQuantity: 500,
        storeStepOrderQuantity: 1,
        newPeriodFrom: null,
        reserveFromStoreDisabled: true,
        sendToStoreDisabled: true,
        personalDeliveryDisabled: false,
        estimatedArrivalDays: 500,
        productWithServiceFlag: false,
        dropShippingCategory: null,
        largeSizedProductCategoryEc: '0',
        originCountryCode: 'CHN',
        flavorExpirationCategory: '0',
        flavorExpiration: 500,
        productCharacteristics: 'トイレ周りの汚れを拭き取り除菌効果も。',
        colorPattern: '',
        size: '',
        brandName: 'なし',
        singleItemSizeWidth: 22,
        singleItemSizeHeight: 21.5,
        singleItemSizeDepth: 15.5,
        contentAmount: 0,
        contentAmountUnit: '0',
        modelNo: '',
        lawsStandards: '',
        singleItemSize2Width: null,
        singleItemSize2Height: null,
        singleItemSize2Depth: null,
        characterCopyrightNameEc: null,
        longDescription: null,
        cautions: null,
        productSpecGroupId: null,
        similarProduct: null,
        recommendedProduct:
          '4936695758727,4936695415767,4549509779131,4549509488934,4549509414292,4549509623410,4549509415909,4549509670841',
        comparativeProduct: null,
        kukuru: null,
        variation: [],
        faceProductId: null,
        serviceContents: null,
      },
      specCategories: [
        {
          name: 'カラー',
          value: '',
          sortOrder: '01',
        },
        {
          name: '本体サイズ（cm）',
          value: '300mm×200mm',
          sortOrder: '02',
        },
        {
          name: '適応種',
          value: '',
          sortOrder: '03',
        },
        {
          name: '特徴',
          value:
            '●ケージやトイレまわりの清掃に●銀イオン配合●大判、厚手で簡単おそうじ●フローリングワイパーにも使える●犬、猫用●無香料',
          sortOrder: '04',
        },
        {
          name: '用途',
          value: '',
          sortOrder: '05',
        },
        {
          name: '使用方法',
          value:
            '1.バケツの背面側にフタの開け口▼印があります。2.フタの開け方/バケツの背面側のフタの▼印部分を引き上げてください。3.内袋を開き、ロールの中心からシートを1枚引き出してください。(バケツの取っ手はバケツ内に梱包されています。)',
          sortOrder: '06',
        },
        {
          name: '内容量',
          value: '130枚',
          sortOrder: '07',
        },
        {
          name: '入数',
          value: '',
          sortOrder: '08',
        },
        {
          name: '原材料',
          value: '',
          sortOrder: '09',
        },
        {
          name: '使用上の注意',
          value:
            '●本来の用途以外には使用しないでください。●生体には使用しないでください。●お子様の手の届くところ、火気の近く、直射日光の当たるところ、高温になる場所、車内には置かないでください。●中身の乾燥を防ぐため、ご使用後はフタをきちんと閉めてください。',
          sortOrder: '10',
        },
      ],
    };
    it('should be called these method', async () => {
      jest.spyOn(detailService, 'getDetail').mockImplementation(async () => {
        const result: Array<ProductDetails> = [mockedData];
        return result;
      });

      jest.spyOn(detailService, 'saveToFirestore');

      const response = await request(app.getHttpServer())
        .get('/detail/4549509623410')
        .set({ 'cainzapp-api-key': 'VALID_API_KEY' })
        .query({ save: 'true' });

      expect(response.body.code).toBe(HttpStatus.OK);
      expect(detailService.getDetail).toBeCalled();
      expect(detailService.saveToFirestore).toBeCalled();
    });
    it('should be called these method (skip save to firestore)', async () => {
      jest.spyOn(detailService, 'getDetail').mockImplementation(async () => {
        const result: Array<ProductDetails> = [mockedData];
        return result;
      });

      jest.spyOn(detailService, 'saveToFirestore');

      const response = await request(app.getHttpServer())
        .get('/detail/4549509623410')
        .set({ 'cainzapp-api-key': 'VALID_API_KEY' })
        .query({ save: 'false' });

      expect(response.body.code).toBe(HttpStatus.OK);
      expect(detailService.getDetail).toBeCalled();
      expect(detailService.saveToFirestore).not.toBeCalled();
    });
  });
  it('should be return error', async () => {
    process.env.CAINZAPP_API_KEY = 'VALID_API_KEY';

    jest.spyOn(detailService, 'getDetail').mockImplementation(async () => {
      const result = null;
      return result;
    });

    jest.spyOn(detailService, 'saveToFirestore');

    const response = await request(app.getHttpServer())
      .get('/detail/4549509623410')
      .set({ 'cainzapp-api-key': 'VALID_API_KEY' })
      .query({ save: 'false' });

    expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(detailService.getDetail).toBeCalled();
    expect(detailService.saveToFirestore).not.toBeCalled();
  });
});
