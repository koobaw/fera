import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { LoggingService } from '@cainz-next-gen/logging';
import { Test, TestingModule } from '@nestjs/testing';

import { GlobalsModule } from '../../globals.module';
import { DetailService } from './detail.service';
import { DetailMuleApiService } from './detail-mule-api/detail-mule-api.service';
import { DetailDto } from './dto/detail.dto';
import { ProductDetails } from './interfaces/detail.interface';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';

describe('DetailService', () => {
  let service: DetailService;
  let detailMuleApiService: DetailMuleApiService;

  const mockFirestoreBatchService = {
    findCollection: jest.fn(() => ({
      doc: jest.fn(),
    })),
    batchSet: jest.fn(),
    batchDelete: jest.fn(),
    batchCommit: jest.fn(),
    getTotalOperationCnt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        DetailService,
        DetailMuleApiService,
        {
          provide: FirestoreBatchService,
          useValue: mockFirestoreBatchService,
        },
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<DetailService>(DetailService);
    detailMuleApiService =
      module.get<DetailMuleApiService>(DetailMuleApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined method', () => {
    expect(service.getDetail).toBeDefined();
    expect(service.saveToFirestore).toBeDefined();
  });

  describe('getDetail', () => {
    it('should be called api', async () => {
      const detailDto: DetailDto = {
        productIds: ['4549509623410'],
      };
      const muleResponse: Array<unknown> = [
        {
          code: '4549509623410',
          name: 'お掃除ウェットシート　デザインバケツ　本体',
          cost: 643.0,
          price: 1180,
          departmentCode: '022',
          lineCode: '220',
          classCode: '2202',
          description: null,
          applicableStartDate: '20230803',
          salesStartDate: null,
          consumptionTaxRate: 10,
          consumptionTaxCategory: '0',
          salesEndDate: null,
          salesEndFlag: '',
          designatedPharmaceuticalCategory: '0',
          liquorCategory: '',
          tobaccoCategory: '',
          hazardousMaterialFlag: '',
          medicalEquipmentClass: '',
          poisonousDeleteriousSubstanceCategory: '',
          poisonousDrugCategory: '',
          agriculturalChemicalCategory: '',
          animalDrugCategory: '',
          warrantyIssuanceCategory: '0',
          pharmaceuticalFlag: '',
          salesTypeCategory: '00',
          warrantyCategory: '',
          warrantyPeriod: '',
          deliveryChargeCategoryEc: '2',
          onlineFlagEc: '1',
          onlineStartTimeEc: '2019-10-04T09:00:00',
          onlineEndTimeEc: null,
          consumptionTaxCategoryEc: '1',
          onlineSalesCategoryEc: '1',
          individualDeliveryChargeEc: null,
          setProductFlag: '0',
          configurationFlag: '0',
          customizedProductCategory: null,
          minOrderQuantity: 1,
          maxOrderQuantity: 500,
          stepQuantity: 1,
          storeMinOrderQuantity: 1,
          storeMaxOrderQuantity: 500,
          storeStepOrderQuantity: 1,
          newPeriodFrom: null,
          reserveFromStoreDisabled: '1',
          sendToStoreDisabled: '1',
          personalDeliveryDisabled: '0',
          estimatedArrivalDays: null,
          productWithServiceFlag: null,
          dropShippingCategory: null,
          largeSizedProductCategoryEc: '0',
          vendorCode: '',
          representativeSupplierCode: '460311',
          distributionTypeCategory: '',
          deliveryTypeCategory: '1',
          pickingListIssuanceCategory: '0',
          orderingUnitIndex1: 4,
          orderingUnitIndex2: null,
          orderingUnitIndex3: null,
          orderingUnitIndex4: null,
          orderingUnitIndex5: null,
          minimumOrderQuantity: 4,
          distributionComments: '',
          shippingLot: 0,
          packingFormCategory: '1',
          onlineOrderCategoryOnProductArrival: '5',
          numberOfBoxes: null,
          receivingLimitDays: null,
          shippingLimitDays: null,
          distributionExtensionItem1: null,
          shippingManagementPartNumber: null,
          salesProcessingJanCode: null,
          productGroupCode: '18023040000',
          productNameInKanji: 'お掃除ウェットシート　デザインバケツ　本体',
          prodcutNameInKatakana: 'ｵｿｳｼﾞｳｪｯﾄｼｰﾄ ﾃﾞｻﾞｲﾝﾊﾞｹﾂ ﾎ',
          productShortNameInKanji: 'お掃除ウェットシート　デザインバケツ　本体',
          productShortNameInKatakana: 'ｵｿｳｼﾞｳｪｯﾄｼｰﾄ ﾃﾞｻﾞｲﾝﾊﾞｹﾂ ﾎ',
          popProductName: '',
          productClassificationCodeName1: '',
          productClassificationCodeName2: '',
          productClassificationCodeName3: '',
          productClassificationCodeName4: '',
          productClassificationCodeName5: '',
          pbCategory: '2',
          representativeJanCode: '4549509623410',
          pbCategory2: '0',
          productClassificationCode1: '4',
          productClassificationCode2: '08',
          productClassificationCode3: '022',
          productClassificationCode4: '220',
          productClassificationCode5: '2202',
          ecProductNameEc:
            'Pet’sOne お掃除シート Ag デザインバケツ本体 犬猫用 無香料 130枚',
          searchKeywordListHigh: null,
          searchKeywordListMiddle:
            'ペットケア用品, 犬トイレタリー, ウェットティッシュ, ウェットシート, タオル',
          searchKeywordListLow:
            '130枚,4549509623410,Ag+,お掃除ウェットシート,お掃除シート,ウェットシート・タオル,ウェットティッシュ,デザインバケツ,トイレ周りの汚れを拭き取り除菌効果も。,ペットケア用品,ペットシーツ・トイレ,本体,犬トイレタリー,犬・猫用',
          mainCategory: '152412：ウェットシート・タオル',
          originCountryCode: 'CHN',
          flavorExpirationCategory: '0',
          flavorExpiration: 0,
          productCharacteristics: 'トイレ周りの汚れを拭き取り除菌効果も。',
          colorPattern: '',
          size: '',
          brandName: 'なし',
          singleItemSizeWidth: 22.0,
          singleItemSizeHeight: 21.5,
          singleItemSizeDepth: 15.5,
          contentAmount: 0,
          contentAmountUnit: '0',
          modelNo: '',
          lawsStandards: '',
          singleItemSize2Width: null,
          singleItemSize2Height: null,
          singleItemSize2Depth: null,
          specCategoryName01: 'カラー',
          specCategoryValue01: '',
          specCategoryName02: '本体サイズ（cm）',
          specCategoryValue02: '300mm×200mm',
          specCategoryName03: '適応種',
          specCategoryValue03: '',
          specCategoryName04: '特徴',
          specCategoryValue04:
            '●ケージやトイレまわりの清掃に●銀イオン配合●大判、厚手で簡単おそうじ●フローリングワイパーにも使える●犬、猫用●無香料',
          specCategoryName05: '用途',
          specCategoryValue05: '',
          specCategoryName06: '使用方法',
          specCategoryValue06:
            '1.バケツの背面側にフタの開け口▼印があります。2.フタの開け方/バケツの背面側のフタの▼印部分を引き上げてください。3.内袋を開き、ロールの中心からシートを1枚引き出してください。(バケツの取っ手はバケツ内に梱包されています。)',
          specCategoryName07: '内容量',
          specCategoryValue07: '130枚',
          specCategoryName08: '入数',
          specCategoryValue08: '',
          specCategoryName09: '原材料',
          specCategoryValue09: '',
          specCategoryName10: '使用上の注意',
          specCategoryValue10:
            '●本来の用途以外には使用しないでください。●生体には使用しないでください。●お子様の手の届くところ、火気の近く、直射日光の当たるところ、高温になる場所、車内には置かないでください。●中身の乾燥を防ぐため、ご使用後はフタをきちんと閉めてください。',
          characterCopyrightNameEc: null,
          longDescription: null,
          cautions: null,
          productSpecGroupId: null,
          similarProduct: null,
          recommendedProduct:
            '4936695758727,4936695415767,4549509779131,4549509488934,4549509414292,4549509623410,4549509415909,4549509670841',
          comparativeProduct: null,
          kukuru: null,
          variationId01: null,
          variationId02: null,
          variationId03: null,
          variationId04: null,
          variationId05: null,
          variation01: null,
          variation02: null,
          variation03: null,
          variation04: null,
          variation05: null,
          faceProductId: null,
          serviceContents: null,
        },
      ];

      const expectedData: Array<ProductDetails> = [
        {
          header: {
            productId: '4549509623410',
            name: 'お掃除ウェットシート　デザインバケツ　本体',
            categoryId: null,
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
        },
      ];

      jest
        .spyOn(detailMuleApiService, 'getDetailFromMule')
        .mockImplementation(async () => muleResponse);
      const mockedData = await service.getDetail(detailDto);
      expect(detailMuleApiService.getDetailFromMule).toHaveBeenCalled();
      expect(mockedData).toEqual(expectedData);
    });

    it('should be thrown error', async () => {
      const detailDto: DetailDto = {
        productIds: ['4549509623410'],
      };
      const muleResponse: Array<unknown> = [];
      jest
        .spyOn(detailMuleApiService, 'getDetailFromMule')
        .mockImplementation(async () => muleResponse);

      await expect(service.getDetail(detailDto)).rejects.toThrow(
        ErrorMessage[ErrorCode.DETAIL_NG_NOT_FOUND],
      );
      expect(detailMuleApiService.getDetailFromMule).toHaveBeenCalled();
    });
  });

  describe('saveToFirestore', () => {
    const operatorName = 'some Operator';
    const mockedData: Array<ProductDetails> = [
      {
        header: {
          productId: '4549509623410',
          name: 'お掃除ウェットシート　デザインバケツ　本体',
          categoryId: null,
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
      },
    ];

    it('should be call these methods', async () => {
      // mock

      const batchSetProduct = jest
        .spyOn(service, <never>'batchSetProduct')
        .mockImplementation();
      const batchSetProductDetail = jest
        .spyOn(service, <never>'batchSetProductDetail')
        .mockImplementation();
      const batchSetSpecCategories = jest
        .spyOn(service, <never>'batchSetSpecCategories')
        .mockImplementation();

      await service.saveToFirestore(mockedData, operatorName);
      expect(batchSetProduct).toHaveBeenCalledTimes(1);
      expect(batchSetProductDetail).toHaveBeenCalledTimes(1);
      expect(batchSetSpecCategories).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
    });

    it('should be skip save detail and specCategories', async () => {
      // mock

      const batchSetProduct = jest
        .spyOn(service, <never>'batchSetProduct')
        .mockImplementation();
      const batchSetProductDetail = jest
        .spyOn(service, <never>'batchSetProductDetail')
        .mockImplementation();
      const batchSetSpecCategories = jest
        .spyOn(service, <never>'batchSetSpecCategories')
        .mockImplementation();

      await service.saveToFirestore(mockedData, operatorName, false);
      expect(batchSetProduct).toHaveBeenCalledTimes(1);
      expect(batchSetProductDetail).not.toHaveBeenCalled();
      expect(batchSetSpecCategories).not.toHaveBeenCalled();
      expect(mockFirestoreBatchService.findCollection).toHaveBeenCalledTimes(1);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);
    });
  });
});
