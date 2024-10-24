import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { OpeningHoursController } from './controllers/opening-hours.controller';
import { StoresController } from './controllers/stores.controller';
import { OpeningHours } from './entities/opening-hours.entity';
import { Store } from './entities/store.entity';
import { StoreRepository } from './repository/store.repository';
import { OpeningHoursService } from './services/opening-hours.service';
import { StoresService } from './services/stores.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Store, OpeningHours]),
    CommonModule
  ],
  controllers: [StoresController, OpeningHoursController],
  providers: [StoresService, OpeningHoursService, StoreRepository],
  exports: [StoreRepository]
})
export class StoresModule { }
