import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { Store } from 'src/store/entities/store.entity';
import { StoresModule } from 'src/store/stores.module';
import { SupplierEntity } from 'src/supplier/supplier.entity';
import { InventoriesData } from './data/inventories.data';
import { InventoriesController } from './inventories.controller';
import { InventoryItem } from './inventories.entity';
import { InventoriesService } from './inventories.service';
import { PurchaseController } from './purchase/purchase.controller';
import { Purchase } from './purchase/purchase.entity';
import { PurchaseService } from './purchase/purchase.service';
import { StockControl } from './stock-control.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([InventoryItem, Purchase, StockControl, SupplierEntity, Store]),
    CommonModule,
    StoresModule,
  ],
  providers: [InventoriesService, InventoriesData, PurchaseService],
  controllers: [InventoriesController, PurchaseController],
})
export class InventoriesModule { }
