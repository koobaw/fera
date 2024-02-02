import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { CommonService } from '@cainz-next-gen/common';
import { GlobalsModule } from '../../globals.module';
import { InventoriesController } from './inventories.controller';
import { InventoriesService } from './inventories.service';
import { InventoriesMuleApiService } from './inventories-mule-api/inventories-mule-api.service';
import { FindInventoriesDto } from './dto/find.inventories.dto';

describe('InventoriesController', () => {
  let inventoriesController: InventoriesController;
  let inventoriesService: InventoriesService;
  let commonService: CommonService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      controllers: [InventoriesController],
      providers: [InventoriesService, InventoriesMuleApiService],
    }).compile();

    inventoriesController = moduleRef.get<InventoriesController>(
      InventoriesController,
    );
    inventoriesService = moduleRef.get<InventoriesService>(InventoriesService);
    commonService = moduleRef.get<CommonService>(CommonService);
  });

  it('should be defined', () => {
    expect(inventoriesController).toBeDefined();
  });

  it('should be defined method', () => {
    expect(inventoriesController.findInventories).toBeDefined();
  });

  it('should be saved to firestore', async () => {
    jest.spyOn(inventoriesService, 'fetchInventories').mockImplementation();
    jest.spyOn(inventoriesService, 'saveToFirestore').mockImplementation();
    jest.spyOn(commonService, 'createFirestoreSystemName').mockImplementation();

    await inventoriesController.findInventories(
      {} as Request,
      {} as FindInventoriesDto,
      true,
      1.0,
    );

    expect(inventoriesService.fetchInventories).toBeCalled();
    expect(inventoriesService.saveToFirestore).toBeCalled();
  });

  it('should not be saved to firestore', async () => {
    jest.spyOn(inventoriesService, 'fetchInventories').mockImplementation();
    jest.spyOn(inventoriesService, 'saveToFirestore').mockImplementation();
    jest.spyOn(commonService, 'createFirestoreSystemName').mockImplementation();

    await inventoriesController.findInventories(
      {} as Request,
      {} as FindInventoriesDto,
      false,
      1.0,
    );

    expect(inventoriesService.fetchInventories).toBeCalled();
    expect(inventoriesService.saveToFirestore).not.toBeCalled();
  });
});
