import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { consumers, errorResponseMessage, storeResponseMessage, swaggerConstant } from 'src/common/constants';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { CreateOpeningHoursDto } from '../dtos/create-opening-hours.dto';
import { UpdateOpeningHoursDto } from '../dtos/update-opening-hours.dto';
import { OpeningHoursService } from '../services/opening-hours.service';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags('Opening Hours')
@Controller('opening-hours')
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
export class OpeningHoursController {
  constructor(
    private readonly openingHoursService: OpeningHoursService
  ) {
  }

  @Get()
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.GET_OPENING_HOURS)
  @ApiOperation({ summary: 'Get all opening hours' })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.GET_OPENING_HOURS.EN, type: SuccessResponseDto })
  async findAll() {
    try {
      return await this.openingHoursService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.GET_OPENING_HOUR)
  @ApiOperation({ summary: 'Get opening hours by ID' })
  @ApiParam({ name: 'id', description: 'ID of the opening hours', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.EDIT_OPENING_HOUR.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.OPENING_HOUR_NOT_FOUND.EN, type: ErrorResponseDto })
  async findOne(@Param('id') id: string) {
    try {
      return await this.openingHoursService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ResponseSerializer(HttpStatus.CREATED, storeResponseMessage.ADD_OPENING_HOUR)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Create new opening hours' })
  @ApiBody({ type: CreateOpeningHoursDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: storeResponseMessage.ADD_OPENING_HOUR.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.STORE_NOT_FOUND.EN, type: ErrorResponseDto })
  async create(@Body() createOpeningHoursDto: CreateOpeningHoursDto) {
    try {
      return await this.openingHoursService.create(createOpeningHoursDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.EDIT_OPENING_HOUR)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Update opening hours by ID' })
  @ApiParam({ name: 'id', description: 'ID of the opening hours', type: 'string' })
  @ApiBody({ type: UpdateOpeningHoursDto })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.EDIT_OPENING_HOUR.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store or opening hour not found ", type: ErrorResponseDto })
  async update(@Param('id') id: string, @Body() updateOpeningHoursDto: UpdateOpeningHoursDto) {
    try {
      return await this.openingHoursService.update(+id, updateOpeningHoursDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.DELETE_OPENING_HOUR)
  @ApiOperation({ summary: 'Delete opening hours by ID' })
  @ApiParam({ name: 'id', description: 'ID of the opening hours', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, description: storeResponseMessage.DELETE_OPENING_HOUR.EN, type: SuccessResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.OPENING_HOUR_NOT_FOUND.EN, type: ErrorResponseDto })
  async remove(@Param('id') id: string) {
    try {
      return await this.openingHoursService.remove(+id);
    } catch (error) {
      throw error;
    }
  }

  @Delete()
  @ResponseSerializer(HttpStatus.OK, storeResponseMessage.DELETE_OPENING_HOURS)
  @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
  @ApiOperation({ summary: 'Bulk delete opening hours' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: storeResponseMessage.OPENING_HOURS_NOT_FOUND.EN, type: ErrorResponseDto })
  async removeBulk(@Body('ids') ids: number[]) {
    try {
      return await this.openingHoursService.removeBulk(ids);
    } catch (error) {
      throw error;
    }
  }
}
