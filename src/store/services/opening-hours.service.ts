import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOpeningHoursDto } from '../dtos/create-opening-hours.dto';
import { UpdateOpeningHoursDto } from '../dtos/update-opening-hours.dto';
import { OpeningHours } from '../entities/opening-hours.entity';
import { Store } from '../entities/store.entity';

@Injectable()
export class OpeningHoursService {
  constructor(
    @InjectRepository(OpeningHours)
    private openingHoursRepository: Repository<OpeningHours>,
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) { }

  async findAll(): Promise<OpeningHours[]> {
    try {
      return await this.openingHoursRepository.find({ relations: ['store'] });
    } catch (err) {
      throw new Error('Failed to fetch opening hours');
    }
  }

  async findOne(id: number): Promise<OpeningHours> {
    try {
      const openingHours = await this.openingHoursRepository.findOne({
        where: { id },
        relations: ['store'],
      });

      if (!openingHours) {
        throw new NotFoundException(`OpeningHours with ID ${id} not found`);
      }

      return openingHours;
    } catch (err) {
      throw err;
    }
  }

  async create(createOpeningHoursDto: CreateOpeningHoursDto): Promise<OpeningHours> {
    try {
      const { storeID, openingDayOfWeek, openingTimeSlots, openingIsClosed, openingIs24Hours } = createOpeningHoursDto;
      const store = await this.storesRepository.findOne({ where: { id: storeID } });

      if (!store) {
        throw new NotFoundException(`Store with ID ${storeID} not found`);
      }

      const existingOpeningHours = await this.openingHoursRepository.findOne({
        where: { store: { id: storeID }, openingDayOfWeek },
      });

      if (existingOpeningHours) {
        // Update the existing opening hours for the day
        existingOpeningHours.openingTimeSlots = openingTimeSlots.map(slot => slot.timeSlot);
        existingOpeningHours.openingIsClosed = openingIsClosed;
        existingOpeningHours.openingIs24Hours = openingIs24Hours;
        return await this.openingHoursRepository.save(existingOpeningHours);
      }

      const openingHours = this.openingHoursRepository.create({
        store,
        openingDayOfWeek,
        openingTimeSlots: openingTimeSlots.map(slot => slot.timeSlot),
        openingIsClosed,
        openingIs24Hours,
      });

      return await this.openingHoursRepository.save(openingHours);
    } catch (err) {
      throw new Error('Failed to create opening hours');
    }
  }

  async update(id: number, updateOpeningHoursDto: UpdateOpeningHoursDto): Promise<OpeningHours> {
    try {
      const { storeID, openingDayOfWeek, openingTimeSlots, openingIsClosed, openingIs24Hours } = updateOpeningHoursDto;
      const store = await this.storesRepository.findOne({ where: { id: storeID } });

      if (!store) {
        throw new NotFoundException(`Store with ID ${storeID} not found`);
      }

      const existingOpeningHours = await this.openingHoursRepository.preload({
        id,
        store,
        openingDayOfWeek,
        openingTimeSlots: openingTimeSlots.map(slot => slot.timeSlot),
        openingIsClosed,
        openingIs24Hours,
      });

      if (!existingOpeningHours) {
        throw new NotFoundException(`OpeningHours with ID ${id} not found`);
      }

      return await this.openingHoursRepository.save(existingOpeningHours);
    } catch (err) {
      throw new Error('Failed to update opening hours');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.openingHoursRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`OpeningHours with ID ${id} not found`);
      }
    } catch (err) {
      throw err;
    }
  }

  async removeBulk(ids: number[]): Promise<void> {
    try {
      const result = await this.openingHoursRepository.delete(ids);
      if (result.affected === 0) {
        throw new NotFoundException(`No OpeningHours found for the provided IDs`);
      }
    } catch (err) {
      throw new Error('Failed to remove opening hours');
    }
  }
}
