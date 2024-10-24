import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ContactInformationModule } from 'src/contact-information/contact-information.module';
import { StoresModule } from 'src/store/stores.module';
import { SuppliersController } from './supplier.controller';
import { SupplierEntity } from './supplier.entity';
import { SuppliersService } from './supplier.service';


@Module({
  imports: [
    ContactInformationModule,
    AuthModule,
    TypeOrmModule.forFeature([SupplierEntity]),
    StoresModule,
    CommonModule
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SupplierModule { }
