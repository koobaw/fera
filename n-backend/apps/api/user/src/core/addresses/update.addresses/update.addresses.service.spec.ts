import { LoggingService } from '@fera-next-gen/logging';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressesService } from './update.addresses.service';
import { GlobalsModule } from '../../../globals.module';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';

describe('PointService', () => {
  let updateAddressesService: UpdateAddressesService;
  let addressesMuleApiService: AddressesMuleApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        UpdateAddressesService,
        AddressesMuleApiService,
        {
          provide: LoggingService,
          useFactory: () => ({
            debug: jest.fn(),
            info: jest.fn(),
          }),
        },
      ],
    }).compile();

    updateAddressesService = module.get<UpdateAddressesService>(
      UpdateAddressesService,
    );
    addressesMuleApiService = module.get<AddressesMuleApiService>(
      AddressesMuleApiService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(updateAddressesService).toBeDefined();
  });

  it('should be these methods', () => {
    expect(updateAddressesService.updateAddress).toBeDefined();
  });

  describe('updateAddress', () => {
    it('should be fetched and transformed from api', async () => {
      jest.spyOn(addressesMuleApiService, 'updateAddress').mockImplementation();
      updateAddressesService.updateAddress(
        { addressId: 'addressId' },
        {
          isFavorite: false,
          title: '',
          firstName: '',
          lastName: '',
          firstNameKana: '',
          lastNameKana: '',
          zipCode: '',
          prefecture: '',
          address1: '',
          address2: '',
          address3: '',
          phone: '',
          phone2: '',
          email: '',
          companyName: '',
          departmentName: '',
          memo: '',
          isDeleted: false,
        },
      );
      expect(addressesMuleApiService.updateAddress).toBeCalled();
    });
  });
});
