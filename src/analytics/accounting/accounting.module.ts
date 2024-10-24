import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ProductModule } from 'src/product/product.module';
import { StoresModule } from 'src/store/stores.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { AccountingController } from './accounting.controller';
import { AccountingRepository } from './accounting.repository';
import { AccountingService } from './accounting.service';

@Module({
    imports: [
        TransactionModule,
        ProductModule,
        StoresModule,
        AuthModule,
        CommonModule,
    ],
    controllers: [AccountingController],
    providers: [AccountingService, AccountingRepository],
})
export class AccountingModule { }