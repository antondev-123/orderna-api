import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorResponseMessage, inventoryResponseMessage, urlsConstant } from 'src/common/constants';
import { consumers, swaggerConstant } from 'src/common/constants/swagger.constant';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import {
    BulkDeleteInventoryItemsResultDto,
    CreateInventoryItemDto,
    CreateInventoryItemResultDto,
    DeleteInventoryItemResultDto,
    EditInventoryItemDto,
    EditInventoryItemResultDto,
    FilterInventoriesResultDto,
    FilterInventoryDto
} from './inventories.dto';
import { InventoryItem } from './inventories.entity';
import { InventoriesService } from './inventories.service';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags('Inventories')
@Controller(urlsConstant.ROUTE_PREFIX_INVENTORY)
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
export class InventoriesController {
    constructor(
        private inventoriesService: InventoriesService,
    ) {
    }


    @Get()
    @ResponseSerializer(HttpStatus.OK, inventoryResponseMessage.GET_INVENTORYS, FilterInventoriesResultDto)
    @ApiResponse({ type: FilterInventoriesResultDto })
    @ApiOperation({ summary: 'Get Inventories with filter of page, pageSize, sortBy, sortType, and filters' })
    @ApiResponse({ status: HttpStatus.OK, description: inventoryResponseMessage.GET_INVENTORYS.EN, type: SuccessResponseDto })
    getInventories(@Query() dto: FilterInventoryDto): Promise<InventoryItem[]> {
        try {
            return this.inventoriesService.getInventories(dto);
        } catch (error) {
            throw error;
        }
    }


    @Post()
    @ResponseSerializer(HttpStatus.CREATED, inventoryResponseMessage.CREATE_INVENTORY, CreateInventoryItemResultDto)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiResponse({ type: CreateInventoryItemResultDto })
    @ApiOperation({ summary: 'Create Inventory Item' })
    @ApiResponse({ status: HttpStatus.CREATED, description: inventoryResponseMessage.CREATE_INVENTORY.EN, type: SuccessResponseDto })
    createInventory(@Body() dto: CreateInventoryItemDto): Promise<InventoryItem> {
        try {
            return this.inventoriesService.createInventoryItem(dto);
        } catch (error) {
            throw error;
        }
    }

    @Patch(urlsConstant.API_UPDATE_INVENTORY)
    @ResponseSerializer(HttpStatus.OK, inventoryResponseMessage.UPDATE_INVENTORY, EditInventoryItemResultDto)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiResponse({ type: EditInventoryItemResultDto })
    @ApiOperation({ summary: 'Edit Inventory Item with invenotory Id and inventory detail in body' })
    @ApiParam({ name: 'inventoryId', description: 'ID of the inventory to be edited', type: 'number' })
    @ApiResponse({ status: HttpStatus.OK, description: inventoryResponseMessage.UPDATE_INVENTORY.EN, type: SuccessResponseDto })
    editInventory(
        @Param("inventoryId", ParseIntPipe) inventoryId: number,
        @Body() dto: EditInventoryItemDto
    ): Promise<InventoryItem> {
        try {
            return this.inventoriesService.editInventoryItem(inventoryId, dto);
        } catch (error) {
            throw error;
        }
    }

    @Delete(urlsConstant.API_DELETE_INVENTORY)
    @ResponseSerializer(HttpStatus.OK, inventoryResponseMessage.DELETE_INVENTORY, DeleteInventoryItemResultDto)
    @ApiResponse({ type: DeleteInventoryItemResultDto })
    @ApiOperation({ summary: 'Single delete InventoryItem by inventoryId' })
    @ApiParam({ name: 'inventoryId', description: 'ID of the inventory to be deleted', type: 'number' })
    @ApiResponse({ status: HttpStatus.OK, description: inventoryResponseMessage.DELETE_INVENTORY.EN, type: SuccessResponseDto })
    deleteInventory(@Param("inventoryId", ParseIntPipe) inventoryId: number): Promise<void> {
        try {
            return this.inventoriesService.deleteInventoryItem(inventoryId);
        } catch (error) {
            throw error;
        }
    }

    @Post(urlsConstant.API_DELETE_INVENTORIES)
    @ResponseSerializer(HttpStatus.OK, inventoryResponseMessage.DELETE_INVENTORYS, BulkDeleteInventoryItemsResultDto)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiResponse({ type: BulkDeleteInventoryItemsResultDto })
    @ApiOperation({ summary: 'Bulk Delete InventoryItems with a list of inventoryId' })
    @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
    @ApiResponse({ status: HttpStatus.OK, description: inventoryResponseMessage.DELETE_INVENTORYS.EN, type: SuccessResponseDto })
    bulkDeleteInventories(
        @Body("ids") inventoryIds: number[]
    ): Promise<void> {
        try {
            return this.inventoriesService.bulkDeleteInventoryItems(inventoryIds);
        } catch (error) {
            throw error;
        }
    }
}
