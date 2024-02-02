import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '@cainz-next-gen/guard';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { CommonService } from '@cainz-next-gen/common';
import { FloormapController } from './floormap.controller';
import { FloormapService } from './floormap.service';
import { GlobalsModule } from '../../globals.module';
import { ErrorCode, ErrorMessage } from '../../types/constants/error-code';
import { FloorMapDto } from './dto/floormap.dto';

jest.useFakeTimers();

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp().getRequest();
    http.claims = {
      userId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
      encryptedMemberId: 'cdefHCgGQrhSTDCUT6unhgyogWD4',
    };
    return true; // always allow
  }
}

describe('FloormapController', () => {
  let controller: FloormapController;
  let commonService: CommonService;
  let app: INestApplication;

  const mockAuthGuard = new MockAuthGuard();

  const mockFloormapService = {
    getFloorMapDataFromDB: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [FloormapController],
      providers: [
        {
          provide: FloormapService,
          useFactory: () => mockFloormapService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();

    controller = module.get<FloormapController>(FloormapController);
    commonService = module.get<CommonService>(CommonService);
  });

  beforeEach(async () => {});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkFloormap', () => {
    it('should call the service method when making a GET request', async () => {
      const floormapData = {
        data: {
          naviList: [
            {
              title: 'Title',
              mapUrl: 'mockMapUrl',
              productIds: [
                {
                  productId: '100000000',
                  gondolas: [
                    {
                      fill: 'grey',
                      'fill-opacity': '0.5',
                      height: '32',
                      id: 'mockId',
                      width: '16',
                      x: '2488',
                      y: '772',
                      gondolaId: [
                        {
                          aisle: '26-2',
                          tier: 5,
                          row: 1,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        message: 'OK',
        code: 200,
      };

      // Mock the function before the code that should call it
      mockFloormapService.getFloorMapDataFromDB.mockResolvedValue(floormapData);

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
        .get('?storeCode=859&productIds=100000000')
        .set('Authorization', `Bearer ${mockRequest}`)
        .send({
          message: {
            data: '',
          },
        })
        .expect(200); // Assuming a successful response

      // Expect the mock to have been called at least once
      expect(mockFloormapService.getFloorMapDataFromDB).toBeCalled();
    }, 10000);

    it('should call createHttpException when storeCode is invalid', () => {
      // Arrange
      const invalidStoreCode = null; // Adjust to an invalid value for testing
      const invalidProductIds = ''; // Adjust to an invalid value for testing
      const detailDto: FloorMapDto = {
        storeCode: null,
        productIds: '4549509623410',
      };

      // Mock the createHttpException method so that it doesn't interfere with this test
      jest.spyOn(commonService, 'createHttpException').mockImplementation();

      // Mock the getFloorMapDataFromDB method so that it doesn't interfere with this test
      jest
        .spyOn(mockFloormapService, 'getFloorMapDataFromDB')
        .mockReturnValue([]);

      // Act
      controller.getFloorMap(detailDto);

      // Assert
      expect(commonService.createHttpException).toHaveBeenCalledWith(
        ErrorCode.FlOOR_MAP_BADREQUESTSTORECODE,
        ErrorMessage[ErrorCode.FlOOR_MAP_BADREQUESTSTORECODE],
        HttpStatus.BAD_REQUEST,
      );
    });
  });
});
