import { AnyFilesInterceptor, File } from '@nest-lab/fastify-multer';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseArrayPipe,
	Post,
	Put,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { DailySummaryResultDto } from 'src/analytics/accounting/dtos/daily-summary-result.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { attendanceResponseMessage, errorResponseMessage, filterRepsonseMessage } from 'src/common/constants';
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dtos/create-attendance.dto";
import { FilterAttendanceDto } from "./dtos/filter-attendance.dto";
import { AttendanceIdDto } from "./dtos/params-attendance.dto";
import { UpdateAttendanceDto } from "./dtos/update-attendance.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags("Attendances")
@Controller(urlsConstant.ROUTE_PREFIX_ATTENDANCE)
@ApiResponse({
	status: HttpStatus.INTERNAL_SERVER_ERROR,
	description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.UNPROCESSABLE_ENTITY,
	description: errorResponseMessage.UNPROCESSABLE_ENTITY.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.UNAUTHORIZED,
	description: errorResponseMessage.UNAUTHORIZED.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.BAD_REQUEST,
	description: errorResponseMessage.BAD_REQUEST.EN,
	type: ErrorResponseDto
})
export class AttendanceController {
	constructor(
		private readonly attendanceService: AttendanceService) {
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.GET_ATTENDANCE_LIST)
	@ApiOperation({ summary: 'Get attendance list' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.GET_ATTENDANCE_LIST.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: filterRepsonseMessage.PERIOD_NOT_FOUND.EN, type: ErrorResponseDto })
	async getAttendanceList(
		@Query() filters: FilterAttendanceDto,
	) {
		try {
			return await this.attendanceService.getAttendanceList(filters);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ATTENDANCE)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.GET_ATTENDANCE_DETAILS)
	@ApiOperation({ summary: 'Get attendance details' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.GET_ATTENDANCE_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async getAttendanceDetails(
		@Param() attendanceIdDto: AttendanceIdDto,
	) {
		try {
			return await this.attendanceService.getAttendanceDetails(attendanceIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ATTENDANCE_USER)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.GET_ATTENDANCE_USERS)
	@ApiOperation({ summary: 'Get attendance by user' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.GET_ATTENDANCE_USERS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async getAttendanceUser(
		@Param() attendanceIdDto: AttendanceIdDto,
	) {
		try {
			return await this.attendanceService.getAttendanceUser(attendanceIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ATTENDANCE_BREAK)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.GET_ATTENDANCE_BREAKS)
	@ApiOperation({ summary: 'Get breaks' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.GET_ATTENDANCE_BREAKS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Attendance or break not found.', type: ErrorResponseDto })
	async getAttendanceBreaks(
		@Param() attendanceIdDto: AttendanceIdDto,
	) {
		try {
			return await this.attendanceService.getAttendanceBreaks(attendanceIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ATTENDANCE_WAGE)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.GET_ATTENDANCE_WAGES)
	@ApiOperation({ summary: 'Get wages' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.GET_ATTENDANCE_WAGES.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async getAttendanceWages(
		@Param() attendanceIdDto: AttendanceIdDto,
	) {
		try {
			return await this.attendanceService.getAttendanceWages(attendanceIdDto);
		} catch (error) {
			throw error;
		}
	}


	@Post()
	@ResponseSerializer(HttpStatus.CREATED, attendanceResponseMessage.ADD_ATTENDANCE, DailySummaryResultDto)
	@ApiBody({ type: CreateAttendanceDto })
	@UseInterceptors(AnyFilesInterceptor())
	@ApiConsumes(consumers.JSON, consumers.FORM_URL_ENCODED, consumers.MULTIPART_FORM_DATA)
	@ApiOperation({ summary: 'Add attendance' })
	@ApiResponse({ status: HttpStatus.CREATED, description: attendanceResponseMessage.ADD_ATTENDANCE.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: attendanceResponseMessage.REQUIRED_CLOCK_IN_IMAGE_FILE.EN, type: ErrorResponseDto })
	async addAttendance(
		@UploadedFiles() files: Array<File>,
		@Body() createAttendanceDto: CreateAttendanceDto,
	) {
		try {
			const clockInImageUrl = files.find(file => file.fieldname === 'clockInImageUrl');
			const clockOutImageUrl = files.find(file => file.fieldname === 'clockOutImageUrl');
			return await this.attendanceService.addAttendance(createAttendanceDto, clockInImageUrl, clockOutImageUrl);
		} catch (error) {
			throw error;
		}
	}

	@Put(urlsConstant.API_UPDATE_ATTENDANCE)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.UPDATE_ATTENDANCE)
	@ApiConsumes(consumers.JSON, consumers.FORM_URL_ENCODED, consumers.MULTIPART_FORM_DATA)
	@ApiBody({ type: UpdateAttendanceDto })
	@UseInterceptors(AnyFilesInterceptor())
	@ApiOperation({ summary: 'Update attendance' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.UPDATE_ATTENDANCE.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async updateAttendance(
		@Param() AttendanceIdDto: AttendanceIdDto,
		@UploadedFiles() files: Array<File>,
		@Body() updateAttendanceDto: UpdateAttendanceDto,
	) {
		try {
			const clockInImageUrl = files.find(file => file.fieldname === 'clockInImageUrl');
			const clockOutImageUrl = files.find(file => file.fieldname === 'clockOutImageUrl');
			return await this.attendanceService.editAttendance(AttendanceIdDto, updateAttendanceDto, clockInImageUrl, clockOutImageUrl);
		} catch (error) {
			throw error;
		}
	}

	@Delete(urlsConstant.API_DELETE_ATTENDANCE)
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.DELETE_ATTENDANCE)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Delete attendance by Id' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.DELETE_ATTENDANCE.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteAttendance(
		@Param() attendanceIdDto: AttendanceIdDto,
	) {
		try {
			return await this.attendanceService.deleteAttendance(attendanceIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Delete()
	@ResponseSerializer(HttpStatus.OK, attendanceResponseMessage.DELETE_ATTENDANCE)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Delete multiple attendance entries by Ids' })
	@ApiResponse({ status: HttpStatus.OK, description: attendanceResponseMessage.DELETE_ATTENDANCE.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteMultipleAttendances(
		@Query("ids", new ParseArrayPipe({ items: Number, separator: "," })) ids: number[],
	) {
		try {
			return await this.attendanceService.deleteMultipleAttendances(ids);
		} catch (error) {
			throw error;
		}
	}
}
