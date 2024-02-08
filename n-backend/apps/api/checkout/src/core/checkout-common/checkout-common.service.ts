/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-else-return */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import { CommonService } from '@cainz-next-gen/common';
import { LoggingService } from '@cainz-next-gen/logging';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatusCode, ProductItem } from '@cainz-next-gen/order';
import {
  CreateCustomerInfoResponse,
  CreateShippingInfoResponse,
  CustomerInfo,
  ShippingInfo,
} from './Interface/checkout-complete.interface';
import { CheckoutCommonValidation } from './checkout-common-validation';
import {
  AmazonPayBillingDestinationResult,
  CheckOutCanBeStarted,
  ConfirmProductPurchaseResponse,
  PickUpLocationResponse,
  ProductItems,
  StoreInfoResponse,
} from '../checkout/Interface/checkout-complete.interface';
import { amazonInfo as amazonInfoMock } from '../checkout/data_json/data';
import { checkItemCategory } from '../../types/constants/error-code';

@Injectable()
export class CheckoutCommonService {
  constructor(
    private readonly logger: LoggingService,
    private readonly commonService: CommonService,
    private readonly env: ConfigService,
    private readonly validation: CheckoutCommonValidation,
  ) {}

  // WEB取り寄せ不可フラグ判定
  /**
   * @param {productItems} ProductItem[] - Array of product items form cart
   * @return {object}
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public createCustomerInfo(
    isMember: boolean,
    member: any,
    selectedAddressBookId: string,
    amazonInfo: any,
    customerInfoEnteredByGuest: any,
  ): Partial<CreateCustomerInfoResponse> {
    let status: number = StatusCode.SUCCESS;
    let customerInfo;
    this.logger.info('createCustomerInfo: started');
    if (this.validation.isValidParamCreateCustomerInfo(isMember, member)) {
      try {
        if (isMember === true) {
          customerInfo = this.setCustomerInfoFromMember(
            member,
            selectedAddressBookId,
          );
        } else if (amazonInfo) {
          if (amazonInfo.billing || amazonInfo.shipping) {
            customerInfo = this.setCustomerInfoFromAmazonInfo(amazonInfo);
          } else {
            status = StatusCode.FAILURE;
          }
        } else if (customerInfoEnteredByGuest) {
          customerInfo = this.setCustomerInfoFromCustomerInfoEnteredByGuest(
            customerInfoEnteredByGuest,
          );
        } else {
          status = StatusCode.SUCCESS;
        }
        return { status, customerInfo };
      } catch (e: any) {
        this.logger.error('Error', e);
        return { status: StatusCode.FAILURE };
      }
    }
    return { status: StatusCode.FAILURE };
  }

  public setCustomerInfoFromMember(member: any, selectedAddressBookId) {
    const customerInfo: Partial<CustomerInfo> = {};
    customerInfo.customerLastName = member.lastName;
    customerInfo.customerFirstName = member.firstName;
    customerInfo.customerLastNameKana = member.lastNameKana;
    customerInfo.customerFirstNameKana = member.firstNameKana;
    customerInfo.customerZipCode = member.postCode;
    customerInfo.customerPrefecture = member.prefectures;
    customerInfo.customerCity = member.city;
    customerInfo.customerAddress1 = member.address1;
    customerInfo.customerAddress2 = member.address2;
    customerInfo.customerCompanyName = member.CompanyName;
    customerInfo.customerDepartmentName = member.DepartmentName;
    customerInfo.customerPhone = member.phoneNumber;
    customerInfo.customerEmail = member.customerEmail;
    customerInfo.isMember = true;
    customerInfo.billPayment = !(
      member.billPayment === null || !member.billPayment
    );
    customerInfo.memberRegistrationDate = member.memberRegistrationDate;
    customerInfo.isSameAsShippingInfo = selectedAddressBookId === null;
    customerInfo.typeOfAmazonPayAddress = 9;
    return customerInfo;
  }

  public setCustomerInfoFromAmazonInfo(amazonInfo: any) {
    let customerInfoFromAmazonInfo;
    let typeOfAmazonPayAddress;
    if (amazonInfo.billing) {
      customerInfoFromAmazonInfo = amazonInfo.billing.editedValues;
      typeOfAmazonPayAddress = 1;
    } else {
      customerInfoFromAmazonInfo = amazonInfo.shipping.editedValues;
      typeOfAmazonPayAddress = 2;
    }
    const customerInfo: Partial<CustomerInfo> = {};
    customerInfo.customerLastName = customerInfoFromAmazonInfo.amazonLastName;
    customerInfo.customerFirstName = customerInfoFromAmazonInfo.amazonFirstName;
    customerInfo.customerLastNameKana = null;
    customerInfo.customerFirstNameKana = null;
    customerInfo.customerZipCode = customerInfoFromAmazonInfo.amazonPostalCode;
    customerInfo.customerPrefecture =
      customerInfoFromAmazonInfo.amazonStateOrRegion;
    customerInfo.customerCity = customerInfoFromAmazonInfo.amazonCity;
    customerInfo.customerAddress1 = customerInfoFromAmazonInfo.amazonAddress1;
    customerInfo.customerAddress2 = customerInfoFromAmazonInfo.amazonAddress2;
    customerInfo.customerPhone = customerInfoFromAmazonInfo.amazonPhoneNumber;
    customerInfo.customerEmail = customerInfoFromAmazonInfo.amazonMailAddress;
    customerInfo.isMember = false;
    customerInfo.billPayment = false;
    customerInfo.isSameAsShippingInfo = false;
    customerInfo.typeOfAmazonPayAddress = typeOfAmazonPayAddress;
    customerInfo.customerCompanyName = null;
    customerInfo.customerDepartmentName = null;
    return customerInfo;
  }

  public setCustomerInfoFromCustomerInfoEnteredByGuest(
    customerInfoEnteredByGuest: any,
  ) {
    if (Object.keys(customerInfoEnteredByGuest).length > 0) {
      const customerInfo: Partial<CustomerInfo> = {};
      customerInfo.customerLastName =
        customerInfoEnteredByGuest.customerLastName;
      customerInfo.customerFirstName =
        customerInfoEnteredByGuest.customerFirstName;
      customerInfo.customerLastNameKana =
        customerInfoEnteredByGuest.customerLastNameKana;
      customerInfo.customerFirstNameKana =
        customerInfoEnteredByGuest.customerFirstNameKana;
      customerInfo.customerZipCode = customerInfoEnteredByGuest.customerZipCode;
      customerInfo.customerPrefecture =
        customerInfoEnteredByGuest.customerPrefecture;
      customerInfo.customerCity = customerInfoEnteredByGuest.customerCity;
      customerInfo.customerAddress1 =
        customerInfoEnteredByGuest.customerAddress1;
      customerInfo.customerAddress2 =
        customerInfoEnteredByGuest.customerAddress2;
      customerInfo.customerCompanyName =
        customerInfoEnteredByGuest.customerCompanyName;
      customerInfo.customerDepartmentName =
        customerInfoEnteredByGuest.customerDepartmentName;
      customerInfo.customerPhone = customerInfoEnteredByGuest.customerPhone;
      customerInfo.customerEmail = customerInfoEnteredByGuest.customerEmail;
      customerInfo.isMember = false;
      customerInfo.billPayment = false;
      customerInfo.isSameAsShippingInfo =
        customerInfoEnteredByGuest.isSameAsShippingInfo;
      customerInfo.typeOfAmazonPayAddress = 9;
      return customerInfo;
    }
    return null;
  }

  /**
   * @param {amazonCheckoutSessionId} string - amazon checkoutId string
   * @return {object}
   */
  public getAmazonPayBillingDestination(
    amazonCheckoutSessionId: string,
  ): AmazonPayBillingDestinationResult {
    const failStatus = {
      status: 0,
      amazonInfo: null,
    };
    if (!amazonCheckoutSessionId || amazonCheckoutSessionId.length === 0) {
      return failStatus;
    }
    try {
      this.logger.info(`start: getAmazonPayBillingDestination`);
      this.logger.info(`end: getAmazonPayBillingDestination`);
      return {
        status: 1,
        amazonInfo: amazonInfoMock,
      };
    } catch (error) {
      this.commonService.logException(
        'method getAmazonPayBillingDestination error',
        error,
      );
      return failStatus;
    }
  }

  /**
   * @param {cartData} array - Array of productitems object
   * @param {selectedItems} array - Array of selectedItems strings
   * @return {object}
   */
  public async checkoutCanBeStarted(
    cartData: Array<ProductItem>,
    selectedItems: Array<string>,
  ): Promise<CheckOutCanBeStarted> {
    const failStatus = {
      status: StatusCode.FAILURE,
      isValid: false,
      checkoutItems: null,
    };
    this.logger.info('start: checkoutCanBeStarted');
    if (
      !cartData ||
      cartData.length === 0 ||
      !selectedItems ||
      selectedItems.length === 0 ||
      selectedItems.some((str) => str.length === 0 || !str) ||
      cartData.some(
        (obj) =>
          !obj ||
          Object.keys(obj).length === 0 ||
          !obj.itemId ||
          obj.itemId.length === 0,
      ) ||
      !(cartData.length === selectedItems.length)
    ) {
      return failStatus;
    }
    try {
      let isValid = true;
      const checkoutItems = [];
      const checkOutItemsData = cartData.filter((obj) =>
        selectedItems.includes(obj.itemId),
      );
      checkOutItemsData.forEach((item) => {
        if (item.isCheckoutTarget === true) {
          checkoutItems.push(item);
        } else {
          isValid = false;
        }
      });
      this.logger.info('end: checkoutCanBeStarted');
      if (isValid && checkoutItems.length === selectedItems.length) {
        return {
          status: StatusCode.SUCCESS,
          isValid,
          checkoutItems,
        };
      }
      return failStatus;
    } catch (error) {
      this.commonService.logException(
        'method checkoutCanBeStarted error',
        error,
      );
      return failStatus;
    }
  }

  /**
   * @param {storeInfo} object - storeInfo object
   * @param {isMember} boolean - set Member flag
   * @param {isStorePaymentSelected} boolean - check In-store payment is selected
   * @return {object}
   */
  public getSelectablePickUpLocation(
    storeInfo: StoreInfoResponse,
    isMember: boolean,
    isStorePaymentSelected: boolean,
  ): PickUpLocationResponse {
    this.logger.info('start: getSelectablePickUpLocation');
    try {
      if (!storeInfo) {
        this.logger.info(
          'Either the property storeInfo object not passed or it may be null',
        );
        return { status: StatusCode.FAILURE };
      }
      if (!isMember && typeof isMember !== 'boolean') {
        this.logger.info(
          'the property isMember should be exist and be a boolean',
        );
        return { status: StatusCode.FAILURE };
      }
      if (
        !isStorePaymentSelected &&
        typeof isStorePaymentSelected !== 'boolean'
      ) {
        this.logger.info(
          'the property isStorePaymentSelected should be exist and be a boolean',
        );
        return { status: StatusCode.FAILURE };
      }
      this.checkStoreMasterAvailableFlag(
        storeInfo,
        isStorePaymentSelected,
        isMember,
      );

      this.logger.info('end: getSelectablePickUpLocation');
      return {
        status: StatusCode.SUCCESS,
        supportPickupInnerLocker: storeInfo.detail.supportPickupInnerLocker,
        supportPickupPlace: storeInfo.detail.supportPickupPlace,
        supportPickupPlaceParking: storeInfo.detail.supportPickupPlaceParking,
      };
    } catch (e: any) {
      this.commonService.logException(
        'while checking Selectable PickUpLocations for store getting error',
        `${e.message}`,
      );
      return { status: StatusCode.FAILURE };
    }
  }

  public checkStoreMasterAvailableFlag(
    storeInfo: StoreInfoResponse,
    isStorePaymentSelected: boolean,
    isMember: boolean,
  ) {
    if (
      storeInfo?.detail?.supportPickupInnerLocker === true &&
      storeInfo?.detail?.supportPickupPlace === true &&
      storeInfo?.detail?.supportPickupPlaceParking === true
    ) {
      if (isStorePaymentSelected === true) {
        if (isMember === true) {
          this.logger.info(`chosen isStorePaymentSelected && isMember is true`);
          storeInfo.detail.supportPickupInnerLocker = true;
          storeInfo.detail.supportPickupPlace = true;
          storeInfo.detail.supportPickupPlaceParking = true;
        } else if (isMember === false) {
          this.logger.info(
            `chosen isStorePaymentSelected is true && isMember is false`,
          );
          storeInfo.detail.supportPickupInnerLocker = true;
          storeInfo.detail.supportPickupPlace = false;
          storeInfo.detail.supportPickupPlaceParking = false;
        }
      } else if (isStorePaymentSelected === false) {
        if (isMember === true || isMember === false) {
          this.logger.info(
            `chosen isStorePaymentSelected is false && isMember is true or false`,
          );
          storeInfo.detail.supportPickupInnerLocker = true;
          storeInfo.detail.supportPickupPlace = false;
          storeInfo.detail.supportPickupPlaceParking = false;
        }
      }
    } else if (
      storeInfo?.detail?.supportPickupInnerLocker === false ||
      storeInfo?.detail?.supportPickupPlace === false ||
      storeInfo?.detail?.supportPickupPlaceParking === false
    ) {
      this.logger.info(
        `If any store master flag is false in store Info then set supportPickupInnerLocker,supportPickupPlace,supportPickupPlaceParking to false`,
      );
      storeInfo.detail.supportPickupInnerLocker = false;
      storeInfo.detail.supportPickupPlace = false;
      storeInfo.detail.supportPickupPlaceParking = false;
    }
  }

  /**
   * @param {productItems} ProductItem[] - Array of product items with product details object
   * @return {object}
   */
  public confirmPurchaseProductType(
    productItems: ProductItems[],
  ): ConfirmProductPurchaseResponse {
    this.logger.info('start: confirmPurchaseProductType');
    const productPurchaseType: ConfirmProductPurchaseResponse = {
      status: StatusCode?.SUCCESS,
      hasGiftProducts: false,
      hasWebBackOrder: false,
    };
    try {
      if (productItems.length === 0) {
        this.logger.info(
          'productItems should not be null or empty , it should be passed with product data',
        );
        return { status: StatusCode.FAILURE };
      }
      productItems.forEach((res: ProductItems) => {
        // check product is fathers day or mothers day
        if (
          res.product.customizedProductCategory ===
            checkItemCategory.FATHERS_DAY.id ||
          res.product.customizedProductCategory ===
            checkItemCategory.MOTHERS_DAY.id
        ) {
          this.logger.info(`${res.productId} product has gift item`);
          productPurchaseType.hasGiftProducts = true;
        }
        // check product has webBackOrder
        if (res.isWebBackOrder === true) {
          this.logger.info(`${res.productId} product Includes web back order`);
          productPurchaseType.hasWebBackOrder = true;
        }
        return productPurchaseType;
      });
      this.logger.info('end: confirmPurchaseProductType');
    } catch (e: any) {
      this.commonService.logException(
        'while Confirming the type of product purchased getting error',
        `${e.message}`,
      );
      return { status: StatusCode.FAILURE };
    }
    return productPurchaseType;
  }

  /**
   *  // Creating an object for delivery address information
   * @param {isMember} boolean - A boolean value
   * @param {member}  any - Object of member
   * @param {selectedAddressBookId} string - selectedAddressBookId as string
   * @param {amazonInfo} any - Object of Amazon address
   * @param {addressBook} Array - Array of address
   * @param {guestInputInfo} any -
   * @return {CreateShippingInfoResponse}   object -
   *
   * @throws {Error} Will throw an error if method is something went wrong
   */
  public createShippingInfo(
    isMember: boolean,
    member: any,
    selectedAddressBookId: string,
    amazonInfo: any,
    addressBook: Array<any>,
    guestInputInfo: any,
  ): Partial<CreateShippingInfoResponse> {
    let status: number = StatusCode.SUCCESS;
    let shippingInfo;
    this.logger.info('createShippingInfo: started');
    if (
      this.validation.isValidParamCreateShippingInfo(
        isMember,
        member,
        addressBook,
        selectedAddressBookId,
        amazonInfo,
      )
    ) {
      try {
        if (!amazonInfo) {
          if (isMember === true) {
            this.logger.info(
              'createShippingInfo: while isMember is true and selectedAddressBookId is null',
            );
            if (selectedAddressBookId === null) {
              shippingInfo = this.setShippingInfoFromMember(member);
            } else {
              this.logger.info(
                'createShippingInfo: while isMember is true and selectedAddressBookId is not null',
              );
              const selectedAddressBook = addressBook.find(
                (addressBookValue) =>
                  addressBookValue.id === selectedAddressBookId,
              );
              if (selectedAddressBook) {
                shippingInfo =
                  this.setShippingInfoFromAddressBook(selectedAddressBook);
              } else {
                status = StatusCode.FAILURE;
              }
            }
          } else if (guestInputInfo) {
            this.logger.info(
              'createShippingInfo: while isMember is false and guestInputInfo is not null',
            );
            shippingInfo = this.setShippingInfoFromGuestInput(guestInputInfo);
          } else {
            this.logger.info('createShippingInfo: when not created');
            status = StatusCode.SUCCESS;
          }
        } else {
          this.logger.info(
            'createShippingInfo: while isMember is false and amazonInfo is not null',
          );
          if (amazonInfo.shipping) {
            shippingInfo = this.setShippingInfoFromAmazonInfo(amazonInfo);
          } else {
            this.logger.info(
              'createShippingInfo: while isMember is false and amazonInfo is not null but amazonInfo.shipping null',
            );
            status = StatusCode.FAILURE;
          }
        }
        return { status, shippingInfo };
      } catch (e: any) {
        this.logger.error('Error', e);
        return { status: StatusCode.FAILURE };
      }
    }
    this.logger.info('createShippingInfo: ended');
    return { status: StatusCode.FAILURE };
  }

  public setShippingInfoFromMember(member: any) {
    const shippingInfo: Partial<ShippingInfo> = {};
    shippingInfo.shippingLastName = member.lastName;
    shippingInfo.shippingFirstName = member.firstName;
    shippingInfo.shippingLastNameKana = member.lastNameKana;
    shippingInfo.shippingFirstNameKana = member.firstNameKana;
    shippingInfo.shippingZipCode = member.postCode;
    shippingInfo.shippingPrefecture = member.prefectures;
    shippingInfo.shippingCity = member.city;
    shippingInfo.shippingAddress1 = member.address1;
    shippingInfo.shippingAddress2 = member.address2;
    shippingInfo.shippingCompanyName = member.CompanyName;
    shippingInfo.shippingDepartmentName = member.DepartmentName;
    shippingInfo.shippingPhone = member.phoneNumber;
    shippingInfo.selectedAddressBookId = null;
    shippingInfo.unattendedDeliveryFlag = false;
    shippingInfo.isGift = false;
    shippingInfo.isAmazonPayAddress = false;
    return shippingInfo;
  }

  public setShippingInfoFromAddressBook(addressBook: any) {
    const shippingInfo: Partial<ShippingInfo> = {};
    shippingInfo.shippingLastName = addressBook.lastName;
    shippingInfo.shippingFirstName = addressBook.firstName;
    shippingInfo.shippingLastNameKana = addressBook.lastNameKana;
    shippingInfo.shippingFirstNameKana = addressBook.firstNameKana;
    shippingInfo.shippingZipCode = addressBook.zipCode;
    shippingInfo.shippingPrefecture = addressBook.prefecture;
    shippingInfo.shippingCity = addressBook.address1;
    shippingInfo.shippingAddress1 = addressBook.address2;
    shippingInfo.shippingAddress2 = addressBook.address3;
    shippingInfo.shippingCompanyName = addressBook.companyName;
    shippingInfo.shippingDepartmentName = addressBook.departmentName;
    shippingInfo.shippingPhone = addressBook.phone;
    shippingInfo.selectedAddressBookId = addressBook.id;
    shippingInfo.unattendedDeliveryFlag = false;
    shippingInfo.isGift = false;
    shippingInfo.isAmazonPayAddress = false;
    return shippingInfo;
  }

  public setShippingInfoFromAmazonInfo(amazonInfo: any) {
    const shippingFromAmazonInfo = amazonInfo.shipping.editedValues;
    const shippingInfo: Partial<ShippingInfo> = {};
    shippingInfo.shippingLastName = shippingFromAmazonInfo.amazonLastName;
    shippingInfo.shippingFirstName = shippingFromAmazonInfo.amazonFirstName;
    shippingInfo.shippingLastNameKana = null;
    shippingInfo.shippingFirstNameKana = null;
    shippingInfo.shippingZipCode = shippingFromAmazonInfo.amazonPostalCode;
    shippingInfo.shippingPrefecture =
      shippingFromAmazonInfo.amazonStateOrRegion;
    shippingInfo.shippingCity = shippingFromAmazonInfo.amazonCity;
    shippingInfo.shippingAddress1 = shippingFromAmazonInfo.amazonAddress1;
    shippingInfo.shippingAddress2 = shippingFromAmazonInfo.amazonAddress2;
    shippingInfo.shippingCompanyName = null;
    shippingInfo.shippingDepartmentName = null;
    shippingInfo.shippingPhone = shippingFromAmazonInfo.amazonPhoneNumber;
    shippingInfo.selectedAddressBookId = null;
    shippingInfo.unattendedDeliveryFlag = false;
    shippingInfo.isGift = false;
    shippingInfo.isAmazonPayAddress = true;
    return shippingInfo;
  }

  public setShippingInfoFromGuestInput(guestInputInfo: any) {
    if (Object.keys(guestInputInfo).length > 0) {
      const shippingInfo: Partial<ShippingInfo> = {};
      shippingInfo.shippingLastName = guestInputInfo.shippingLastName;
      shippingInfo.shippingFirstName = guestInputInfo.shippingFirstName;
      shippingInfo.shippingLastNameKana = guestInputInfo.shippingLastNameKana;
      shippingInfo.shippingFirstNameKana = guestInputInfo.shippingFirstNameKana;
      shippingInfo.shippingZipCode = guestInputInfo.shippingZipCode;
      shippingInfo.shippingPrefecture = guestInputInfo.shippingPrefecture;
      shippingInfo.shippingCity = guestInputInfo.shippingCity;
      shippingInfo.shippingAddress1 = guestInputInfo.shippingAddress1;
      shippingInfo.shippingAddress2 = guestInputInfo.shippingAddress2;
      shippingInfo.shippingCompanyName = guestInputInfo.shippingCompanyName;
      shippingInfo.shippingDepartmentName =
        guestInputInfo.shippingDepartmentName;
      shippingInfo.shippingPhone = guestInputInfo.shippingPhone;
      shippingInfo.selectedAddressBookId = null;
      shippingInfo.unattendedDeliveryFlag = guestInputInfo.isDeliveryBox;
      shippingInfo.isGift = guestInputInfo.isGift;
      shippingInfo.isAmazonPayAddress = false;
      return shippingInfo;
    }
    return null;
  }

  /*
   * GMO禁則文字チェック
   *
   *   使用可能文字は以下とする。
   *     JIS X 0208 に準拠した以下の文字
   *     ・ASCII 文字
   *     ・非漢字（０１区～０８区）
   *     ・JIS 第１水準漢字（１６区～４７区）
   *     ・JIS 第２水準漢字（４８区～８４区）
   *     ・拡張漢字（８９区～９２ 区、１１５区～１１９区）
   *
   * @param {stringToCheck} string - pass a string to check invalid characters present or not
   * @return {boolean} - Result defines string has unavailable characters  or not 使用不可文字が含まれる:true、使用可能文字のみ:false
   */
  public hasIllegalCharacters(stringToCheck: string) {
    this.logger.info('start: hasIllegalCharacters');
    const availableCharacters = require('../../config/usableCharacterList');
    const eachCharacterInList = stringToCheck.split('');
    const isExistIllegalCharacters = eachCharacterInList.some(
      (char) => availableCharacters.GMO_VALID_CHARACTERS.indexOf(char) < 0,
    );
    if (isExistIllegalCharacters === true) {
      this.logger.info(
        'There are characters that cannot be used and this is end of hasIllegalCharacters function',
      );
      return true;
    }
    this.logger.info(
      'There are no invalid characters and this is end of hasIllegalCharacters function',
    );
    return false;
  }
}
