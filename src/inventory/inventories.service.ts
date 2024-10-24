import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { errorResponseMessage, inventoryResponseMessage } from 'src/common/constants';
import { InventoriesData } from './data/inventories.data';
import {
    CreateInventoryItemDto,
    EditInventoryItemDto,
    FilterInventoryDto,
    SortByEnum,
    SortTypeEnum
} from './inventories.dto';
import { InventoryItem } from './inventories.entity';

@Injectable()
export class InventoriesService {
    constructor(
        private inventoriesData: InventoriesData
    ) { }

    async getInventories(dto: FilterInventoryDto): Promise<InventoryItem[]> {
        try {

            let pageNum = dto.page ?? 0;
            let pageSize = dto.pageSize ?? 0;
            let sortType: SortTypeEnum = SortTypeEnum.asc;

            if (dto?.sortType && Object.values(SortTypeEnum).includes(dto.sortType as SortTypeEnum)) {
                sortType = dto.sortType as SortTypeEnum;
            }

            const sortColumn = SortByEnum[dto?.sortBy as keyof typeof SortByEnum] || SortByEnum.id;

            let orderObject = {
                [sortColumn]: sortType
            }

            let result: InventoryItem[] = null;

            if (!dto?.filterType) {

                result = await this.inventoriesData.getAllInventories({ pageNum, pageSize, orderObject });

            } else {

                if (dto.filterType === 'period' && dto?.limitDate > 0) {

                    let limitDate = new Date();
                    limitDate.setDate(limitDate.getDate() - dto.limitDate);
                    result = await this.inventoriesData.getInventoriesFilterByDate({
                        pageNum,
                        pageSize,
                        orderObject,
                        createdAtFilterTime: limitDate.toISOString()
                    });
                } else if (dto.filterType === 'storeID' && dto.filterText) {
                    result = await this.inventoriesData.getInventoriesFilterByStore({
                        pageNum,
                        pageSize,
                        orderObject,
                        storeID: parseInt(dto.filterText)
                    });
                } else {
                    throw new BadRequestException(
                        inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_FILTER_RESULT.EN,
                        errorResponseMessage.BAD_REQUEST.EN);
                }

            }

            if (result) {
                return result;
            } else {
                throw new BadRequestException(
                    inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_FILTER_RESULT.EN,
                    errorResponseMessage.BAD_REQUEST.EN);
            }

        } catch (error) {

            Logger.error(`inventories Service - getAllInventories func GotError: ${error}`);

            throw error;
        }
    }

    async createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
        try {

            if (dto?.unit && dto?.title && dto?.sk_plu && dto?.storeID) {
                let result = await this.inventoriesData.createInventoryItem(dto);

                if (result) {

                    return result;

                } else {

                    throw new BadRequestException(
                        inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_RESULT_CREATE.EN,
                        errorResponseMessage.BAD_REQUEST.EN);

                }
            } else {
                throw new BadRequestException(
                    inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_RESULT.EN,
                    errorResponseMessage.BAD_REQUEST.EN);
            }

        } catch (error) {

            Logger.error(`inventories Service - createInventoryItem func GotError: ${error}`);

            throw error;
        }
    }

    async editInventoryItem(inventoryID: number, dto: EditInventoryItemDto): Promise<InventoryItem> {
        try {

            let result = await this.inventoriesData.editInventoryItem(inventoryID, dto);

            if (result) {
                return result;
            } else {
                throw new BadRequestException(
                    inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_RESULT_EDIT.EN,
                    errorResponseMessage.BAD_REQUEST.EN);
            }

        } catch (error) {
            Logger.error(`inventories Service - editInventoryItem func GotError: ${error}`);
            throw error;
        }
    }

    async deleteInventoryItem(inventoryID: number): Promise<void> {
        try {
            let result = await this.inventoriesData.deleteInvenotoryItem(inventoryID);
            if (result?.affected > 0) {
                return null;
            } else {
                throw new BadRequestException(
                    inventoryResponseMessage.BAD_REQUEST_FAILED_DELETE.EN,
                    errorResponseMessage.BAD_REQUEST.EN);
            }

        } catch (error) {

            Logger.error(`inventories Service - deleteInventoryItem func GotError: ${error}`);

            throw error;

        }
    }

    async bulkDeleteInventoryItems(inventoryIds: number[]): Promise<void> {
        try {
            let result = await this.inventoriesData.bulkDeleteInventoryItems(inventoryIds);
            if (result?.affected > 0) {
                return null;

            } else {
                throw new BadRequestException(
                    inventoryResponseMessage.BAD_REQUEST_FAILED_DELETE.EN,
                    errorResponseMessage.BAD_REQUEST.EN);
            }
        } catch (error) {
            Logger.error(`inventories Service - bulkDeleteInventoryItems func GotError: ${error}`);
            throw error;
        }
    }
}
