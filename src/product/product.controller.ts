import { File, FileInterceptor } from '@nest-lab/fastify-multer';
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
	UploadedFile,
	UseGuards,
	UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { errorResponseMessage, generalRepsonseMessage, productResponseMessage } from 'src/common/constants';
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { CreateProductDto } from "./dtos/create-product.dto";
import { EditProductDto } from "./dtos/edit-product.dto";
import { ProductIdDto } from "./dtos/params-product.dto";
import { ProductService } from "./product.service";

@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@UseGuards(AuthGuard)
@Controller(urlsConstant.ROUTE_PREFIX_PRODUCT)
@ApiTags("Products")
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
export class ProductController {
	constructor(
		private productService: ProductService,
	) {
	}

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, productResponseMessage.ADD_PRODUCT)
	@UseInterceptors(FileInterceptor("file"))
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON, consumers.MULTIPART_FORM_DATA)
	@ApiOperation({ summary: 'Create a product' })
	@ApiResponse({ status: HttpStatus.CREATED, description: productResponseMessage.ADD_PRODUCT.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store or category not found", type: ErrorResponseDto })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: generalRepsonseMessage.FILE_UPLOAD_FAILED.EN, type: ErrorResponseDto })
	async addProduct(
		@Body() createProductDto: CreateProductDto,
		@UploadedFile() file: File,
	) {
		try {
			return await this.productService.addProduct(file, createProductDto);
		} catch (error) {
			throw error;
		}
	}

	//TODO: Add edit image
	@Put(urlsConstant.API_UPDATE_PRODUCT)
	@ResponseSerializer(HttpStatus.OK, productResponseMessage.UPDATE_PRODUCT)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Edit an existing product' })
	@ApiResponse({ status: HttpStatus.OK, description: productResponseMessage.UPDATE_PRODUCT.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store, category or product not found", type: ErrorResponseDto })
	async editProduct(
		@Param() productIdDto: ProductIdDto,
		@Body() editProductDto: EditProductDto,
	) {
		try {
			return await this.productService.editProduct(productIdDto, editProductDto);
		} catch (error) {
			throw error;
		}
	}

	@Delete(urlsConstant.API_DELETE_PRODUCT)
	@ResponseSerializer(HttpStatus.OK, productResponseMessage.DELETE_PRODUCT)
	@ApiOperation({ summary: 'Delete an existing product' })
	@ApiResponse({ status: HttpStatus.OK, description: productResponseMessage.DELETE_PRODUCT.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: productResponseMessage.PRODUCT_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteProduct(
		@Param() productIdDto: ProductIdDto,
	) {
		try {
			return await this.productService.deleteProduct(productIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, productResponseMessage.GET_PRODUCT_LIST)
	@ApiOperation({ summary: 'Get a list of products' })
	@ApiResponse({ status: HttpStatus.OK, description: productResponseMessage.GET_PRODUCT_LIST.EN, type: SuccessResponseDto })
	async getProductList(
		@Query() paginationDto: PaginationDto,
	) {
		try {
			return await this.productService.getProductList(paginationDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_PRODUCT)
	@ResponseSerializer(HttpStatus.OK, productResponseMessage.GET_PRODUCT_DETAILS)
	@ApiOperation({ summary: 'Get a product' })
	@ApiResponse({ status: HttpStatus.OK, description: productResponseMessage.GET_PRODUCT_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: productResponseMessage.PRODUCT_NOT_FOUND.EN, type: ErrorResponseDto })
	async getProductDetails(
		@Param() productIdDto: ProductIdDto,
	) {
		try {
			return await this.productService.getProductDetails(productIdDto);
		} catch (error) {
			throw error;
		}
	}
}
