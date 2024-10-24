import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { categoryResponseMessage, errorResponseMessage } from "src/common/constants";
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { EditCategoryDto } from "./dtos/edit-category.dto";
import { CategoryIdDto } from "./dtos/params-category.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_CATEGORY)
@ApiTags("Categories")
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
export class CategoryController {
	constructor(
		private categoryService: CategoryService,
	) {
	}

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, categoryResponseMessage.ADD_CATEGORY)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Create a new category' })
	@ApiResponse({ status: HttpStatus.CREATED, description: categoryResponseMessage.ADD_CATEGORY.EN, type: SuccessResponseDto })
	async addCategory(
		@Body() createCategoryDto: CreateCategoryDto,
	) {
		try {
			return await this.categoryService.addCategory(createCategoryDto);
		} catch (error) {
			throw error;
		}
	}

	@Put(urlsConstant.API_UPDATE_CATEGORY)
	@ResponseSerializer(HttpStatus.OK, categoryResponseMessage.UPDATE_CATEGORY)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Edit a category' })
	@ApiResponse({ status: HttpStatus.OK, description: categoryResponseMessage.UPDATE_CATEGORY.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: categoryResponseMessage.CATEGORY_NOT_FOUND.EN, type: ErrorResponseDto })
	async editCategory(
		@Param() categoryIdDto: CategoryIdDto,
		@Body() editCategoryDto: EditCategoryDto,
	) {
		try {
			return await this.categoryService.editCategory(categoryIdDto, editCategoryDto);
		} catch (error) {
			throw error;
		}
	}

	@Delete(urlsConstant.API_DELETE_CATEGORY)
	@ResponseSerializer(HttpStatus.OK, categoryResponseMessage.DELETE_CATEGORY)
	@ApiOperation({ summary: 'Delete a category' })
	@ApiResponse({ status: HttpStatus.OK, description: categoryResponseMessage.DELETE_CATEGORY.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: categoryResponseMessage.CATEGORY_NOT_FOUND.EN, type: SuccessResponseDto })
	async deleteCategory(
		@Param() categoryIdDto: CategoryIdDto,
	) {
		try {
			return await this.categoryService.deleteCategory(categoryIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, categoryResponseMessage.GET_CATEGORY_LIST)
	@ApiOperation({ summary: 'Get a list categories' })
	@ApiResponse({ status: HttpStatus.OK, description: categoryResponseMessage.DELETE_CATEGORIES.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: categoryResponseMessage.DELETE_CATEGORY.EN, type: SuccessResponseDto })
	async getCategoryList(
		@Query() paginationDto: PaginationDto,
	) {
		try {
			return await this.categoryService.getCategoryList(paginationDto);
		} catch (error) {
			throw error;
		}
	}
}
