import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorResponseMessage, supplierResponseMessage } from 'src/common/constants';
import { consumers, swaggerConstant } from 'src/common/constants/swagger.constant';
import { urlsConstant } from 'src/common/constants/url.constant';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { FilterSupplierDto } from './dtos/filter-supplier.dto';
import { UpdateSupplierDto } from './dtos/update-supplier.dto';
import { SupplierEntity } from './supplier.entity';
import { SuppliersService } from './supplier.service';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags('Suppliers')
@Controller(urlsConstant.ROUTE_PREFIX_SUPPLIER)
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
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
  ) {
  }

  @Post()
  @ResponseSerializer(HttpStatus.CREATED, supplierResponseMessage.CREATE_SUPPLIER)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: HttpStatus.CREATED, description: supplierResponseMessage.CREATE_SUPPLIER.EN, type: SuccessResponseDto })
  async create(@Body() createSupplierDto: CreateSupplierDto): Promise<SupplierEntity> {
    try {
      return await this.suppliersService.create(createSupplierDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch(urlsConstant.API_UPDATE_SUPPLIER)
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.UPDATE_SUPPLIER)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Update an existing supplier' })
  @ApiParam({ name: 'supplierId', description: 'ID of the supplier to update', type: 'number' })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.UPDATE_SUPPLIER.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: supplierResponseMessage.SUPPLIERS_NOT_FOUND.EN, type: ErrorResponseDto })
  async update(@Param('supplierId') id: number, @Body() updateSupplierDto: UpdateSupplierDto): Promise<SupplierEntity> {
    try {
      // signupUserDto = trimObjectValues(signupUserDto);
      return await this.suppliersService.update(id, updateSupplierDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.GET_SUPPLIERS)
  @ApiOperation({ summary: 'Get a list of suppliers' })
  @ApiQuery({ name: 'page', description: 'the page number to retrieve. Optional. Default is 1.', required: false })
  @ApiQuery({ name: 'limit', description: 'the maximum number of suppliers to retrieve per page. Optional. Default is 10', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.GET_SUPPLIERS.EN, type: SuccessResponseDto })
  async findAll(
    @Query() filter: FilterSupplierDto
  ): Promise<any> {
    try {
      return await this.suppliersService.findAll(filter);
    } catch (error) {
      throw error;
    }
  }

  @Get(`${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.GET_SUPPLIERS_SUMMARY)
  @ApiOperation({ summary: 'Get a list of suppliers with details info included' })
  @ApiQuery({ name: 'page', description: 'the page number to retrieve. Optional. Default is 1.', required: false })
  @ApiQuery({ name: 'limit', description: 'the maximum number of suppliers to retrieve per page. Optional. Default is 10', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.GET_SUPPLIERS_SUMMARY.EN, type: SuccessResponseDto })
  async findAllSummary(
    @Query() filter: FilterSupplierDto
  ): Promise<any> {
    try {
      return await this.suppliersService.findAllSummary(filter);
    } catch (error) {
      throw error;
    }
  }

  @Delete(`${urlsConstant.API_DELETE_SUPPLIER}`)
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.DELETE_SUPPLIER)
  @ApiOperation({ summary: 'Delete supplier by ID' })
  @ApiParam({ name: 'supplierId', description: 'ID of the supplier to delete', type: 'number' })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.DELETE_SUPPLIER.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: supplierResponseMessage.SUPPLIERS_NOT_FOUND.EN, type: ErrorResponseDto })
  async remove(@Param('supplierId', ParseIntPipe) id: number): Promise<SupplierEntity> {
    try {
      return await this.suppliersService.remove(id);
    } catch (error) {
      throw error;
    }
  }

  @Post(urlsConstant.API_DELETE_SUPPLIERS)
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.DELETED_SUPPLIERS)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Delete multiple suppliers by IDs' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.DELETED_SUPPLIERS.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: supplierResponseMessage.SUPPLIERS_NOT_FOUND.EN, type: ErrorResponseDto })
  async bulkRemove(@Body('ids') ids: number[]): Promise<SupplierEntity[]> {
    try {
      return await this.suppliersService.bulkRemove(ids);
    } catch (error) {
      throw error;
    }
  }

  @Get(urlsConstant.API_GET_SUPPLIER)
  @ResponseSerializer(HttpStatus.OK, supplierResponseMessage.GET_SUPPLIER_DETAILS)
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiParam({ name: 'supplierId', description: 'ID of the supplier to retrieve', type: 'number' })
  @ApiResponse({ status: HttpStatus.OK, description: supplierResponseMessage.GET_SUPPLIER_DETAILS.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: supplierResponseMessage.SUPPLIER_NOT_FOUND.EN })
  async findOne(@Param('supplierId') id: number): Promise<SupplierEntity> {
    try {
      return await this.suppliersService.findOne(id);
    } catch (error) {
      throw error;
    }
  }
}
