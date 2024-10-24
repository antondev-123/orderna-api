import { File } from "@nest-lab/fastify-multer";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnsupportedMediaTypeException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { differenceInHours, differenceInMinutes } from 'date-fns';
import * as fs from "fs";
import * as mime from "mime-types";
import * as path from "path";
import { FilterPeriod } from "src/common/constants/enums/filter-period.enum";
import { attendanceResponseMessage, errorResponseMessage, filterRepsonseMessage, generalRepsonseMessage } from "src/common/constants/response-messages";
import { WageEntity } from "src/wage/wage.entity";
import { In, Repository } from "typeorm";
import { AttendanceEntity } from "./attendance.entity";
import { CreateAttendanceDto } from "./dtos/create-attendance.dto";
import { FilterAttendanceDto } from "./dtos/filter-attendance.dto";
import { AttendanceIdDto } from "./dtos/params-attendance.dto";
import { UpdateAttendanceDto } from "./dtos/update-attendance.dto";

@Injectable()
export class AttendanceService {
	private readonly logger = new Logger(AttendanceService.name);
	constructor(
		@InjectRepository(AttendanceEntity)
		private attendanceRepository: Repository<AttendanceEntity>,
		@InjectRepository(WageEntity)
		private wageRepository: Repository<WageEntity>,
	) { }

	async getAttendanceList(
		filters: FilterAttendanceDto,
	) {
		try {
			const { storeId, name, period, page, limit } = filters;
			const query = this.attendanceRepository
				.createQueryBuilder("attendance")
				.leftJoinAndSelect("attendance.user", "attendance_user")
				.leftJoinAndSelect("attendance.wages", "attendance_wages")
				.leftJoinAndSelect(
					"attendance_user.contactInfo",
					"attendance_user_general",
				);

			if (storeId) {
				query.andWhere("attendance.storeId = :storeId", {
					storeId: storeId,
				});
			}

			if (name) {
				query.andWhere(
					"attendance_user_general.firstName LIKE :name OR attendance_user_general.lastName LIKE :name",
					{ name: `%${name}%` },
				);
			}

			if (period) {
				const date = new Date();
				switch (period) {
					case FilterPeriod.TODAY:
						query.andWhere("attendance.createdAt >= :startDate", {
							startDate: new Date(date.setHours(0, 0, 0, 0)),
						});
						break;
					case FilterPeriod.LAST_7_DAYS:
						query.andWhere("attendance.createdAt >= :startDate", {
							startDate: new Date(date.setDate(date.getDate() - 7)),
						});
						break;
					case FilterPeriod.LAST_4_WEEKS:
						query.andWhere("attendance.createdAt >= :startDate", {
							startDate: new Date(date.setDate(date.getDate() - 28)),
						});
						break;
					case FilterPeriod.LAST_12_MONTHS:
						query.andWhere("attendance.createdAt >= :startDate", {
							startDate: new Date(date.setMonth(date.getMonth() - 12)),
						});
						break;
					case FilterPeriod.MAX:
						break;
					default:
						throw new NotFoundException(
							filterRepsonseMessage.PERIOD_NOT_FOUND.EN,
							errorResponseMessage.NOT_FOUND.EN
						);
				}
			}

			if (limit) {
				query.take(limit);
			}

			if (limit && page) {
				query.skip((page - 1) * limit);
			}


			let result = [];

			(await query.getMany()).forEach((item) => {
				let data = {};
				let breakHours = 0;
				let totalHours = 0;
				let totalPay = 0;
				let hourlyPay = 0;

				if (item.breaks && item.breaks.length > 0) {
					item.breaks.map((breakItem) => {
						breakHours += differenceInHours(breakItem.end, breakItem.start);
					})
				}
				if (item.clockIn && item.clockOut) {
					totalHours = differenceInHours(item.clockOut, item.clockIn) - breakHours;
				}
				if (item.wages && item.wages.length > 0) {

					item.wages.map((wageItem) => {
						if (wageItem.userId == item.userId) {
							hourlyPay = wageItem.ratePerHour;
						}
						if (totalHours) {
							totalPay += wageItem.ratePerHour * totalHours;
						}
					})


				}
				data = {
					breakHours,
					hourlyPay,
					totalHours,
					totalPay,
					date: item.createdAt,
					name: item.user.contactInfo.firstName + ' ' + item.user.contactInfo.lastName,
				};
				result.push(data);
			})

			return { attendance: result, total_record: (await query.getMany()).length };
			// return query.getMany();

		} catch (error) {
			throw error;
		}
	}

	async getAttendanceDetails(attendanceIdDto: AttendanceIdDto) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
				relations: ["store", "breaks", "wages"],
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			let breakHours = 0;
			let totalHours = 0;
			let totalPay = 0;
			if (attendance.breaks && attendance.breaks.length > 0) {
				attendance.breaks.map((item) => {
					breakHours = differenceInHours(item.end, item.start);
				})
			}
			if (attendance.clockIn && attendance.clockOut) {
				totalHours = differenceInHours(attendance.clockOut, attendance.clockIn) - breakHours;
			}
			if (attendance.wages && attendance.wages.length > 0) {
				if (totalHours) {
					attendance.wages.map((item) => {
						totalPay = item.ratePerHour * totalHours;
					})
				}
			}

			const result = {
				breakHours,
				totalHours,
				totalPay,
				...attendance
			}

			return result;
		} catch (error) {
			throw error;
		}
	}

	async getAttendanceUser(attendanceIdDto: AttendanceIdDto) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
				relations: { user: { contactInfo: true } },
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			const { firstName, lastName, birthday, mobile, telephone, email, street, city, zipCode } = attendance.user.contactInfo;

			const result = {
				firstName,
				lastName,
				birthday,
				mobile,
				telephone,
				email,
				street,
				city,
				zipCode,
			}

			return result;
		} catch (error) {
			throw error;
		}
	}

	async getAttendanceWages(attendanceIdDto: AttendanceIdDto) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
				relations: ["wages"],
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			const wages = await this.wageRepository.find({
				where: { userId: attendance.userId }
			})

			return wages;
		} catch (error) {
			throw error;
		}
	}

	async getAttendanceBreaks(attendanceIdDto: AttendanceIdDto) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
				relations: ["breaks"],
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			const breaks = attendance.breaks.map((item) => ({
				...item,
				total_minutes: differenceInMinutes(new Date(item.end), new Date(item.start))
			}))

			return breaks;
		} catch (error) {
			throw error;
		}
	}

	async uploadAttendancePhoto(file: any, uploadDir: string): Promise<string> {
		try {
			const fileExtension = mime.extension(file.mimetype) as string;
			if (!fileExtension || !["jpg", "jpeg", "png"].includes(fileExtension)) {
				throw new UnsupportedMediaTypeException(
					generalRepsonseMessage.INVALID_IMAGE_FORMAT.EN,
					errorResponseMessage.BAD_REQUEST.EN
				);
			}

			const fileName = `${Date.now()}.${fileExtension}`;

			// Ensure uploadDir exists
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			const filePath = path.join(uploadDir, fileName);
			const fileBuffer = await file.buffer;
			fs.writeFileSync(filePath, fileBuffer);

			return fileName;
		} catch (error) {
			throw error;
		}
	}

	private async removeAttendancePhoto(fileName: string): Promise<void> {
		try {
			const filePath = path.resolve(process.cwd(), "uploads", fileName);
			return new Promise((resolve, reject) => {
				fs.unlink(filePath, err => {
					if (err) {
						return reject(err);
					}
					resolve();
				});
			});
		} catch (error) {
			throw error;
		}
	}

	async addAttendance(createAttendanceDto: CreateAttendanceDto, clockInImageUrl: File, clockOutImageUrl: File) {
		try {
			if (!clockInImageUrl) {
				throw new BadRequestException(
					attendanceResponseMessage.REQUIRED_CLOCK_IN_IMAGE_FILE,
					errorResponseMessage.BAD_REQUEST.EN
				);
			}
			const uploadDir = path.resolve(process.cwd(), "uploads")
			const clockInUrl = await this.uploadAttendancePhoto(clockInImageUrl, uploadDir)

			const { clockIn, userId, storeId } = createAttendanceDto;

			const attendanceJson = {
				clockIn,
				clockInImageUrl: clockInUrl,
				userId: userId,
				storeId: storeId,
			}

			if (clockOutImageUrl) {
				attendanceJson["clockOutImageUrl"] = await this.uploadAttendancePhoto(clockOutImageUrl, uploadDir)
			}

			if (createAttendanceDto.clockOut) {
				attendanceJson["clockOut"] = createAttendanceDto.clockOut;
			}

			const attendance = this.attendanceRepository.create(attendanceJson)

			await this.attendanceRepository.save(attendance)

			return attendance;
		} catch (error) {
			throw error;
		}
	}

	async editAttendance(attendanceIdDto: AttendanceIdDto, updateAttendanceDto: UpdateAttendanceDto, clockInImageUrl: File, clockOutImageUrl: File) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			const { clockIn, clockOut, userId, storeId } = updateAttendanceDto

			let attendanceData = {
				clockIn: clockIn ? clockIn : attendance.clockIn,
				clockOut: clockOut ? clockOut : attendance.clockOut,
				userId: userId ? userId : attendance.userId,
				storeId: storeId ? storeId : attendance.storeId,
			}

			const uploadDir = path.resolve(process.cwd(), "uploads")
			if (clockInImageUrl) {
				if (attendance.clockInImageUrl) {
					this.removeAttendancePhoto(attendance.clockInImageUrl);
				}
				attendanceData['clockInImageUrl'] = await this.uploadAttendancePhoto(clockInImageUrl, uploadDir);
			}
			if (clockOutImageUrl) {
				if (attendance.clockOutImageUrl) {
					this.removeAttendancePhoto(attendance.clockOutImageUrl);
				}
				attendanceData['clockOutImageUrl'] = await this.uploadAttendancePhoto(clockOutImageUrl, uploadDir);
			}

			Object.assign(attendance, attendanceData);
			await this.attendanceRepository.save(attendance);

			return attendance;

		} catch (error) {
			throw error;
		}
	}

	async deleteAttendance(attendanceIdDto: AttendanceIdDto) {
		try {
			const attendance = await this.attendanceRepository.findOne({
				where: { id: attendanceIdDto.attendanceId },
			});

			if (!attendance) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			if (attendance.clockInImageUrl) {
				this.removeAttendancePhoto(attendance.clockInImageUrl);
			}

			if (attendance.clockOutImageUrl) {
				this.removeAttendancePhoto(attendance.clockOutImageUrl);
			}

			await this.attendanceRepository.remove(attendance);
			return attendance;
		} catch (error) {
			throw error;
		}
	}

	async deleteMultipleAttendances(ids: number[]): Promise<Object> {
		try {
			const attendances = await this.attendanceRepository.findBy({
				id: In(ids),
			});

			if (attendances.length === 0) {
				throw new NotFoundException(
					attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			attendances.map(item => {
				if (item.clockInImageUrl) {
					this.removeAttendancePhoto(item.clockInImageUrl);
				}

				if (item.clockOutImageUrl) {
					this.removeAttendancePhoto(item.clockOutImageUrl);
				}
			});

			await this.attendanceRepository.remove(attendances);

			return attendances;
		} catch (error) {
			throw error;
		}
	}
}
