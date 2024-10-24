import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { consumers, errorResponseMessage, storeResponseMessage, swaggerConstant } from 'src/common/constants';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';
import { StoresService } from '../services/stores.service';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags('Stores')
@Controller('stores')
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
export class StoresController {
  constructor(
    private readonly storesService: StoresService) {
  }

  @Get()
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.GET_STORES)
  @ApiOperation({ summary: 'Get all stores' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter stores' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit of items per page', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.GET_STORES.EN, type: SuccessResponseDto })
  async findAll(@Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number): Promise<any> {
    try {
      return await this.storesService.findAll(search, page, limit);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.GET_STORE_DETAILS)
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({ name: 'id', description: 'ID of the store', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.GET_STORE_DETAILS.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.STORE_NOT_FOUND.EN, type: ErrorResponseDto })
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      return await this.storesService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ResponseSerializer(HttpStatus.CREATED, storeResponseMessage.CREATE_STORE)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Create a new store' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: storeResponseMessage.CREATE_STORE.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: storeResponseMessage.CONFLICT_STORE.EN, type: ErrorResponseDto })
  async create(@Body() createStoreDto: CreateStoreDto): Promise<any> {
    try {
      return await this.storesService.create(createStoreDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.UPDATE_STORE)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Update a store by ID' })
  @ApiParam({ name: 'id', description: 'ID of the store', type: 'string' })
  @ApiBody({ type: UpdateStoreDto })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.UPDATE_STORE.EN, type: SuccessResponseDto })
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto): Promise<any> {
    try {
      return await this.storesService.update(+id, updateStoreDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.DELETE_STORE)
  @ApiOperation({ summary: 'Delete a store by ID' })
  @ApiParam({ name: 'id', description: 'ID of the store', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.DELETE_STORE.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.STORE_NOT_FOUND.EN, type: ErrorResponseDto })
  async remove(@Param('id') id: string): Promise<any> {
    try {
      return await this.storesService.remove(+id);
    } catch (error) {
      throw error;
    }
  }

  @Delete()
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.DELETE_STORES)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Bulk delete stores' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.DELETE_STORES.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.STORES_NOT_FOUND.EN, type: ErrorResponseDto })
  async removeBulk(@Body('ids') ids: number[]): Promise<void> {
    try {
      return await this.storesService.removeBulk(ids);
    } catch (error) {
      throw error;
    }
  }
}
