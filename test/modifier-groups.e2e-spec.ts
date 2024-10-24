import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthUtil } from './utils/auth.util';
import { ModifierGroupService } from 'src/modifier-groups/modifier-groups.service';
import { urlsConstant } from 'src/common/constants';
import { CategoryService } from 'src/category/category.service';
import { CreateModifierGroupDto } from 'src/modifier-groups/dtos/create-modifier-groups.dto';

describe('ModifierGroupController (e2e)', () => {
    let app: NestFastifyApplication;
    let modifierGroupService: ModifierGroupService;
    let categoryService: CategoryService;
    let authHeader: any;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(CategoryService)
            .useValue({
                findByIds: jest.fn().mockResolvedValue([
                    { id: '1', title: 'Category 1' },
                    { id: '2', title: 'Category 2' },
                ]),
            })
            .overrideProvider(ModifierGroupService)
            .useValue({
                addModifier: jest.fn().mockResolvedValue({
                    id: '1',
                    title: 'Title1',
                    sku_plu: 'plu',
                    description: 'Description of all category',
                    limit: 2,
                    category: ['1', '2'],
                    options: [
                        { price: 234, product: 1 },
                        { price: 11, product: 2 },
                    ],
                }),
                updateModifier: jest.fn().mockResolvedValue({
                    id: '1',
                    title: 'Updated Title',
                    sku_plu: 'plu',
                    description: 'Description of all category',
                    limit: 2,
                    category: ['1', '2'],
                    options: [
                        { optionId: 1, price: 234, product: 1 },
                        { optionId: 2, price: 11, product: 2 },
                    ],
                }),
                deleteModifier: jest.fn().mockResolvedValue({
                    id: '1',
                    title: 'Deleted Modifier',
                }),
                getModifierGroupList: jest.fn().mockResolvedValue({
                    data: {
                        modifier: [
                            { id: '1', title: 'Modifier 1', category: ['1'], description: 'Description 1', limit: 10, options: [{ optionId: 1, price: 100, product: 1 }] },
                            { id: '2', title: 'Modifier 2', category: ['2'], description: 'Description 2', limit: 5, options: [{ optionId: 2, price: 200, product: 2 }] },
                        ],
                        total_record: 2,
                    },
                }),
                getModifierGroupById: jest.fn().mockResolvedValue({
                    id: '1',
                    title: 'Test Modifier',
                    sku_plu: 'TESTSKU',
                    description: 'Test Description',
                    limit: 10,
                    category: ['1'],
                    options: [
                        { optionId: 1, price: 100, product: 1 },
                    ],
                }),
            })
            .compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
        modifierGroupService = moduleFixture.get<ModifierGroupService>(ModifierGroupService);
        categoryService = moduleFixture.get<CategoryService>(CategoryService);
        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        const authUtil = new AuthUtil(app);
        await authUtil.signUp();
        const response = await authUtil.login();
        authHeader = await authUtil.getAuthToken(response);
    });

    afterAll(async () => {
        await app.close();
    });

    it('create modifier group (POST)', async () => {
        const createModifierGroupDto: CreateModifierGroupDto = {
            title: 'Title1',
            sku_plu: 'plu',
            description: 'Description of all category',
            limit: 2,
            category: ['1', '2'],
            options: [
                { price: 234, product: 1 },
                { price: 11, product: 2 },
            ],
        };

        return request(app.getHttpServer())
            .post(`${urlsConstant.ROUTE_PREFIX_MODIFIER}`)
            .set(authHeader)
            .send(createModifierGroupDto)
            .expect(HttpStatus.CREATED)
            .expect(response => {
                expect(response.body.message).toEqual(['Modifier added successfully']);
                expect(response.body.data).toMatchObject({
                    title: 'Title1',
                    sku_plu: 'plu',
                    description: 'Description of all category',
                    limit: 2,
                    category: ['1', '2'],
                    options: [
                        { price: 234, product: 1 },
                        { price: 11, product: 2 },
                    ],
                });
            });
    });

    it(`update modifier group (PUT)`, async () => {
        const createModifierGroupDto: any = {
            title: 'Initial Title',
            sku_plu: 'SKU123',
            description: 'Initial Description',
            limit: 5,
            category: ['1', '2'],
            options: [
                { optionId: 1, price: 100, product: 2 },
                { optionId: 2, price: 200, product: 3 },
            ],
        };

        const modifierGroup = await modifierGroupService.addModifier(createModifierGroupDto);
        const editModifierGroupDto = { title: 'Updated Title' };
        const modifierGroupsIdDto = { id: modifierGroup["id"] };
        return request(app.getHttpServer())
            .put(`${urlsConstant.ROUTE_PREFIX_MODIFIER}/${modifierGroupsIdDto.id}`)
            .set(authHeader)
            .send(editModifierGroupDto)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.message).toEqual(['Modifier updated successfully']);
                expect(response.body.data.title).toEqual('Updated Title');
            });
    });

    it(`delete modifier group (DELETE)`, async () => {
        const createModifierGroupDto: any = {
            title: 'Modifier to be deleted',
            sku_plu: 'SKU123',
            description: 'Description',
            limit: 5,
            category: ['1', '2'],
            options: [
                { optionId: 1, price: 100, product: 2 },
                { optionId: 2, price: 200, product: 3 },
            ],
        };
        const modifierGroup = await modifierGroupService.addModifier(createModifierGroupDto);
        const deleteModifierDto = { modifier: [modifierGroup.id] };
        return await request(app.getHttpServer())
            .delete(`${urlsConstant.ROUTE_PREFIX_MODIFIER}/${deleteModifierDto.modifier}`)
            .set(authHeader)
            .send(deleteModifierDto)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.message).toEqual(['Modifier deleted successfully']);
            });
    });

    it('should get the modifier group list (GET)', async () => {
        return request(app.getHttpServer())
            .get(`${urlsConstant.ROUTE_PREFIX_MODIFIER}`)
            .set(authHeader)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.data.data).toBeDefined();
                expect(response.body.data.data.modifier).toEqual([
                    { id: '1', title: 'Modifier 1', category: ['1'], description: 'Description 1', limit: 10, options: [{ optionId: 1, price: 100, product: 1 }] },
                    { id: '2', title: 'Modifier 2', category: ['2'], description: 'Description 2', limit: 5, options: [{ optionId: 2, price: 200, product: 2 }] },
                ]);
                expect(response.body.data.data.total_record).toEqual(2);
            });
    });

    it('should get modifier group by ID (GET)', async () => {
        const modifierGroupId = '1';
        return request(app.getHttpServer())
            .get(`${urlsConstant.ROUTE_PREFIX_MODIFIER}/${modifierGroupId}`)
            .set(authHeader)
            .expect(HttpStatus.OK)
            .expect(response => {
                expect(response.body.data).toMatchObject({
                    id: '1',
                    title: 'Test Modifier',
                    sku_plu: 'TESTSKU',
                    description: 'Test Description',
                    limit: 10,
                    category: ['1'],
                    options: [
                        { optionId: 1, price: 100, product: 1 },
                    ],
                });
            });
    });
});
