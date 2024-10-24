import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, In, Repository } from "typeorm";
import {
    CreateInventoryItemDto,
    EditInventoryItemDto,
    GetAllInventoriesDataDto,
    GetInventoriesFilterByDate,
    GetInventoriesFilterByStoreID
} from "../inventories.dto";
import { InventoryItem } from "../inventories.entity";

@Injectable()
export class InventoriesData {
    constructor(
        @InjectRepository(InventoryItem) private inventoriesEntityRepository: Repository<InventoryItem>,
    ) { }

    async getAllInventories(dto: GetAllInventoriesDataDto): Promise<InventoryItem[]> {

        return await this.inventoriesEntityRepository.find({ skip: dto.pageNum * dto.pageSize, take: dto.pageSize, order: dto.orderObject });
    }

    async getInventoriesFilterByDate(dto: GetInventoriesFilterByDate): Promise<InventoryItem[]> {
        let createdAtFilterTime = dto.createdAtFilterTime;
        return await this.inventoriesEntityRepository.createQueryBuilder("inventory")
            .select([
                'inventory.inventoryItemID AS inventoryItemID',
                'inventory.createdAt AS createdAt',
                'inventory.updatedAt AS updatedAt',
                'inventory.deletedAt AS deletedAt',
                'inventory.storeID AS storeID',
                'inventory.title AS title',
                'inventory.unit AS unit',
                'inventory.sk_plu AS sk_plu'
            ])
            .where("inventory.createdAt >= :createdAtFilterTime", { createdAtFilterTime }) // Filter by createdAt
            .skip(dto.pageNum * dto.pageSize)
            .take(dto.pageSize)
            .orderBy(dto.orderObject) // Assuming orderObject is valid for TypeORM order clause
            .getRawMany();
    }

    async getInventoriesFilterByStore(dto: GetInventoriesFilterByStoreID): Promise<InventoryItem[]> {

        let storeID = dto.storeID;
        return await this.inventoriesEntityRepository.createQueryBuilder("inventory")
            .select([
                'inventory.inventoryItemID AS inventoryItemID',
                'inventory.createdAt AS createdAt',
                'inventory.updatedAt AS updatedAt',
                'inventory.deletedAt AS deletedAt',
                'inventory.storeID AS storeID',
                'inventory.title AS title',
                'inventory.unit AS unit',
                'inventory.sk_plu AS sk_plu'
            ])
            .where("inventory.storeID = :storeID", { storeID }) // Filter by createdAt
            .skip(dto.pageNum * dto.pageSize)
            .take(dto.pageSize)
            .orderBy(dto.orderObject) // Assuming orderObject is valid for TypeORM order clause
            .getRawMany();
    }

    async createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {

        const inventoryItemEntity = this.inventoriesEntityRepository.create(dto);

        return await this.inventoriesEntityRepository.save(inventoryItemEntity);

    }

    async editInventoryItem(inventoryID: number, dto: EditInventoryItemDto): Promise<InventoryItem> {
        let invetoryItemEntity = await this.inventoriesEntityRepository.findOne({ where: { inventoryItemID: inventoryID } });
        if (!invetoryItemEntity) {
            throw new NotFoundException("Inventory not found");
        }
        invetoryItemEntity.sk_plu = dto.sk_plu;
        invetoryItemEntity.title = dto.title;
        invetoryItemEntity.unit = dto.unit;
        invetoryItemEntity.storeID = dto.storeID;
        return await this.inventoriesEntityRepository.save(invetoryItemEntity);
    }

    async deleteInvenotoryItem(inventoryID: number): Promise<DeleteResult> {
        return await this.inventoriesEntityRepository.delete({ inventoryItemID: inventoryID });
    }

    async bulkDeleteInventoryItems(inventoryIds: number[]): Promise<DeleteResult> {
        return await this.inventoriesEntityRepository.delete({ inventoryItemID: In(inventoryIds) })
    }
}