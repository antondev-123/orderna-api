import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { consumers, errorResponseMessage, swaggerConstant, urlsConstant } from 'src/common/constants';
import { purchaseResponseMessage } from 'src/common/constants/response-messages/purchase.reponse-message';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { PurchaseFilterDto } from './dtos/filter-purchase.dto';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dtos/purchase.dto';
import { Purchase } from './purchase.entity';
import { PurchaseService } from './purchase.service';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_PURCHASES)
@ApiTags('Purchases')
@ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
    type: ErrorResponseDto
})
@ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: errorResponseMessage.UNPROCESSABLE_ENTITY.EN,
    type: ErrorResponseDto
})
@ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: errorResponseMessage.UNAUTHORIZED.EN,
    type: ErrorResponseDto
})
@ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: errorResponseMessage.BAD_REQUEST.EN,
    type: ErrorResponseDto
})
export class PurchaseController {
    constructor(
        private purchaseService: PurchaseService,
    ) { }

    @Get()
    @ResponseSerializer(HttpStatus.OK, purchaseResponseMessage.GET_PURCHASES)
    @ApiOperation({ summary: 'Get purchases' })
    @ApiResponse({ status: HttpStatus.OK, description: purchaseResponseMessage.GET_PURCHASES.EN, type: SuccessResponseDto })
    async getPurchases(
        @Query() filterDto: PurchaseFilterDto,
    ): Promise<any> {
        try {
            return await this.purchaseService.getPurchases(filterDto);
        } catch (error) {
            throw error;
        }
    }

    @Post()
    @ResponseSerializer(HttpStatus.CREATED, purchaseResponseMessage.CREATE_PURCHASE)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ description: 'Add purchase' })
    @ApiResponse({ status: HttpStatus.CREATED, description: purchaseResponseMessage.CREATE_PURCHASE.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: errorResponseMessage.NOT_FOUND.EN, type: ErrorResponseDto })
    async addPurchase(@Body() createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
        try {
            return await this.purchaseService.addPurchase(createPurchaseDto);
        } catch (error) {
            throw error;
        }
    }

    @Put(urlsConstant.API_UPDATE_PURCHASE)
    @ResponseSerializer(HttpStatus.OK, purchaseResponseMessage.UPDATE_PURCHASE)
    @ApiOperation({ description: 'Edit purchase' })
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiParam({ name: 'purchaseId', description: 'ID of the purhcase to be edited', type: 'number' })
    @ApiResponse({ status: HttpStatus.OK, description: purchaseResponseMessage.UPDATE_PURCHASE.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: errorResponseMessage.NOT_FOUND.EN, type: ErrorResponseDto })
    async updatePurchase(
        @Param('purchaseId', ParseIntPipe) purchaseID: number,
        @Body() updatePurchaseDto: UpdatePurchaseDto,
    ): Promise<Purchase> {
        try {
            return await this.purchaseService.updatePurchase(purchaseID, updatePurchaseDto);
        } catch (error) {
            throw error;
        }
    }

    @Delete(urlsConstant.API_DELETE_PURCHASE)
    @ResponseSerializer(HttpStatus.OK, purchaseResponseMessage.DELETE_PURCHASE)
    @ApiOperation({ summary: 'Single delete purchase by purchaseId' })
    @ApiResponse({ status: HttpStatus.OK, description: purchaseResponseMessage.DELETE_PURCHASE.EN, type: SuccessResponseDto })
    async deletePurchase(
        @Param('purchaseId', ParseIntPipe) purchaseID: number,
    ): Promise<void> {
        try {
            return await this.purchaseService.deletePurchase(purchaseID);
        } catch (error) {
            throw error;
        }
    }

    @Post(urlsConstant.API_DELETE_PURCHASES)
    @ResponseSerializer(HttpStatus.OK, purchaseResponseMessage.DELETE_PURCHASES)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ description: 'Delete multiple purchases' })
    @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
    @ApiResponse({ status: HttpStatus.OK, description: purchaseResponseMessage.DELETE_PURCHASES.EN, type: SuccessResponseDto })
    async deletePurchases(
        @Body("ids") ids: number[]
    ): Promise<void> {
        try {
            return await this.purchaseService.deletePurchasesByIds(ids);
        } catch (error) {
            throw error;
        }
    }
}
