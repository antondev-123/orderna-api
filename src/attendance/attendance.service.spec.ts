import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as fs from 'fs';
import { WageEntity } from "src/wage/wage.entity";
import { Repository } from "typeorm";
import { AttendanceEntity } from "./attendance.entity";
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dtos/create-attendance.dto";
import { AttendanceIdDto } from "./dtos/params-attendance.dto";
import { UpdateAttendanceDto } from "./dtos/update-attendance.dto";

describe("AttendanceService", () => {
	let attendanceService: AttendanceService;
	let attendanceRepository: Repository<AttendanceEntity>;
	let wageRepository: Repository<WageEntity>;


	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AttendanceService,
				{
					provide: getRepositoryToken(AttendanceEntity),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findOne: jest.fn(),
						remove: jest.fn(),
						findBy: jest.fn()
					}
				},
				{
					provide: getRepositoryToken(WageEntity),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findOne: jest.fn(),
						remove: jest.fn(),
						findBy: jest.fn()
					}
				}
			],
		}).compile();

		attendanceService = module.get<AttendanceService>(AttendanceService);
		attendanceRepository = module.get<Repository<AttendanceEntity>>(getRepositoryToken(AttendanceEntity));
		wageRepository = module.get<Repository<WageEntity>>(getRepositoryToken(WageEntity));

		jest.spyOn(fs, 'unlink').mockImplementation((filePath, callback) => {
			callback(null);
		});
	});

	it("should be defined", () => {
		expect(attendanceService).toBeDefined();
	});



	describe("addAttendance", () => {
		it("should add a new attendance successfully", async () => {
			const createAttendanceDto: CreateAttendanceDto = {
				clockIn: new Date("2024-06-06T18:20:30.000Z"),
				clockOut: new Date("2024-06-06T18:20:30.000Z"),
				userId: 1,
				storeId: 1,
				clockInImageUrl: "1jpg",
				clockOutImageUrl: "2jpg",
			}

			const files = [
				{
					fieldname: "clockInImageUrl",
					originalname: "1.jpg",
					encoding: '7bit',
					mimetype: "image/png",
					buffer: Buffer.from('mockImageBuffer1')
				},
				{
					fieldname: "clockOutImageUrl",
					originalname: "2.jpg",
					encoding: '7bit',
					mimetype: "image/png",
					buffer: Buffer.from('mockImageBuffer2'),
				}
			]

			jest.spyOn(attendanceService, 'uploadAttendancePhoto').mockResolvedValueOnce('clockInUrl.jpg').mockResolvedValueOnce('clockOutUrl.jpg');

			const result = await attendanceService.addAttendance(createAttendanceDto, files[0], files[1]);
			expect(result).toEqual(undefined);

		});

	});

	describe("editAttendance", () => {
		it("should edit an existing attendance successfully", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };
			const updateAttendanceDto: UpdateAttendanceDto = {
				clockIn: new Date("2024-06-06T18:20:30.000Z"),
				clockOut: new Date("2024-06-06T18:20:30.000Z"),
				userId: 1,
				storeId: 1,
				clockInImageUrl: "1.jpg",
				clockOutImageUrl: "2.jpg",
			};

			const attendance = new AttendanceEntity();
			attendance.id = 1;
			attendance.clockInImageUrl = "1_old.jpg";
			attendance.clockOutImageUrl = "2_old.jpg";

			const files = [
				{
					fieldname: "clockInImageUrl",
					originalname: "1.jpg",
					encoding: '7bit',
					mimetype: "image/png",
					buffer: Buffer.from('mockImageBuffer1')
				},
				{
					fieldname: "clockOutImageUrl",
					originalname: "2.jpg",
					encoding: '7bit',
					mimetype: "image/png",
					buffer: Buffer.from('mockImageBuffer2'),
				}
			];

			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(attendance);
			jest.spyOn(attendanceService, 'uploadAttendancePhoto').mockResolvedValueOnce('clockInUrl.jpg').mockResolvedValueOnce('clockOutUrl.jpg');

			const result = await attendanceService.editAttendance(attendanceIdDto, updateAttendanceDto, files[0], files[1]);
			expect(result).toEqual(attendance);

			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("1_old.jpg"), expect.any(Function));
			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("2_old.jpg"), expect.any(Function));
		});

		it("should return not found if attendance does not exist", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };
			const updateAttendanceDto: UpdateAttendanceDto = {
				clockIn: new Date("2024-06-06T18:20:30.000Z"),
				clockOut: new Date("2024-06-06T18:20:30.000Z"),
				userId: 1,
				storeId: 1,
				clockInImageUrl: "1.jpg",
				clockOutImageUrl: "2.jpg",
			};

			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(attendanceService.editAttendance(attendanceIdDto, updateAttendanceDto, null, null)).rejects.toThrow(NotFoundException);
		});
	})

	describe("getAttendanceDetails", () => {
		it("should return attendance details", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };

			const attendance = new AttendanceEntity();
			attendance.id = 1;
			attendance.clockIn = new Date("2024-06-06T09:00:00.000Z");
			attendance.clockOut = new Date("2024-06-06T016:00:00.000Z");
			attendance.breaks = [];
			attendance.wages = [];


			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(
				attendance,
			);

			const result = await attendanceService.getAttendanceDetails(attendanceIdDto);
			expect(result).toEqual({
				breakHours: expect.any(Number),
				totalHours: expect.any(Number),
				totalPay: expect.any(Number),
				...attendance,
			});
		});

		it("should return not found if attendance does not exist", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };

			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(attendanceService.getAttendanceDetails(attendanceIdDto)).rejects.toThrow(NotFoundException);
		})
	})

	describe("deleteAttendance", () => {
		it("should delete an attendance successfully", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };

			const attendance = new AttendanceEntity();
			attendance.id = 1;
			attendance.clockInImageUrl = "1.jpg";
			attendance.clockOutImageUrl = "2.jpg";

			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(attendance);

			const result = await attendanceService.deleteAttendance(attendanceIdDto);
			expect(result).toEqual(attendance);

			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("1.jpg"), expect.any(Function));
			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("2.jpg"), expect.any(Function));
		});

		it("should return not found if attendance does not exist", async () => {
			const attendanceIdDto: AttendanceIdDto = { attendanceId: 1 };

			(attendanceRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(attendanceService.deleteAttendance(attendanceIdDto)).rejects.toThrow(NotFoundException);
		});
	})

	describe("deleteMultipleAttendances", () => {
		it("should delete multiple attendances successfully", async () => {
			const ids = [1, 2];

			const attendance1 = new AttendanceEntity();
			attendance1.id = 1;
			attendance1.clockInImageUrl = "1.jpg";
			attendance1.clockOutImageUrl = "2.jpg";

			const attendance2 = new AttendanceEntity();
			attendance2.id = 2;
			attendance2.clockInImageUrl = "3.jpg";
			attendance2.clockOutImageUrl = "4.jpg";

			const attendances = [attendance1, attendance2];

			(attendanceRepository.findBy as jest.Mock).mockResolvedValue(attendances);

			const result = await attendanceService.deleteMultipleAttendances(ids);
			expect(result).toEqual(attendances);

			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("1.jpg"), expect.any(Function));
			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("2.jpg"), expect.any(Function));
			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("3.jpg"), expect.any(Function));
			expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining("4.jpg"), expect.any(Function));
		});

		it("should return not found if none of the attendances exist", async () => {
			const ids = [1, 2];

			(attendanceRepository.findBy as jest.Mock).mockResolvedValue([]);

			await expect(attendanceService.deleteMultipleAttendances(ids)).rejects.toThrow(NotFoundException);
		});
	});
});



