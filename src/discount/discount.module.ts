import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ContactInformationEntity } from 'src/contact-information/contact-information.entity';
import { CustomerEntity } from 'src/customer/customer.entity';
import { Store } from 'src/store/entities/store.entity';
import { TransactionEntity } from 'src/transaction/entities/transaction.entity';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { DiscountStoreEntity } from './entities/discount-stores.entity';
import { DiscountTransactionEntity } from './entities/discount-transactions.entity';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountUtils } from './utils/discount.utils';

@Module({
    imports: [
        AuthModule,
        CommonModule,
        TypeOrmModule.forFeature([
            DiscountEntity,
            DiscountStoreEntity,
            DiscountTransactionEntity,
            CustomerEntity,
            Store,
            TransactionEntity,
            ContactInformationEntity,
        ]),
    ],
    controllers: [DiscountController],
    providers: [DiscountService, DiscountUtils],
    exports: [DiscountService]
})
export class DiscountModule { }
