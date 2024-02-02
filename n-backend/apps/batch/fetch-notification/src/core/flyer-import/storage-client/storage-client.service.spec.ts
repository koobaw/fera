import { Test, TestingModule } from '@nestjs/testing';
import { StorageClientService } from './storage-client.service';
import { GlobalsModule } from '../../../globals.module';

describe('StorageClientService', () => {
  let service: StorageClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalsModule],
      providers: [StorageClientService],
    }).compile();

    service = module.get<StorageClientService>(StorageClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
