import { Test, TestingModule } from '@nestjs/testing';
import { BreakService } from './break.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BreakEntity } from './break.entity';
import { Repository } from 'typeorm';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { CreateBreakDto } from './dtos/create-break.dto';
import { NotFoundException } from '@nestjs/common';
import { BreakIdDto } from './dtos/params-break.dto';
import { EditBreakDto } from './dtos/edit-break.dto';

describe('BreakService', () => {
  let breakService: BreakService;
  let breakRepository: Repository<BreakEntity>
  let attendanceRepository: Repository<AttendanceEntity>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreakService,
        {
          provide: getRepositoryToken(BreakEntity),
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
        }
      ],
    }).compile();

    breakService = module.get<BreakService>(BreakService);
    breakRepository = module.get<Repository<BreakEntity>>(getRepositoryToken(BreakEntity));
    attendanceRepository = module.get<Repository<AttendanceEntity>>(getRepositoryToken(AttendanceEntity));

  });

  it('should be defined', () => {
    expect(breakService).toBeDefined();
  });

  describe('addBreak', () => {
    it('should add a new break successfully', async () => {
      const createBreakDto: CreateBreakDto = {
        start: new Date(),
        end: new Date(),
        attendanceId: 1,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(createBreakDto.attendanceId);
      (breakRepository.create as jest.Mock).mockReturnValue(null);
      (breakRepository.save as jest.Mock).mockResolvedValue(createBreakDto);

      const result = await breakService.addBreak(createBreakDto);
      expect(result).toEqual(null);
    });

    it('should return not found if attendance does not exist', async () => {
      const createBreakDto: CreateBreakDto = {
        start: new Date(),
        end: new Date(),
        attendanceId: 100,
      };

      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(breakService.addBreak(createBreakDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("editBreak", () => {
    it('should edit an existing break successfully', async () => {
      const breakIdDto: BreakIdDto = { breakId: 1 };
      const editBreakDto: EditBreakDto = {
        start: new Date(),
        end: new Date(),
        attendanceId: 1,
      };

      const breakData = new BreakEntity();
      breakData.start = editBreakDto.start;
      breakData.end = editBreakDto.end;
      breakData.attendanceId = breakIdDto.breakId;

      (breakRepository.findOne as jest.Mock).mockResolvedValue(breakData);
      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(editBreakDto.attendanceId);

      const editBreak = { ...breakData, ...editBreakDto };

      (breakRepository.save as jest.Mock).mockResolvedValue(editBreak);

      const result = await breakService.editBreak(breakIdDto, editBreakDto);
      expect(result).toEqual(editBreak);
    });

    it('should return not found if break does not exist', async () => {
      const breakIdDto: BreakIdDto = { breakId: 1 };
      const editBreakDto: EditBreakDto = {
        start: new Date(),
        end: new Date(),
        attendanceId: 1,
      };

      (breakRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(breakService.editBreak(breakIdDto, editBreakDto)).rejects.toThrow(NotFoundException)

    })

    it('should return not found if attendance does not exist', async () => {
      const breakIdDto: BreakIdDto = { breakId: 1 };
      const editBreakDto: EditBreakDto = {
        start: new Date(),
        end: new Date(),
        attendanceId: 1,
      };

      (breakRepository.findOne as jest.Mock).mockResolvedValue(breakIdDto.breakId);
      (attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);


      expect(breakService.editBreak(breakIdDto, editBreakDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("deleteBreak", () => {
    it('should delete a break successfully', async () => {
      const breakIdDto: BreakIdDto = { breakId: 1 };

      const breakData = new BreakEntity();
      breakData.id = breakIdDto.breakId;

      (breakRepository.findOne as jest.Mock).mockResolvedValue(breakData);
      (breakRepository.remove as jest.Mock).mockResolvedValue(breakData);

      const result = await breakService.deleteBreak(breakIdDto);
      expect(result).toEqual(breakData);
    })

    it('should return not found if break does not exist', async () => {
      const breakIdDto: BreakIdDto = { breakId: 1 };

      (breakRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(breakService.deleteBreak(breakIdDto)).rejects.toThrow(NotFoundException)

    })
  })
});
