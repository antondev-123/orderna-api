import { Test, TestingModule } from '@nestjs/testing';
import { AccountingRepository } from './accounting.repository';
import { AccountingService } from './accounting.service';

describe('AccountingService', () => {
  let service: AccountingService;
  let accountinRepository: AccountingRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: AccountingRepository,
          useValue: {
            getDailySummary: jest.fn(),
            aggregateSummaryDetails: jest.fn(),
            getAllTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
