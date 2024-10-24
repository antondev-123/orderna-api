import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { errorResponseMessage } from 'src/common/constants';
import { Repository } from 'typeorm';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';
import { OpeningHours } from '../entities/opening-hours.entity';
import { Store } from '../entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
    @InjectRepository(OpeningHours)
    private openingHoursRepository: Repository<OpeningHours>,
  ) { }

  async findAll(search?: string, page?: number, limit?: number): Promise<Store[]> {
    try {
      const queryBuilder = this.storesRepository.createQueryBuilder('store');

      if (search) {
        queryBuilder.where('store.Name LIKE :search OR store.Location LIKE :search', { search: `%${search}%` });
      }

      if (page && limit) {
        queryBuilder.skip((page - 1) * limit).take(limit);
      }

      queryBuilder.leftJoinAndSelect('store.openingHours', 'openingHours');

      return await queryBuilder.getMany();
    } catch (error) {
      throw new Error('Failed to fetch stores');
    }
  }

  async findOne(id: number): Promise<Store> {
    try {
      const store = await this.storesRepository.findOne({
        where: { id },
        relations: ['openingHours'],
      });

      if (!store) {
        throw new NotFoundException(`Store with ID ${id} not found`, errorResponseMessage.NOT_FOUND.EN);
      }

      return store;
    } catch (error) {
      throw error;
    }
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepository.create(createStoreDto);
    try {
      return await this.storesRepository.save(store);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Store with the given name already exists.', errorResponseMessage.CONFLICT.EN);
      }
      throw error;
    }
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    try {
      await this.storesRepository.update(id, updateStoreDto);
      return await this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.openingHoursRepository.delete({ store: { id } });
      const result = await this.storesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Store with ID ${id} not found`, errorResponseMessage.NOT_FOUND.EN);
      }
    } catch (error) {
      throw error;
    }
  }

  async removeBulk(ids: number[]): Promise<void> {
    try {
      await this.openingHoursRepository.createQueryBuilder()
        .delete()
        .from(OpeningHours)
        .where('storeId IN (:...ids)', { ids })
        .execute();

      const result = await this.storesRepository.delete(ids);
      if (result.affected === 0) {
        throw new NotFoundException(`No stores found for the provided IDs`, errorResponseMessage.NOT_FOUND.EN);
      }
    } catch (error) {
      throw new Error('Failed to remove stores');
    }
  }
}
