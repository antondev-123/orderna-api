import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRedisService } from 'src/redis/services/auth-redis.service';
import { OpeningHours } from '../entities/opening-hours.entity';
import { OpeningHoursService } from '../services/opening-hours.service';
import { OpeningHoursController } from './opening-hours.controller';

describe('OpeningHoursController', () => {
  let controller: OpeningHoursController;
  let fakeOpeningHoursService: Partial<OpeningHoursService>;

  beforeEach(async () => {
    fakeOpeningHoursService = {
      findAll: () => {
        return Promise.resolve([
          { id: 1, openingDayOfWeek: 'Monday', openingTimeSlots: [] } as OpeningHours,
        ]);
      },
      findOne: (id: number) => {
        return Promise.resolve({ id, openingDayOfWeek: 'Monday', openingTimeSlots: [] } as OpeningHours);
      },

      remove: (id: number) => {
        return Promise.resolve();
      },
      removeBulk: (ids: number[]) => {
        return Promise.resolve();
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpeningHoursController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthRedisService,
          useValue: {
            saveTokenToRedis: jest.fn(),
            getTokenFromRedis: jest.fn(),
            deleteTokenFromRedis: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: OpeningHoursService,
          useValue: fakeOpeningHoursService,
        },
      ],
    }).compile();

    controller = module.get<OpeningHoursController>(OpeningHoursController);
  });

  it('Is Store Controller', () => {
    expect(controller).toBeDefined();
  });

  it('findAll returns ', async () => {
    const openingHours = await controller.findAll();
    expect(openingHours.length).toBe(1);
    expect(openingHours[0].openingDayOfWeek).toBe('Monday');
  });

  it('findOne ', async () => {
    const openingHour = await controller.findOne('1');
    expect(openingHour).toBeDefined();
    expect(openingHour.id).toBe(1);
  });


  it('remove ', async () => {
    await expect(controller.remove('1')).resolves.toBeUndefined();
  });

  it('removeBulk ', async () => {
    await expect(controller.removeBulk([1, 2, 3])).resolves.toBeUndefined();
  });
});
