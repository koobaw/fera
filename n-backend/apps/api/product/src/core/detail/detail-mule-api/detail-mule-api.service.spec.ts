/* eslint-disable @typescript-eslint/no-explicit-any */
import { of } from 'rxjs';

import { LoggingService } from '@fera-next-gen/logging';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalsModule } from '../../../globals.module';
import { DetailMuleApiService } from './detail-mule-api.service';
import { DetailDto } from '../dto/detail.dto';

jest.mock('@nestjs/config', () => ({
  ...jest.requireActual('@nestjs/config'),
  ConfigService: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}));

describe('DetailMuleApiService', () => {
  let service: DetailMuleApiService;
  let mockedEnv: jest.Mocked<ConfigService>;
  let httpService: HttpService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        DetailMuleApiService,
        ConfigService,
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<DetailMuleApiService>(DetailMuleApiService);
    mockedEnv = jest.mocked<ConfigService>(module.get(ConfigService));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.getDetailFromMule).toBeDefined();
  });

  describe('getDetailFromMule', () => {
    it('should return product data', async () => {
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
          largeSizedProductCategoryEc: '0',
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

      jest
        .spyOn(httpService as any, 'get')
        .mockReturnValue(of({ data: muleResponse }));

      await expect(service.getDetailFromMule(detailDto)).resolves.toEqual(
        muleResponse,
      );
    });

    it('should require {url, headers, params} when send http request to mule api', async () => {
      const detailDto: DetailDto = {
        productIds: ['4549509623410'],
      };
      const muleFieldOption = [
        'department', // DPTコード
        'line', // ラインコード
        'class', // クラスコード
        'description', // 商品詳細説明
        'sc', // 販売制御フィールドセット
        'pi', // 商品特定フィールドセット
        'pd', // 商品説明フィールドセット
        'rp', // 関連商品フィールドセット
        'lm', // 物流管理フィールドセット
      ];

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
          largeSizedProductCategoryEc: '0',
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

      const spyHttpGet = jest
        .spyOn(httpService as any, 'get')
        .mockReturnValue(of({ data: muleResponse }));

      await service.getDetailFromMule(detailDto);

      const url = `${mockedEnv.get<string>(
        'MULE_API_BASE_URL',
      )}${mockedEnv.get<string>('MULE_API_DETAIL_ENDPOINT')}`;
      const headers = {
        client_id: mockedEnv.get<string>('MULE_API_CLIENT_ID'),
        client_secret: mockedEnv.get<string>('MULE_API_CLIENT_SECRET'),
      };
      const params = {
        codes: detailDto.productIds.join(','),
        fields: muleFieldOption.join(','),
      };

      expect(spyHttpGet).toHaveBeenCalledWith(url, { headers, params });
    });
  });
});
