import { Test, TestingModule } from '@nestjs/testing';
import { InventoriesService } from './inventories.service';
import { InventoriesData } from './data/inventories.data';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './inventories.entity'; // Adjust the import path according to your project structure

describe('InventoriesService', () => {
  let service: InventoriesService;
  let serviceData: InventoriesData;
  let repository: Repository<InventoryItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoriesService,
        InventoriesData,
        {
          provide: getRepositoryToken(InventoryItem),
          useClass: Repository, // This uses TypeORM's Repository class as a mock
        },
      ],
    }).compile();

    service = module.get<InventoriesService>(InventoriesService);
    serviceData = module.get<InventoriesData>(InventoriesData);
    repository = module.get<Repository<InventoryItem>>(getRepositoryToken(InventoryItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
