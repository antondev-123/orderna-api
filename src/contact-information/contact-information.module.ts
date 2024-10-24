import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactInformationEntity, MobileInformationEntity, TelephoneInformationEntity } from './contact-information.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContactInformationEntity, TelephoneInformationEntity, MobileInformationEntity])],
    exports: [TypeOrmModule]
})
export class ContactInformationModule { }
