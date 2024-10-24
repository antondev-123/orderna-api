import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ModifierGroupsRepository } from "./repositories/modifier-groups.repository";
import { CreateModifierGroupDto } from "./dtos/create-modifier-groups.dto";
import { ProductRepository } from "src/product/product.repository";
import {
    categoryResponseMessage,
    errorResponseMessage,
    productResponseMessage,
} from "src/common/constants";
import { ModifierOptionsRepository } from "./repositories/modifier-options.repository";
import { CategoryRepository } from "src/category/category.repository";
import { ModifierGroupsCategoryRepository } from "./repositories/modifier-groups-category.repository";
import { ModifierGroupsEntity } from "./entities/modifier-groups.entity";
import { ModifierGroupsIdDto } from "./dtos/params-modifier-groups.dto";
import { EditModifierGroupDto } from "./dtos/update-modifier-groups.dto";
import {
    modifierCategoryResponseMessage,
    modifierGroupsResponseMessage,
    modifierOptionResponseMessage,
} from "src/common/constants/response-messages/modifier-groups.response-message";
import { pagination } from "src/common/dtos/pagination-default";
import { ListModifierGroupDto } from "./dtos/list-modifier-groups.dto";

@Injectable()
export class ModifierGroupService {
    constructor(
        @InjectRepository(ModifierGroupsRepository)
        private modifierGroupsRepository: ModifierGroupsRepository,
        @InjectRepository(ModifierOptionsRepository)
        private modifierOptionsRepository: ModifierOptionsRepository,
        @InjectRepository(ProductRepository)
        private productRepository: ProductRepository,
        @InjectRepository(CategoryRepository)
        private categoryRepository: CategoryRepository,
        @InjectRepository(ModifierGroupsCategoryRepository)
        private modifierGroupsCategoryRepository: ModifierGroupsCategoryRepository,
    ) {
    }

    async addModifier(createModifierGroupDto: CreateModifierGroupDto) {
        try {
            const categories = await this.categoryRepository.findCategoryByIds(
                createModifierGroupDto.category.map(id => Number(id)),
            );
            const foundCategoryIds = (categories as any).map(category =>
                category.id.toString(),
            );
            if (foundCategoryIds.length !== createModifierGroupDto.category.length) {
                createModifierGroupDto.category.filter(
                    id => !foundCategoryIds.includes(id),
                );
                throw new NotFoundException(
                    categoryResponseMessage.CATEGORY_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN,
                );
            }

            const productIds = createModifierGroupDto.options.map(
                option => option.product,
            );
            const products =
                await this.productRepository.findProductCategoryByIds(productIds);

            const foundProductIds = products.map(product => product.id);
            if (foundProductIds.length !== productIds.length) {
                productIds.filter(id => !foundProductIds.includes(id));
                throw new NotFoundException(
                    productResponseMessage.PRODUCT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN,
                );
            }

            const modifierGroupJson = new ModifierGroupsEntity();
            modifierGroupJson.title = createModifierGroupDto.title;
            modifierGroupJson.sku_plu = createModifierGroupDto.sku_plu;
            modifierGroupJson.description = createModifierGroupDto.description;
            modifierGroupJson.limit = createModifierGroupDto.limit;

            const modifierGroup =
                this.modifierGroupsRepository.create(modifierGroupJson);
            const saveModifierGroup =
                await this.modifierGroupsRepository.save(modifierGroup);

            const modifierGroupsCategoryEntries = (categories as any).map(
                category => {
                    return this.modifierGroupsCategoryRepository.create({
                        modifier_group_id: saveModifierGroup.id,
                        category_id: category.id,
                    });
                },
            );
            const saveModifierGroupCategory =
                await this.modifierGroupsCategoryRepository.save(
                    modifierGroupsCategoryEntries,
                );

            const modifierOptionsEntries = createModifierGroupDto.options.map(
                option => {
                    return this.modifierOptionsRepository.create({
                        product: products.find(product => product.id === option.product),
                        group: saveModifierGroup,
                        price: option.price,
                    });
                },
            );
            const saveModifierOption = await this.modifierOptionsRepository.save(
                modifierOptionsEntries,
            );
            const response: any = {}
            response.modifierGroupJson = { ...saveModifierGroup, id: saveModifierGroup.id },
                response.categories = saveModifierGroupCategory.map(cat => ({
                    id: cat.category_id,
                    title: categories.find(c => c.id === cat.category_id),
                })),
                response.options = saveModifierOption.map(option => ({
                    id: option.id,
                    productId: option.product.id,
                    productTitle: products.find(p => p.id === option.product.id).title,
                    price: option.price,
                }))
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateModifier(
        modifierGroupsIdDto: ModifierGroupsIdDto,
        editModifierGroupDto: EditModifierGroupDto,
    ) {
        try {
            const modifier = await this.modifierGroupsRepository.findModifierGroup(
                modifierGroupsIdDto.modifierId,
            );
            if (!modifier) {
                throw new NotFoundException(
                    modifierGroupsResponseMessage.MODIFIER_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN,
                );
            }

            if (editModifierGroupDto.category) {
                const categoryIds = editModifierGroupDto.category.map(id => Number(id));
                const categories = await this.categoryRepository.findCategoryByIds(categoryIds);
                const foundIds = categories.map(category => category.id.toString());
                if (foundIds.length !== editModifierGroupDto.category.length) {
                    const missingIds = editModifierGroupDto.category.filter(
                        id => !foundIds.includes(id),
                    );
                    throw new NotFoundException(
                        modifierCategoryResponseMessage.CATEGORY_NOT_FOUND.EN,
                        errorResponseMessage.NOT_FOUND.EN,
                    );
                }

                await this.modifierGroupsCategoryRepository.delete({
                    modifier_group_id: modifier.id,
                });

                const modifierGroupsCategoryEntries = categories.map(category => {
                    return this.modifierGroupsCategoryRepository.create({
                        modifier_group_id: modifier.id,
                        category_id: category.id,
                    });
                });

                await this.modifierGroupsCategoryRepository.save(
                    modifierGroupsCategoryEntries,
                );
            }

            if (editModifierGroupDto.options) {
                const existingOptions: any =
                    await this.modifierOptionsRepository.findModifierOption(modifier.id);
                for (const optionDto of editModifierGroupDto.options) {
                    if (optionDto.optionId) {
                        const existingOption = existingOptions.find(
                            opt => opt.id === optionDto.optionId && opt.group.id === modifier.id,
                        );
                        if (existingOption) {
                            const product = await this.productRepository.findProductById(optionDto.product);
                            if (!product) {
                                throw new NotFoundException(
                                    productResponseMessage.PRODUCT_NOT_FOUND.EN,
                                    errorResponseMessage.NOT_FOUND.EN,
                                );
                            }

                            existingOption.price = optionDto.price ?? existingOption.price;
                            existingOption.product = product;
                            await this.modifierOptionsRepository.save(existingOption);
                        } else {
                            throw new NotFoundException(
                                modifierOptionResponseMessage.OPTION_NOT_FOUND.EN,
                                errorResponseMessage.NOT_FOUND.EN,
                            );
                        }
                    } else {
                        const product = await this.productRepository.findProductById(optionDto.product);
                        if (!product) {
                            throw new NotFoundException(
                                productResponseMessage.PRODUCT_NOT_FOUND.EN,
                                errorResponseMessage.NOT_FOUND.EN,
                            );
                        }

                        const optionJson: any = this.modifierOptionsRepository.create({
                            product,
                            price: optionDto.price,
                            group: modifier,
                        });
                        await this.modifierOptionsRepository.save(optionJson);
                    }
                }
            }
            Object.assign(modifier, editModifierGroupDto);
            const saveData = await this.modifierGroupsRepository.save(modifier);
            return saveData
        } catch (error) {
            throw error;
        }
    }

    async deleteModifier(modifierGroupsIdDto: ModifierGroupsIdDto) {
        try {
            const modifier = await this.modifierGroupsRepository.findModifierGroup(
                modifierGroupsIdDto.modifierId,
            );
            if (!modifier) {
                throw new NotFoundException(
                    modifierGroupsResponseMessage.MODIFIER_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN,
                );
            }
            Promise.all([
                await this.modifierGroupsRepository.deleteModifier(modifier.id),
                await this.modifierOptionsRepository.deleteModifierOption(modifier.id),
                await this.modifierGroupsCategoryRepository.deleteModifierCategory(
                    modifier.id,
                ),
            ]);
            return modifier;
        } catch (error) {
            throw error;
        }
    }

    async getModifierGroupList(paginationDto: ListModifierGroupDto) {
        try {
            const skip =
                ((paginationDto.page ?? pagination.defaultPage) - 1) *
                (paginationDto.size ?? pagination.pageSize);
            const take = paginationDto.size ?? pagination.pageSize;
            const [modifier, total_record] =
                await this.modifierGroupsRepository.findModifierList(
                    paginationDto.search,
                    skip,
                    take,
                );
            if (!(modifier && modifier.length)) {
                return { modifier: [], total_record: 0 };
            }

            const groupedModifiers = modifier.reduce((acc, current) => {
                const { id, title, option } = current;
                const existingModifier = acc.find(mod => mod.id === id);
                if (existingModifier) {
                    existingModifier.option.push(option);
                } else {
                    acc.push({
                        id,
                        title,
                        option: [option],
                    });
                }
                return acc;
            }, []);
            return { modifier: groupedModifiers, total_record: total_record };
        } catch (error) {
            throw error;
        }
    }

    async getModifierGroupById(modifierGroupsIdDto: ModifierGroupsIdDto) {
        try {
            const modifier = await this.modifierGroupsRepository.findModifierData(
                modifierGroupsIdDto.modifierId,
            );
            if (!modifier) {
                throw new NotFoundException(
                    modifierGroupsResponseMessage.MODIFIER_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN,
                );
            }
            const groupedModifiers = modifier.reduce((acc, current) => {
                const { id, title, sku_plu, option_limit, description, option, option_id, category_id, category } = current;
                const optionObject = {
                    option_id,
                    option,
                };
                const categoryObject = {
                    category_id,
                    category,
                };
                const existingModifier = acc.find(mod => mod.id === id);
                if (existingModifier) {
                    const existingOption = existingModifier.option.find(opt => opt.option_id === option_id);
                    if (!existingOption) {
                        existingModifier.option.push(optionObject);
                    }
                    const existingCategory = existingModifier.category.find(cat => cat.category_id === category_id);
                    if (!existingCategory) {
                        existingModifier.category.push(categoryObject);
                    }
                } else {
                    acc.push({
                        id,
                        title,
                        sku_plu,
                        option_limit,
                        description,
                        option: [optionObject],
                        category: [categoryObject],
                    });
                }
                return acc;
            }, []);
            return groupedModifiers
        } catch (error) {
            throw error
        }
    }
}
