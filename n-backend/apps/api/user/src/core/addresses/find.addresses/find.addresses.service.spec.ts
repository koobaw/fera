import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '@cainz-next-gen/logging';
import { FindAddressesService } from './find.addresses.service';
import { AddressesMuleApiService } from '../addresses-mule-api/addresses-mule-api.service';
import { GlobalsModule } from '../../../globals.module';

describe('FindAddressesService', () => {
  let service: FindAddressesService;
  let mockAddressesMuleApiService: Partial<AddressesMuleApiService>;

  beforeEach(async () => {
    mockAddressesMuleApiService = {
      fetchAddresses: jest.fn().mockImplementation((memberId: string) =>
        Promise.resolve([
          {
            id: 'addressId1',
            name: 'address name',
            accountId: memberId,
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
            id: 'addressId2',
            name: 'address name2',
            accountId: memberId,
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
        ]),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [
        FindAddressesService,
        {
          provide: AddressesMuleApiService,
          useValue: mockAddressesMuleApiService,
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

    service = module.get<FindAddressesService>(FindAddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be defined method', () => {
    expect(service.getAddresses).toBeDefined();
  });

  describe('getAddresses', () => {
    it('should return transformed address lists', async () => {
      const memberId = 'testMemberId';

      const result = await service.getAddresses(memberId);

      // 期待される戻り値の構造を検証
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('addressId', 'addressId1');
      expect(result[1]).toHaveProperty('addressId', 'addressId2');
    });
  });
});
