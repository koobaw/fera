import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalErrorCode } from '@cainz-next-gen/exception';
import {
  CartErrorMessage,
  CheckoutErrorMessage,
  ErrorCode,
} from '../src/types/constants/error-code';

const mockCheckoutBeginResponse = {
  customerInfo: {
    customerLastName: '埼玉',
    customerFirstName: '太郎',
    customerLastNameKana: 'サイタマ',
    customerFirstNameKana: 'タロウ',
    customerZipCode: '3671234',
    customerPrefecture: '埼玉県',
    customerCity: '本庄市',
    customerAddress1: '早稲田の杜一丁目９９番９９９号',
    customerAddress2: 'カインズビル',
    customerCompanyName: '株式会社　ECリプレイス',
    customerDepartmentName: '情報システム部',
    customerPhone: '0120999999',
    customerEmail: 'Taro@test.co.jp',
    isMember: true,
    billPayment: true,
    memberRegistrationDate: '2023-11-17T18:00:00.000Z',
    isSameAsShippingInfo: false,
    typeOfAmazonPayAddress: 1,
    errors: []
  },
  storeInfo: {
    storeCode: '0760',
    storeName: 'カインズ伊勢崎',
    storeHours: '09:00 ～ 20:00',
    zipCode: '3720999',
    address: '群馬県伊勢崎市宮子町９９９９',
    supportPickupInnerLocker: true,
    supportPickupPlace: true,
    supportPickupPlaceParking: true,
    selectedReceiptLocation: '3',
    mapUrl: 'https://map.test.com/map/999',
    estimatedPickupableDateTime: '本日 11/16(木) 最短13:00以降受取可',
  },
  shippingInfo: {
    shippingLastName: 'お届け先',
    shippingFirstName: '太郎',
    shippingLastNameKana: 'オトドケサキ',
    shippingFirstNameKana: 'タロウ',
    shippingZipCode: '0790000',
    shippingPrefecture: '北海道',
    shippingCity: '赤平市',
    shippingAddress1: '赤平１１１丁目',
    shippingAddress2: '赤平マンション１号室',
    shippingCompanyName: '株式会社　北海道',
    shippingDepartmentName: '情報システム部',
    shippingPhone: '12599999999',
    selectedAddressBookId: '2',
    desiredDeliveryDateList: [
      {
        availableDeliveryDate: '2023-11-17T18:00:00.000Z',
        isSelected: false,
      },
      {
        availableDeliveryDate: '2023-11-18T18:00:00.000Z',
        isSelected: true,
      },
    ],
    desiredDeliveryTimeZoneList: [
      {
        availableDeliveryTimeZoneId: '0',
        availableDeliveryTimeZoneName: '希望なし',
        isSelected: true,
      },
    ],
    unattendedDeliveryFlag: false,
    isGift: false,
    isAmazonPayAddress: true,
    errors: []
  },
  paymentMethodInfoList: [
    {
      paymentMethodId: '1',
      paymentMethodName: 'クレジットカード',
      paymentMethodDetail: 'ギフトカード',
      registeredCreditCardList: [
        {
          cardSequentialNumber: 0,
          cardNumber: '999999****9999',
          expirationDate: '12/24',
          isDeleted: false,
          isDefault: true,
          isSelected: false,
        },
        {
          cardSequentialNumber: 1,
          cardNumber: '999999****8888',
          expirationDate: '01/26',
          isDeleted: false,
          isDefault: false,
          isSelected: true,
        },
      ],
      convenienceCodeList: [
        {
          convenienceCode: '00007',
          convenienceName: 'セブンイレブン',
          isSelected: false,
        },
      ],
      paymentCharge: 330,
      maxPurchaseAmount: 55000,
      isExceedMaximumAmount: true,
      minPurchaseAmount: 1,
      isBelowMinimumAmount: false,
      isSaveCard: true,
      numberOfTokensRequired: 2,
      isSelected: true,
      errorCode: "checkouts-payment-error-001",
      message: "The maximum amount has been exceeded."
    },
  ],
  pointInfo: {
    availablePoints: 1000,
    redeemedPoints: 123,
  },
  storeReceiveProducts: [
    {
      productItems: [],
    },
  ],
  shippingProducts: [
    {
      productItems: [],
    },
  ],
  paymentAmountInfoArray: [
    {
      settlementType: '2',
      receivingMethod: '1',
      paymentMethodId: '1',
      totalProductAmount: 15000,
      basicShippingCost: 500,
      regionalShippingCost: 1700,
      totalIndividualShippingCost: 1500,
      paymentCharge: 330,
      redeemedPoints: 100,
      estimatedGrantedPoints: 68,
      estimatedGrantedCampaignPoints: 500,
      totalAmount: 18930,
      taxClassificationInfoArray: [
        {
          taxClassification: '1',
          taxClassificationName: '10% (通常税率)',
          taxableAmount: 19030,
          tax: 1730,
        },
        {
          taxClassification: '2',
          taxClassificationName: '8% (軽減税率)',
          taxableAmount: 1080,
          tax: 80,
        },
      ],
    },
  ],
  checkoutId: '74234354598',
  isAmazonPayOneTimePayment: true,
  amazonPayButtonConfig: {
    sandbox: false,
    merchantId: "123456789",
    ledgerCurrency: "JPY",
    checkoutLanguage: "ja_JP",
    productType:"PayAndShip",
    placement:"Cart",
    buttonColor: "LightGray",
    estimatedOrderAmount: {
      amount: 2500,
      currencyCode: "JPY"
    },
    createCheckoutSessionConfig: {
      payloadJSON: "0123456789",
      signature: "123456789",
      publicKeyId: "123456789",
      algorithm: "AMZN-PAY-RSASSA-PSS-V2"
    }
  },
  errors: []
};
const checkoutBeginResponseData = {
  customerInfo: {
    customerLastName: '埼玉',
    customerFirstName: '太郎',
    customerLastNameKana: 'サイタマ',
    customerFirstNameKana: 'タロウ',
    customerZipCode: '3671234',
    customerPrefecture: '埼玉県',
    customerCity: '本庄市',
    customerAddress1: '早稲田の杜一丁目９９番９９９号',
    customerAddress2: 'カインズビル',
    customerCompanyName: '株式会社　ECリプレイス',
    customerDepartmentName: '情報システム部',
    customerPhone: '0120999999',
    customerEmail: 'Taro@test.co.jp',
    isMember: false,
    billPayment: true,
    memberRegistrationDate: '2023-11-17T18:00:00.000Z',
    isSameAsShippingInfo: true,
    typeOfAmazonPayAddress: 1,
  },
  storeInfo: {
    storeCode: '0760',
    storeName: 'カインズ伊勢崎',
    storeHours: '09:00 ～ 20:00',
    zipCode: '3720999',
    address: '群馬県伊勢崎市宮子町９９９９',
    supportPickupInnerLocker: true,
    supportPickupPlace: true,
    supportPickupPlaceParking: true,
    selectedReceiptLocation: '3',
    mapUrl: 'https://map.test.com/map/999',
    estimatedPickupableDateTime: '本日 11/16(木) 最短13:00以降受取可',
  },
  shippingInfo: {
    shippingLastName: 'お届け先',
    shippingFirstName: '太郎',
    shippingLastNameKana: 'オトドケサキ',
    shippingFirstNameKana: 'タロウ',
    shippingZipCode: '0790000',
    shippingPrefecture: '北海道',
    shippingCity: '赤平市',
    shippingAddress1: '赤平１１１丁目',
    shippingAddress2: '赤平マンション１号室',
    shippingCompanyName: '株式会社　北海道',
    shippingDepartmentName: '情報システム部',
    shippingPhone: '12599999999',
    selectedAddressBookId: '2',
    desiredDeliveryDateList: [
      {
        availableDeliveryDate: '2023-11-17T18:00:00.000Z',
        isSelected: false,
      },
      {
        availableDeliveryDate: '2023-11-18T18:00:00.000Z',
        isSelected: true,
      },
    ],
    desiredDeliveryTimeZoneList: [
      {
        availableDeliveryTimeZoneId: '0',
        availableDeliveryTimeZoneName: '14~16時',
        isSelected: true,
      },
    ],
    unattendedDeliveryFlag: false,
    isGift: false,
    isAmazonPayAddress: false,
  },
  paymentMethodInfoList: [
    {
      paymentMethodId: '1',
      paymentMethodName: 'クレジットカード',
      paymentMethodDetail: 'ギフトカード',
      registeredCreditCardList: [
        {
          cardSequentialNumber: 0,
          cardNumber: '999999****9999',
          expirationDate: '12/24',
          isDeleted: false,
          isDefault: false,
          isSelected: false,
        },
        {
          cardSequentialNumber: 1,
          cardNumber: '999999****8888',
          expirationDate: '01/26',
          isDeleted: false,
          isDefault: false,
          isSelected: true,
        },
      ],
      convenienceCodeList: [
        {
          convenienceCode: '00007',
          convenienceName: 'セブンイレブン',
          isSelected: false,
        },
      ],
      paymentCharge: 330,
      maxPurchaseAmount: 55000,
      isExceedMaximumAmount: false,
      minPurchaseAmount: 1,
      isBelowMinimumAmount: false,
      isSaveCard: true,
      numberOfTokensRequired: 2,
      isSelected: true,
    },
  ],
  pointInfo: {
    availablePoints: 1000,
    redeemedPoints: 123,
  },
  storeReceiveProducts: [
    {
      productItems: [
        {
          itemId: '17392851394179',
          receivingMethod: '1',
          productId: '4549509524322',
          quantity: 20,
          orderSpecification: {
            simulationNumber: '980089',
            height: 90,
            width: 200,
            hook: 'A',
          },
          product: {
            productId: '4549509646952',
            name: 'ロング丈も掛けられる折りたたみランドリーラックパタラン',
            categoryId: 'c2320',
            imageUrls: [
              'https://imgix.cainz.com/4549509646952/product/4549509646952_01.jpg',
              'https://imgix.cainz.com/4549509646952/product/4549509646952_02.jpg',
              'https://imgix.cainz.com/4549509646952/product/4549509646952_03.jpg',
            ],
            departmentCode: '014',
            lineCode: '221',
            classCode: '1400',
            description: '',
            applicableStartDate: '2023-05-24T02:00:10.000Z',
            salesStartDate: '2023-05-24T02:00:10.000Z',
            consumptionTaxRate: 10,
            consumptionTaxCategory: '',
            salesEndDate: '2023-05-24T02:00:10.000Z',
            salesEndFlag: false,
            designatedPharmaceuticalCategory: '0',
            liquorCategory: '0',
            tobaccoCategory: '0',
            hazardousMaterialFlag: false,
            medicalEquipmentClass: '',
            poisonousDeleteriousSubstanceCategory: '0',
            poisonousDrugCategory: '0',
            agriculturalChemicalCategory: '0',
            animalDrugCategory: '0',
            warrantyIssuanceCategory: '0',
            pharmaceuticalFlag: false,
            salesTypeCategory: '0',
            warrantyCategory: '0',
            warrantyPeriod: '1年間',
            deliveryChargeCategoryEc: '0',
            onlineFlagEc: true,
            onlineStartTimeEc: '2023-05-24T02:00:10.000Z',
            onlineEndTimeEc: '2023-05-24T02:00:10.000Z',
            consumptionTaxCategoryEc: '0',
            onlineSalesCategoryEc: '0',
            individualDeliveryChargeEc: 600,
            setProductFlag: false,
            configurationFlag: false,
            customizedProductCategory: '0',
            minOrderQuantity: 1,
            maxOrderQuantity: 100,
            stepQuantity: 1,
            storeMinOrderQuantity: 1,
            storeMaxOrderQuantity: 100,
            storeStepOrderQuantity: 1,
            newPeriodFrom: '2023-05-24T02:00:10.000Z',
            reserveFromStoreDisabled: false,
            sendToStoreDisabled: false,
            personalDeliveryDisabled: false,
            estimatedArrivalDays: 3,
            productWithServiceFlag: false,
            dropShippingCategory: '0',
            originCountryCode: 'JP',
            flavorExpirationCategory: '0',
            flavorExpiration: 3,
            productCharacteristics:
              'ワンピースも干せる。超軽量＆収納時はコンパクト。風が通りやすい設計で乾きやすい',
            colorPattern: '黒',
            size: '',
            brandName: '',
            singleItemSizeWidth: 19.1,
            singleItemSizeHeight: 5.1,
            singleItemSizeDepth: 7.7,
            contentAmount: 10,
            contentAmountUnit: 'L',
            modelNo: '',
            lawsStandards: 'JIS',
            singleItemSize2Width: 19.1,
            singleItemSize2Height: 5.1,
            singleItemSize2Depth: 7.7,
            specCategory: [
              {
                name: 'カラー',
                value: '',
              },
              {
                name: '本体サイズ-幅(cm)',
                value: '19',
              },
              {
                name: '本体サイズ-奥行(cm)',
                value: '14.5',
              },
            ],
            characterCopyrightNameEc: '',
            longDescription:
              "大人気リピーター続出!カインズPet'sOneの猫砂がおすすめ! 固まった部分は水洗トイレに流すことができます。使用上の注意をよくお読みください。おからが主原料なので燃やすことができます。生ごみとしても処理できます。",
            cautions:
              '◆お届けの時期により、パッケージ（箱）が異なる場合がございます。',
            productSpecGroupId: '',
            similarProduct: '',
            recommendedProduct: '',
            comparativeProduct: '',
            kukuru: '00000152',
            variation: [
              {
                name: '01-001',
                value: '4',
              },
              {
                name: '01-001',
                value: '4',
              },
            ],
            faceProductId: '00000152',
            serviceContents: '',
            prices: [
              {
                productId: '4549509646945',
                storeCodes: '859',
                membershipRank: '4',
                priceIncludingTax: 8980,
                salePriceIncludingTax: 7980,
              },
              {
                productId: '4549509646945',
                storeCodes: '123',
                membershipRank: '4',
                priceIncludingTax: 8980,
                salePriceIncludingTax: 7980,
              },
            ],
            inventories: [
              {
                productId: '4549509646952',
                storeCode: '859',
                quantityOpening: 10,
                quantitySold: 3,
                quantityAvailable: 6,
                quantityAllocated: 1,
                quantityExpected: 3,
                expectedArrivalDate: '2023-03-03T00:00:00.000Z',
              },
              {
                productId: '4549509646952',
                storeCode: '123',
                quantityOpening: 10,
                quantitySold: 3,
                quantityAvailable: 6,
                quantityAllocated: 1,
                quantityExpected: 3,
              },
            ],
          },
          delivery: {
            shipping: {
              estimatedDate: '2023-06-23',
              canSelectDate: false,
              items: [
                {
                  productCode: '4549509524317',
                  estimatedDate: '2023-06-23',
                  isSeparate: false,
                },
              ],
            },
            pickup: {
              dateTime: '2023-06-23 09:07',
              items: [
                {
                  productCode: '4549509524317',
                  estimatedDate: '2023-06-23',
                  isSeparate: false,
                },
              ],
            },
          },
          setProductType: '0',
          isReserveFromStoreAvailable: true,
          isPersonalDeliveryAvailable: true,
          invalidWebBackOrderFlagForStorePickup: false,
          invalidWebBackOrderFlagForDesignatedDelivery: true,
          isWebBackOrder: false,
          unitPrice: 2000,
          subtotalProductAmount: 10000,
          individualShippingCost: 4000,
          subtotalIndividualShippingCost: 3200,
          campaignPoints: 1800,
          subtotalCampaignPoints: 3600,
          isCheckoutTarget: false,
          checkoutId: '123456',
          checkoutStatus: 'Completed',
          createdAt: '2023-11-14T13:40:20+07:21',
          updatedAt: '2023-11-15T13:40:21+09:00',
        },
        {
          itemId: '87092821394372',
          receivingMethod: '1',
          productId: '4549509524323',
          quantity: 20,
          orderSpecification: {
            simulationNumber: '980089',
            height: 90,
            width: 200,
            hook: 'A',
          },
          product: {
            productId: '4549509646952',
            name: 'ロング丈も掛けられる折りたたみランドリーラックパタラン',
            categoryId: 'c2320',
            imageUrls: [
              'https://imgix.cainz.com/4549509646952/product/4549509646952_01.jpg',
              'https://imgix.cainz.com/4549509646952/product/4549509646952_02.jpg',
              'https://imgix.cainz.com/4549509646952/product/4549509646952_03.jpg',
            ],
            departmentCode: '014',
            lineCode: '221',
            classCode: '1400',
            description: '',
            applicableStartDate: '2023-05-24T02:00:10.000Z',
            salesStartDate: '2023-05-24T02:00:10.000Z',
            consumptionTaxRate: 10,
            consumptionTaxCategory: '',
            salesEndDate: '2023-05-24T02:00:10.000Z',
            salesEndFlag: false,
            designatedPharmaceuticalCategory: '0',
            liquorCategory: '0',
            tobaccoCategory: '0',
            hazardousMaterialFlag: false,
            medicalEquipmentClass: '',
            poisonousDeleteriousSubstanceCategory: '0',
            poisonousDrugCategory: '0',
            agriculturalChemicalCategory: '0',
            animalDrugCategory: '0',
            warrantyIssuanceCategory: '0',
            pharmaceuticalFlag: false,
            salesTypeCategory: '0',
            warrantyCategory: '0',
            warrantyPeriod: '1年間',
            deliveryChargeCategoryEc: '0',
            onlineFlagEc: true,
            onlineStartTimeEc: '2023-05-24T02:00:10.000Z',
            onlineEndTimeEc: '2023-05-24T02:00:10.000Z',
            consumptionTaxCategoryEc: '0',
            onlineSalesCategoryEc: '0',
            individualDeliveryChargeEc: 600,
            setProductFlag: false,
            configurationFlag: false,
            customizedProductCategory: '0',
            minOrderQuantity: 1,
            maxOrderQuantity: 100,
            stepQuantity: 1,
            storeMinOrderQuantity: 1,
            storeMaxOrderQuantity: 100,
            storeStepOrderQuantity: 1,
            newPeriodFrom: '2023-05-24T02:00:10.000Z',
            reserveFromStoreDisabled: false,
            sendToStoreDisabled: false,
            personalDeliveryDisabled: false,
            estimatedArrivalDays: 3,
            productWithServiceFlag: false,
            dropShippingCategory: '0',
            originCountryCode: 'JP',
            flavorExpirationCategory: '0',
            flavorExpiration: 3,
            productCharacteristics:
              'ワンピースも干せる。超軽量＆収納時はコンパクト。風が通りやすい設計で乾きやすい',
            colorPattern: '黒',
            size: '',
            brandName: '',
            singleItemSizeWidth: 19.1,
            singleItemSizeHeight: 5.1,
            singleItemSizeDepth: 7.7,
            contentAmount: 10,
            contentAmountUnit: 'L',
            modelNo: '',
            lawsStandards: 'JIS',
            singleItemSize2Width: 19.1,
            singleItemSize2Height: 5.1,
            singleItemSize2Depth: 7.7,
            specCategory: [
              {
                name: 'カラー',
                value: '',
              },
              {
                name: '本体サイズ-幅(cm)',
                value: '19',
              },
              {
                name: '本体サイズ-奥行(cm)',
                value: '14.5',
              },
            ],
            characterCopyrightNameEc: '',
            longDescription:
              "大人気リピーター続出!カインズPet'sOneの猫砂がおすすめ! 固まった部分は水洗トイレに流すことができます。使用上の注意をよくお読みください。おからが主原料なので燃やすことができます。生ごみとしても処理できます",
            cautions:
              '◆お届けの時期により、パッケージ（箱）が異なる場合がございます。',
            productSpecGroupId: '',
            similarProduct: '',
            recommendedProduct: '',
            comparativeProduct: '',
            kukuru: '00000152',
            variation: [
              {
                name: '01-001',
                value: '4',
              },
              {
                name: '01-001',
                value: '4',
              },
            ],
            faceProductId: '00000152',
            serviceContents: '',
            prices: [
              {
                productId: '4549509646945',
                storeCodes: '859',
                membershipRank: '4',
                priceIncludingTax: 8980,
                salePriceIncludingTax: 7980,
              },
              {
                productId: '4549509646945',
                storeCodes: '123',
                membershipRank: '4',
                priceIncludingTax: 8980,
                salePriceIncludingTax: 7980,
              },
            ],
            inventories: [
              {
                productId: '4549509646952',
                storeCode: '859',
                quantityOpening: 10,
                quantitySold: 3,
                quantityAvailable: 6,
                quantityAllocated: 1,
                quantityExpected: 3,
                expectedArrivalDate: '2023-03-03T00:00:00.000Z',
              },
              {
                productId: '4549509646952',
                storeCode: '123',
                quantityOpening: 10,
                quantitySold: 3,
                quantityAvailable: 6,
                quantityAllocated: 1,
                quantityExpected: 3,
              },
            ],
          },
          delivery: {
            shipping: {
              estimatedDate: '2023-06-23',
              canSelectDate: false,
              items: [
                {
                  productCode: '4549509524317',
                  estimatedDate: '2023-06-23',
                  isSeparate: false,
                },
              ],
            },
            pickup: {
              dateTime: '2023-06-23 09:08',
              items: [
                {
                  productCode: '4549509524317',
                  estimatedDate: '2023-06-23',
                  isSeparate: false,
                },
              ],
            },
          },
          setProductType: '0',
          isReserveFromStoreAvailable: true,
          isPersonalDeliveryAvailable: true,
          invalidWebBackOrderFlagForStorePickup: false,
          invalidWebBackOrderFlagForDesignatedDelivery: true,
          isWebBackOrder: false,
          unitPrice: 2000,
          subtotalProductAmount: 10000,
          individualShippingCost: 4000,
          subtotalIndividualShippingCost: 3200,
          campaignPoints: 1800,
          subtotalCampaignPoints: 3600,
          isCheckoutTarget: false,
          checkoutId: '123456',
          checkoutStatus: 'In-progress',
          createdAt: '2023-11-14T13:40:21+09:00',
          updatedAt: '2023-11-15T13:40:21+09:00',
        },
      ],
    },
  ],
  shippingProducts: [
    {
      productItems: [],
    },
  ],
  paymentAmountInfoArray: [
    {
      settlementType: '2',
      receivingMethod: '1',
      paymentMethodId: '1',
      totalProductAmount: 15000,
      basicShippingCost: 500,
      regionalShippingCost: 1700,
      totalIndividualShippingCost: 1500,
      paymentCharge: 330,
      redeemedPoints: 100,
      estimatedGrantedPoints: 68,
      estimatedGrantedCampaignPoints: 500,
      totalAmount: 18930,
      taxClassificationInfoArray: [
        {
          taxClassification: '1',
          taxClassificationName: '10% (通常税率)',
          taxableAmount: 19030,
          tax: 1730,
        },
        {
          taxClassification: '2',
          taxClassificationName: '8% (軽減税率)',
          taxableAmount: 1080,
          tax: 80,
        },
      ],
    },
  ],
  checkoutId: '74234354598',
  isAmazonPayOneTimePayment: true,
};
const mockCheckoutBeginDto = {
  userId: '48677635-ac6a-4412-8f68-5a933a166a29',
  amazonCheckoutSessionId: '12345',
  selectedItems: ['MlgzTxGMz9XWS4J81BB0', 'MlgzTxGMz9XWS4J81BB1'],
};
const userIdValidationError = new HttpException(
  {
    errorCode: ErrorCode.PARAM_BAD_PARAMETER_IS_WEB,
    message: 'parameter validation error:userId',
  },
  HttpStatus.BAD_REQUEST,
);
const MockcheckoutId = '10130759-c3fa-4136-a619-e30a4ec41aa7';
const MockcheckoutCompleteServiceData: any = {
  receptionId: '7573536222410',
  orderId: '4772713525',
  accessId: 'ohcOp.0*xD5vdeOYNEPDPHXbwXN9',
  token: 'wRgKytjCx/rk.CiOyoZIAjS4pENzgmGgxg9',
  paymentStartUrl: 'https://xxxx.mul-pay.jp/payment/DocomoStart.idPass',
  paymentStartBy: '2023-10-30T16:50:24.367Z',
};

const MockcheckoutCompleteBodyData: any = {
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
    isSameAsShippingInfo: false,
  },
  shippingInfo: {
    selectedAddressBookId: '1',
    guestInputInfo: {
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
    },
    desiredDeliveryDate: '2023-12-01T09:00:00+09:00',
    desiredDeliveryTimeZoneId: null,
    unattendedDeliveryFlag: false,
    isGift: true,
  },
  storeInfo: {
    selectedStoreCode: '760',
    selectedReceiptLocation: 1,
  },
  paymentMethodInfo: {
    isStorePaymentSelected: false,
    selectedPaymentMethodId: '2',
    cardSequentialNumber: 1,
    isSaveCard: true,
    selectedConvenienceCode: '00007',
    creditCardToken:
      '2a031a7d7ecb674c866148970bc2febf72e5e1773b60bc5a08a0a9e5ecc6e9fd,1c676b78ba6a9c11c7c26331dd05303c10c378cde4ba96d1925cf50692302a93',
  },
  redeemedPoints: 120,
  affiliateTrackingId: '123ABCdefg456HIJklm789NOPqrs789TUV',
  affiliateVisitDateTime: '2023-10-23T13:32:06Z',
  httpHeader: null,
};
const MockcheckoutCompleteServiceOtherPaymentsData: any = {
  orderCompleteInfo: [
    {
      orderId: '4772713528',
      receptionId: '1117295780837',
      shortOrderId: '74272962',
      receivingMethod: '1',
      paymentMethodId: '3',
      convenienceCode: '10001',
      isMember: true,
    },
  ],
};

const MockcheckoutCompleteServiceStoreData: any = {
  orderCompleteInfo: [
    {
      orderId: '4772713526',
      receptionId: '7680744034025',
      shortOrderId: '12988967',
      receivingMethod: '1',
      paymentMethodId: '2',
      convenienceCode: '00007',
      purchaseAmount: 3233,
      payBy: '2023-10-30T16:50:24.367Z',
      confirmationNumber: '2024',
      receiptNumber: 'LW233053476653',
      slipUrl: 'https://xxxxx.mul-pay.jp/seven/sample.html',
      clientField1: 'Free item 1',
      clientField2: 'Free item 2',
      clientField3: 'Free item 3',
      isMember: true,
    },
  ],
};

const mockInternalServerError = new HttpException(
  {
    errorCode: ErrorCode.CART_FIRE_STORE_ERROR,
    message: CartErrorMessage[ErrorCode.CART_FIRE_STORE_ERROR],
  },
  HttpStatus.INTERNAL_SERVER_ERROR,
);

const mockCheckOutComplete2Id = '009b67fd-1c20-4f8d-94b1-d636ee8eaad1';
const mockCheckOutComplete2Dto: any = {
  userId: '12345',
  orderId: '19287341',
  shopId: '23112423',
  receptionId: '129847',
  status: 'AUTH',
  amazonChargePermissionID: '98796',
  checkString: '9689577',
  tranDate: '23-09-2023',
  errCode: null,
  errInfo: null,
};
const mockCheckoutComplete2Response: any = {
  orderId: '4772713525',
  paymentId: '123',
  accessId: 'bfe410dSFFJCv-5t1EcD7Odv7Dsn',
  token: 'C.GGPQxJSYpJpBUqUO4OO30.mcjIC5KAqJG',
  paymentStartUrl: 'https://cainz.com/amazon/payments',
  paymentStartBy: '2023-11-03T11:40:34.329Z',
};
const mockCheckoutComplete2Error = new HttpException(
  {
    code: GlobalErrorCode.BAD_PARAMETER,
    message: `Checkout ID Not Found`,
    errorCode: GlobalErrorCode.BAD_PARAMETER,
  },
  HttpStatus.BAD_REQUEST,
);
const mockInternalServerErrorCheckout = new HttpException(
  {
    errorCode: ErrorCode.CHECKOUT_FIRE_STORE_ERROR,
    message: CheckoutErrorMessage[ErrorCode.CHECKOUT_FIRE_STORE_ERROR],
  },
  HttpStatus.INTERNAL_SERVER_ERROR,
);
const mockcheckoutId = '009b67fd-1c20-4f8d-94b1-d636ee8eaad1';
const mockCheckOutChangeData: any = {
  customerInfo: {
    customerZipCode: '3670068',
    customerPrefecture: '埼玉県',
    customerCity: '本庄市早稲田の杜',
  },
  selectedStoreCode: '0986',
  redeemedPoints: 2,
};

const mockCheckoutChangeWithoutUserIdData: any = {
  customerInfo: {
    customerZipCode: '3670068',
    customerPrefecture: '埼玉県',
    customerCity: '本庄市早稲田の杜',
  },
  selectedStoreCode: '0986',
  redeemedPoints: 2,
};

const mockMemberData: any = {
  lastName: 'ゴビンダラジ',
  firstName: 'レンガラジ',
  lastNameKana: 'さん',
  firstNameKana: 'さん',
  postCode: '108-8282',
  prefectures: '東京都',
  city: '東京都',
  address1: '東京都千代田区丸の内3-3-1',
  address2: '東京都千代田区丸の内3-3-1',
  CompanyName: 'カインズ',
  DepartmentName: 'Retail',
  phoneNumber: '3232323333',
  Email: 'cainzTesting@gmail.com',
  billPayment: true,
  memberRegistrationDate: new Date().toDateString(),
};

const customerInfoEnteredByGuest: any = {
  customerLastName: 'ゴビンダラジ',
  customerFirstName: 'レンガラジ',
  customerLastNameKana: 'さん',
  customerFirstNameKana: 'さん',
  customerZipCode: '108-8282',
  customerPrefecture: '東京都',
  customerCity: '東京都',
  customerAddress1: '東京都千代田区丸の内3-3-1',
  customerAddress2: '東京都千代田区丸の内3-3-1',
  customerCompanyName: 'カインズ',
  customerDepartmentName: 'Retail',
  customerPhone: '3232323333',
  customerEmail: 'cainzTesting@gmail.com',
  billPayment: false,
};
const amazonInfoMockData: any = {
  billing: {
    editedValues: {
      amazonLastName: 'ゴビンダラジ',
      amazonFirstName: 'レンガラジ',
      customerLastNameKana: 'さん',
      customerFirstNameKana: 'さん',
      amazonPostalCode: '108-8282',
      amazonStateOrRegion: '東京都',
      amazonCity: '東京都',
      amazonAddress1: '東京都千代田区丸の内3-3-1',
      amazonAddress2: '東京都千代田区丸の内3-3-1',
      amazonPhoneNumber: '3232323333',
      amazonMailAddress: 'cainzTesting@gmail.com',
    },
  },
  shipping: {
    editedValues: {
      amazonLastName: 'ゴビンダラジ',
      amazonFirstName: 'レンガラジ',
      customerLastNameKana: 'さん',
      customerFirstNameKana: 'さん',
      amazonPostalCode: '108-8282',
      amazonStateOrRegion: '東京都',
      amazonCity: '東京都',
      amazonAddress1: '東京都千代田区丸の内3-3-1',
      amazonAddress2: '東京都千代田区丸の内3-3-1',
      amazonPhoneNumber: '3232323333',
      amazonMailAddress: 'cainzTesting@gmail.com',
    },
  },
};

const shippingInfoGuestInputInfo: any = {
  shippingLastName: 'ゴビンダラジ',
  shippingFirstName: 'レンガラジ',
  shippingLastNameKana: 'さん',
  shippingFirstNameKana: 'さん',
  shippingZipCode: '108-8282',
  shippingPrefecture: '東京都',
  shippingCity: '東京都',
  shippingAddress1: '東京都千代田区丸の内3-3-1',
  shippingAddress2: '東京都千代田区丸の内3-3-1',
  shippingCompanyName: 'カインズ',
  shippingDepartmentName: 'Retail',
  shippingPhone: '3232323333',
  isDeliveryBox: false,
  isGift: false,
};

const addressBookMockData = [
  {
    id: '1',
    name: 'address name',
    accountId: '123',
    isFavorite: true,
    title: '自宅',
    firstName: '太郎',
    lastName: '山田',
    firstNameKana: 'タロウ',
    lastNameKana: 'ヤマダ',
    zipCode: '3670030',
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
  },
  {
    id: '2',
    name: 'address name2',
    accountId: '234',
    isFavorite: false,
    title: 'オフィス',
    firstName: '花子',
    lastName: '佐藤',
    firstNameKana: 'ハナコ',
    lastNameKana: 'サトウ',
    zipCode: '1010021',
    prefecture: '東京都',
    address1: '千代田区外神田',
    address2: '四丁目5番2号',
    address3: 'カインズビル500号室',
    phone: '03088888888',
    phone2: '04088888888',
    email: 'hanako@example.com',
    companyName: 'テスト企業',
    departmentName: 'デザイン部',
    memo: 'メモ内容',
  },
];

export {
  mockInternalServerError,
  MockcheckoutId,
  MockcheckoutCompleteServiceData,
  MockcheckoutCompleteBodyData,
  MockcheckoutCompleteServiceStoreData,
  MockcheckoutCompleteServiceOtherPaymentsData,
  mockCheckoutBeginResponse,
  checkoutBeginResponseData,
  mockCheckoutBeginDto,
  userIdValidationError,
  mockCheckoutComplete2Response,
  mockCheckoutComplete2Error,
  mockCheckOutComplete2Dto,
  mockCheckOutComplete2Id,
  mockInternalServerErrorCheckout,
  mockCheckOutChangeData,
  mockcheckoutId,
  mockCheckoutChangeWithoutUserIdData,
  mockMemberData,
  amazonInfoMockData,
  customerInfoEnteredByGuest,
  addressBookMockData,
  shippingInfoGuestInputInfo,
};
