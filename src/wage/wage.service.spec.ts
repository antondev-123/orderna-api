import { Test, TestingModule } from '@nestjs/testing';
import { WageService } from './wage.service';
import { Repository } from 'typeorm';
import { WageEntity } from './wage.entity';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateWageDto } from './dtos/create-wage.dto';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { WageIdDto } from './dtos/params-wage.dto';
import { EditWageDto } from './dtos/edit-wage.dto';

describe('WageService', () => {
  let wageService: WageService;
  let wageRepository: Repository<WageEntity>;
  let attendanceRepository: Repository<AttendanceEntity>;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WageService,
        {
          provide: getRepositoryToken(WageEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AttendanceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        }
      ],
    }).compile();

    wageService = module.get<WageService>(WageService);
    wageRepository = module.get<Repository<WageEntity>>(getRepositoryToken(WageEntity));
    attendanceRepository = module.get<Repository<AttendanceEntity>>(getRepositoryToken(AttendanceEntity));
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(wageService).toBeDefined();
  });

  describe('addWage', () => {
    it('should add a new attendance successfully', async () => {
      const createWageDto: CreateWageDto = {
        ratePerHour: 20,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(createWageDto.attendanceId);
      (userRepository.findOne as jest.Mock).mockResolvedValue(createWageDto.userId);
      (wageRepository.create as jest.Mock).mockReturnValue(null);
      (wageRepository.save as jest.Mock).mockResolvedValue(createWageDto);

      const result = await wageService.addWage(createWageDto);
      expect(result).toEqual(null);
    });

    it('should return not found if attendance does not exist', async () => {
      const createWageDto: CreateWageDto = {
        ratePerHour: 20,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.addWage(createWageDto)).rejects.toThrow(NotFoundException)
    })

    it('should return not found if user does not exist', async () => {
      const createWageDto: CreateWageDto = {
        ratePerHour: 20,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(createWageDto.attendanceId);
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.addWage(createWageDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("editWage", () => {
    it('should edit an existing wage successfully', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      const editWageDto: EditWageDto = {
        ratePerHour: 50,
        userId: 1,
        attendanceId: 1,
      };

      const wage = new WageEntity();
      wage.ratePerHour = editWageDto.ratePerHour;
      wage.userId = editWageDto.userId;
      wage.attendanceId = wageIdDto.wageId;

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(editWageDto.attendanceId);
      (userRepository.findOne as jest.Mock).mockResolvedValue(editWageDto.userId);
      (wageRepository.findOne as jest.Mock).mockResolvedValue(wage);

      const editWage = { ...wage, ...editWageDto };

      (wageRepository.save as jest.Mock).mockResolvedValue(editWage);

      const result = await wageService.editWage(wageIdDto, editWageDto);
      expect(result).toEqual(editWage);
    });

    it('should return not found if break does not exist', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      const editWageDto: EditWageDto = {
        ratePerHour: 50,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(editWageDto.attendanceId);
      (userRepository.findOne as jest.Mock).mockResolvedValue(editWageDto.userId);
      (wageRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.editWage(wageIdDto, editWageDto)).rejects.toThrow(NotFoundException)
    })


    it('should return not found if user does not exist', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      const editWageDto: EditWageDto = {
        ratePerHour: 50,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(editWageDto.attendanceId);
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.editWage(wageIdDto, editWageDto)).rejects.toThrow(NotFoundException)
    })

    it('should return not found if attendance does not exist', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      const editWageDto: EditWageDto = {
        ratePerHour: 50,
        userId: 1,
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.editWage(wageIdDto, editWageDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("deleteWage", () => {
    it('should delete a wage successfully', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      const wage = new WageEntity();
      wage.id = wageIdDto.wageId;

      (wageRepository.findOne as jest.Mock).mockResolvedValue(wage);
      (wageRepository.remove as jest.Mock).mockResolvedValue(wage);

      const result = await wageService.deleteWage(wageIdDto);
      expect(result).toEqual(wage);
    })

    it('should return not found if break does not exist', async () => {
      const wageIdDto: WageIdDto = { wageId: 1 };

      (wageRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(wageService.deleteWage(wageIdDto)).rejects.toThrow(NotFoundException)
    })
  })
});
