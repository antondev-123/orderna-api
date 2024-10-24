import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { customerResponseMessage, errorResponseMessage, storeResponseMessage } from "src/common/constants";
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CustomersService } from "./customer.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { DeleteCustomerDto } from "./dtos/delete-customer.dto";
import { EditCustomerDto } from "./dtos/edit-customer.dto";
import { FilterCustomerDto } from "./dtos/filter-customer.dto";
import { CustomerIdDto } from "./dtos/params-customer.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_CUSTOMER)
@ApiTags("Customers")
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
export class CustomersController {
	constructor(
		private customersService: CustomersService,
	) {
	}

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, customerResponseMessage.ADD_CUSTOMER)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Create a new customer' })
	@ApiResponse({ status: HttpStatus.CREATED, description: customerResponseMessage.ADD_CUSTOMER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.STORE_NOT_FOUND.EN, type: ErrorResponseDto })
	async addCustomer(
		@Body() createCustomerDto: CreateCustomerDto,
	) {
		try {
			return await this.customersService.addCustomer(createCustomerDto);
		} catch (error) {
			throw error;
		}
	}

	// TODO: Use patch
	@Put(urlsConstant.API_UPDATE_CUSTOMER)
	@ResponseSerializer(HttpStatus.OK, customerResponseMessage.UPDATE_CUSTOMER)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Update an existing customer' })
	@ApiResponse({ status: HttpStatus.CREATED, description: customerResponseMessage.UPDATE_CUSTOMER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store or customer not found", type: ErrorResponseDto })
	async updateCustomer(
		@Param() customerIdDto: CustomerIdDto,
		@Body() editCustomerDto: EditCustomerDto,
	) {
		try {
			return await this.customersService.editCustomer(customerIdDto, editCustomerDto);
		} catch (error) {
			throw error;
		}
	}

	@Delete(`${urlsConstant.API_DELETE_CUSTOMER}`)
	@ResponseSerializer(HttpStatus.OK, customerResponseMessage.DELETE_CUSTOMER)
	@ApiOperation({ summary: 'Delete customer by ID' })
	@ApiParam({ name: 'customerId', description: 'ID of the customer to delete', type: 'number' })
	@ApiResponse({ status: HttpStatus.OK, description: customerResponseMessage.DELETE_CUSTOMER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: customerResponseMessage.CUSTOMER_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteCustomer(@Param('customerId', ParseIntPipe) id: number) {
		try {
			return await this.customersService.deleteCustomer(id);
		} catch (error) {
			throw error;
		}
	}

	@Post(urlsConstant.API_DELETE_CUSTOMERS)
	@ResponseSerializer(HttpStatus.OK, customerResponseMessage.DELETE_CUSTOMERS)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Delete multiple customers by IDs' })
	@ApiResponse({ status: HttpStatus.OK, description: customerResponseMessage.DELETE_CUSTOMERS.EN, type: SuccessResponseDto })
	async deleteCustomers(
		@Body() deleteCustomerDto: DeleteCustomerDto,
	) {
		try {
			return await this.customersService.deleteCustomers(deleteCustomerDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_CUSTOMER)
	@ResponseSerializer(HttpStatus.OK, customerResponseMessage.GET_CUSTOMER_DETAILS)
	@ApiOperation({ summary: 'Get customer details' })
	@ApiResponse({ status: HttpStatus.CREATED, description: customerResponseMessage.GET_CUSTOMER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: customerResponseMessage.CUSTOMER_NOT_FOUND.EN, type: ErrorResponseDto })
	async getCustomerDetails(
		@Param() customerIdDto: CustomerIdDto,
	) {
		try {
			return await this.customersService.getCustomerDetails(customerIdDto);
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, customerResponseMessage.GET_CUSTOMER_LIST)
	@ApiOperation({ summary: 'Get customer list' })
	@ApiResponse({ status: HttpStatus.CREATED, description: customerResponseMessage.GET_CUSTOMER_LIST.EN, type: SuccessResponseDto })
	async getCustomersList(
		@Query() filterDto: FilterCustomerDto
	) {
		try {
			return await this.customersService.getCustomerList(filterDto);
		} catch (error) {
			throw error;
		}
	}
}
