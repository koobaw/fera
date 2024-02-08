import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { LoggingService } from '@cainz-next-gen/logging';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { FirestoreBatchService } from '@cainz-next-gen/firestore-batch';
import { CheckinService } from './checkin.service';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { PocketRegiCheckinCommonService } from '../../utils/checkin.utils';

const mockFirestoreBatchService = {
  findCollection: jest.fn(),
  batchSet: jest.fn(),
  batchDelete: jest.fn(),
  batchCommit: jest.fn(),
  getTotalOperationCnt: jest.fn(),
};

const mockCheckinUtils = {
  validateAllowedQrCodeData: jest.fn(),
  getShopcodeFromQrData: jest.fn(),
  getFirestoreDocRef: jest.fn(),
  getFirestoreSubDocRef: jest.fn(),
  getDocumentFromCollection: jest.fn(),
  getDocumentFromSubCollection: jest.fn(),
  checkUserFromCollection: jest.fn(),
};

describe('CheckinService', () => {
  let checkinService: CheckinService;
  let checkInUtils: PocketRegiCheckinCommonService;
  let commonService: CommonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        CheckinService,
        {
          provide: CommonService,
          useFactory: () => ({
            logException: jest.fn(),
            createMd5: jest.fn(),
            createFirestoreSystemName: jest.fn(),
          }),
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
          provide: FirestoreBatchService,
          useFactory: () => mockFirestoreBatchService,
        },
        {
          provide: PocketRegiCheckinCommonService,
          useFactory: () => mockCheckinUtils,
        },
      ],
    }).compile();

    checkinService = module.get<CheckinService>(CheckinService);

    checkInUtils = module.get<PocketRegiCheckinCommonService>(
      PocketRegiCheckinCommonService,
    );
    commonService = module.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(checkinService).toBeDefined();
    expect(checkinService.pocketRegiCheckIn).toBeDefined();
  });

  describe('pocketRegiCheckIn main function', () => {
    it('should successfully check in', async () => {
      // Mock FirestoreBatchService methods

      const getDocMock = jest.fn(async () => ({
        data: () => ({ name: 'John Doe' }),
      }));

      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(() => ({
          get: getDocMock,
        })),
      });

      const data = {
        name: 'abc',
        code: '123',
        address: 'storeAddress',
      };

      const docMock = {
        data,
        shopcode: '123',
        status: HttpStatus.OK,
      };

      jest.spyOn(checkinService, 'getShopDetails').mockResolvedValue(docMock);
      jest
        .spyOn(checkInUtils, 'validateAllowedQrCodeData')
        .mockReturnValue(true);

      jest
        .spyOn(checkInUtils, 'checkUserFromCollection')
        .mockResolvedValue(true);

      // Create a spy for the saveToFirestore method
      const saveToFirestoreMock = jest
        .spyOn(checkinService, 'saveToFirestore')
        .mockResolvedValue(undefined);

      const qrCodeData = 'sampleQrCodeData';
      const encryptedMemberId = 'sampleMemberId';
      const operatorName = 'some operator name';
      const shopcode = '123';
      const result = await checkinService.pocketRegiCheckIn(
        qrCodeData,
        encryptedMemberId,
        operatorName,
      );

      // Assertions for the successful check-in
      expect(result.code).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('OK');
      expect(saveToFirestoreMock).toHaveBeenCalledWith(
        encryptedMemberId,
        shopcode,
        operatorName,
      );

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should throw error check in', async () => {
      // Mock FirestoreBatchService methods

      const getDocMock = jest.fn(async () => new Error('Mocked error'));
      mockFirestoreBatchService.findCollection.mockReturnValue({
        doc: jest.fn(() => ({
          get: getDocMock,
        })),
      });

      const data = {
        name: 'abc',
        code: '123',
        address: 'storeAddress',
      };

      const docMock = {
        data,
        shopcode: '123',
        status: HttpStatus.OK,
      };

      jest.spyOn(checkinService, 'getShopDetails').mockResolvedValue(docMock);

      // Create a spy for the saveToFirestore method
      jest
        .spyOn(checkinService, 'saveToFirestore')
        .mockResolvedValue(undefined);

      const qrCodeData = 'sampleQRCodeData';
      const encryptedMemberId = 'sampleUserId';
      const operatorName = 'some operator name';

      try {
        // Call the function being tested
        await checkinService.pocketRegiCheckIn(
          qrCodeData,
          encryptedMemberId,
          operatorName,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: ErrorMessage[ErrorCode.USER_NOT_FOUND],
        });
        expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for invalid qr code', async () => {
      const qrCodeData = '';
      const encryptedMemberId = 'sampleUserId';
      const operatorName = 'some operator name';

      jest
        .spyOn(checkInUtils, 'validateAllowedQrCodeData')
        .mockReturnValue(false);

      try {
        // Call the function being tested
        await checkinService.pocketRegiCheckIn(
          qrCodeData,
          encryptedMemberId,
          operatorName,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.INVALID_SHOP_CODE,
          message: ErrorMessage[ErrorCode.INVALID_SHOP_CODE],
        });
        expect(e.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for invalid user', async () => {
      const qrCodeData = 'dummyShopCode';
      const encryptedMemberId = '';
      const operatorName = 'some operator name';

      jest
        .spyOn(checkInUtils, 'validateAllowedQrCodeData')
        .mockReturnValue(true);

      jest
        .spyOn(checkInUtils, 'checkUserFromCollection')
        .mockResolvedValue(false);

      try {
        // Call the function being tested
        await checkinService.pocketRegiCheckIn(
          qrCodeData,
          encryptedMemberId,
          operatorName,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: ErrorMessage[ErrorCode.USER_NOT_FOUND],
        });
        expect(e.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for invalid shop code', async () => {
      const qrCodeData = 'dummyShopCode';
      const encryptedMemberId = 'someMemberId';
      const operatorName = 'some operator name';

      const mockErroShopDoc = {
        errorCode: ErrorCode.INVALID_SHOP_CODE,
        status: HttpStatus.NOT_FOUND,
      };

      jest
        .spyOn(checkInUtils, 'validateAllowedQrCodeData')
        .mockReturnValue(true);

      jest
        .spyOn(checkInUtils, 'checkUserFromCollection')
        .mockResolvedValue(true);
      jest
        .spyOn(checkinService, 'getShopDetails')
        .mockResolvedValue(mockErroShopDoc);

      try {
        // Call the function being tested
        await checkinService.pocketRegiCheckIn(
          qrCodeData,
          encryptedMemberId,
          operatorName,
        );
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.INVALID_SHOP_CODE,
          message: ErrorMessage[ErrorCode.INVALID_SHOP_CODE],
        });
        expect(e.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('getShopDetails', () => {
    it('it should throw error of internal server error', async () => {
      const qrCodeData = undefined;

      jest.spyOn(commonService, 'createMd5').mockReturnValue('encryptedShopId');
      jest
        .spyOn(checkInUtils, 'getShopcodeFromQrData')
        .mockReturnValue(undefined);
      jest
        .spyOn(checkInUtils, 'getDocumentFromCollection')
        .mockImplementation(() => {
          throw new Error();
        });

      // Call the function being tested
      try {
        await checkinService.getShopDetails(qrCodeData);
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.INTERAL_API_ERROR,
          message: ErrorMessage[ErrorCode.INTERAL_API_ERROR],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for invalid shop code for firestore document', async () => {
      const qrCodeData = 'dummyQrCodeData';

      jest.spyOn(commonService, 'createMd5').mockReturnValue('encryptedShopId');
      jest.spyOn(checkInUtils, 'getShopcodeFromQrData').mockReturnValue('123');

      const mockErrorDoc = { doc: undefined, docRef: undefined };
      jest
        .spyOn(checkInUtils, 'getDocumentFromCollection')
        .mockResolvedValue(mockErrorDoc);

      // Call the function being tested
      const response = await checkinService.getShopDetails(qrCodeData);
      expect(response.errorCode).toEqual(ErrorCode.INVALID_SHOP_CODE);
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for invalid shop code for firestore sub document', async () => {
      const qrCodeData = 'cainzapp://qr?shopcode=0123';

      jest.spyOn(commonService, 'createMd5').mockReturnValue('encryptedShopId');

      const mockErrorDoc = { doc: { name: 'test' }, docRef: undefined };
      jest
        .spyOn(checkInUtils, 'getDocumentFromCollection')
        .mockResolvedValue(mockErrorDoc);

      const mockErrorSubDoc = { subDoc: undefined, subDocRef: undefined };
      jest
        .spyOn(checkInUtils, 'getDocumentFromSubCollection')
        .mockResolvedValue(mockErrorSubDoc);

      // Call the function being tested
      const response = await checkinService.getShopDetails(qrCodeData);
      expect(response.errorCode).toEqual(ErrorCode.INVALID_SHOP_CODE);
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should throw error for shop is not eligble for pocket regi', async () => {
      const qrCodeData = 'cainzapp://qr?shopcode=0123';

      jest.spyOn(commonService, 'createMd5').mockReturnValue('encryptedShopId');

      const mockErrorDoc = { doc: { name: 'test' }, docRef: undefined };
      jest
        .spyOn(checkInUtils, 'getDocumentFromCollection')
        .mockResolvedValue(mockErrorDoc);

      const mockErrorSubDoc = {
        subDoc: { name: 'test', supportPocketRegi: false },
        subDocRef: undefined,
      };
      jest
        .spyOn(checkInUtils, 'getDocumentFromSubCollection')
        .mockResolvedValue(mockErrorSubDoc);

      // Call the function being tested
      const response = await checkinService.getShopDetails(qrCodeData);
      expect(response.errorCode).toEqual(ErrorCode.UNSUPPORTED_SHOP_CODE);
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('it should return shop detail with success', async () => {
      const qrCodeData = 'cainzapp://qr?shopcode=0123';

      jest.spyOn(commonService, 'createMd5').mockReturnValue('encryptedShopId');

      const mockErrorDoc = { doc: { name: 'test' }, docRef: undefined };
      jest
        .spyOn(checkInUtils, 'getDocumentFromCollection')
        .mockResolvedValue(mockErrorDoc);

      const mockErrorSubDoc = {
        subDoc: { name: 'test', supportPocketRegi: true },
        subDocRef: undefined,
      };
      jest
        .spyOn(checkInUtils, 'getDocumentFromSubCollection')
        .mockResolvedValue(mockErrorSubDoc);

      // Call the function being tested
      const response = await checkinService.getShopDetails(qrCodeData);
      expect(response.shopcode).toEqual('123');
      expect(response.status).toEqual(HttpStatus.OK);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });

  describe('saveToFirestore', () => {
    it('should save data to firestore', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });

      mockFirestoreBatchService.batchSet.mockResolvedValue(true);
      mockFirestoreBatchService.batchCommit.mockResolvedValue(true);
      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');

      const docId = 'sampleDocId';
      const storeCode = '345';
      const operatorName = 'some operator name';

      await checkinService.saveToFirestore(docId, storeCode, operatorName);
      expect(mockFirestoreBatchService.batchCommit).toHaveBeenCalledTimes(1);

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });

    it('should handle errors gracefully', async () => {
      mockFirestoreBatchService.findCollection.mockReturnValueOnce({
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            doc: jest.fn(), // Configure behavior for doc method as needed
          })),
        })),
      });

      // Mock FirestoreBatchService methods to throw an error
      mockFirestoreBatchService.batchSet.mockRejectedValue(
        new Error('Mocked error'),
      );

      mockFirestoreBatchService.batchCommit.mockRejectedValue(
        new Error('Mocked error'),
      );

      jest
        .spyOn(commonService, 'createMd5')
        .mockReturnValue('encryptedSubDocId');

      // Mock the necessary data and dependencies
      const docId = 'sampleDocId';
      const storeCode = '345';
      const operatorName = 'some operator name';

      try {
        // Call the function being tested
        await checkinService.saveToFirestore(docId, storeCode, operatorName);
      } catch (e: any) {
        // Assert that the exception is thrown correctly
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getResponse()).toEqual({
          errorCode: ErrorCode.INTERAL_API_ERROR,
          message: ErrorMessage[ErrorCode.INTERAL_API_ERROR],
        });
        expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Restore the original implementation of httpService.get
      jest.restoreAllMocks();
    });
  });
});
