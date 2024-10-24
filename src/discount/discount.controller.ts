import { Body, Controller, Delete, Get, HttpStatus, Param, ParseArrayPipe, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { discountResponseMessage, errorResponseMessage, urlsConstant } from 'src/common/constants';
import { consumers, swaggerConstant } from 'src/common/constants/swagger.constant';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { DiscountService } from './discount.service';
import { CheckDiscountDto } from './dtos/check-discount.dto';
import { CreateDiscountTransactionDto } from './dtos/create-discount-transaction.dto';
import { CreateDiscountDto } from './dtos/create-discount.dto';
import { FilterDetailDiscountSummaryDto } from './dtos/filter-detail-discount-summary.dto';
import { FilterDiscountDto } from './dtos/filter-discount.dto';
import { UpdateDiscountDto } from './dtos/update-discount.dto';
import { DiscountUtils } from './utils/discount.utils';

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags('Discounts')
@Controller(urlsConstant.ROUTE_PREFIX_DISCOUNT)
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
export class DiscountController {
    constructor(
        private readonly discountService: DiscountService,
        private readonly discountUtils: DiscountUtils
    ) {
    }

    @Post()
    @ResponseSerializer(HttpStatus.CREATED, discountResponseMessage.ADD_DISCOUNT)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Create a new discount' })
    @ApiResponse({ status: HttpStatus.CREATED, description: discountResponseMessage.ADD_DISCOUNT.EN, type: SuccessResponseDto })
    async addDiscount(
        @Body() body: CreateDiscountDto
    ) {
        try {
            return await this.discountService.addDiscount(body);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.GET_DISCOUNT_LIST)
    @ApiOperation({ summary: 'Fetch a list of discounts' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.GET_DISCOUNT_LIST.EN, type: SuccessResponseDto })
    async getDiscounts(
        @Query() filters: FilterDiscountDto
    ) {
        try {
            return await this.discountService.getDiscounts(filters);
        } catch (error) {
            throw error;
        }
    }

    @Get(urlsConstant.API_GET_DISCOUNT)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.GET_DISCOUNT_DETAILS)
    @ApiParam({ name: 'discountId', description: 'ID of the discount to be fetched', type: 'number' })
    @ApiOperation({ summary: 'Fetch an existing discount' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.GET_DISCOUNT_DETAILS.EN, type: SuccessResponseDto })
    async getDiscount(
        @Param('discountId', ParseIntPipe) discountId: number
    ) {
        try {
            return await this.discountService.getDiscountById(discountId);
        } catch (error) {
            throw error;
        }
    }

    @Patch(urlsConstant.API_UPDATE_DISCOUNT)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.UPDATE_DISCOUNT)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiParam({ name: 'discountId', description: 'ID of the discount to be updated', type: 'number' })
    @ApiOperation({ summary: 'Update an existing discount' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.UPDATE_DISCOUNT.EN, type: SuccessResponseDto })
    async updateDiscount(
        @Param('discountId', ParseIntPipe) discountId: number,
        @Body() body: UpdateDiscountDto
    ) {
        try {
            return await this.discountService.updateDiscount(discountId, body);
        } catch (error) {
            throw error;
        }
    }

    @Delete(urlsConstant.API_DELETE_DISCOUNT)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.DELETE_DISCOUNT)
    @ApiParam({ name: 'discountId', description: 'ID of the discount to be deleted', type: 'number' })
    @ApiOperation({ summary: 'Delete an existing discount' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.DELETE_DISCOUNT.EN, type: SuccessResponseDto })
    async deleteDiscount(
        @Param('discountId', ParseIntPipe) discountId: number
    ) {
        try {
            return await this.discountService.deleteDiscountById(discountId);
        } catch (error) {
            throw error;
        }
    }

    @Delete(urlsConstant.API_DELETE_DISCOUNTS)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.DELETE_DISCOUNT)
    @ApiOperation({ summary: 'Delete multiple discounts' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.DELETE_DISCOUNT.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: discountResponseMessage.DISCOUNT_NOT_FOUND.EN, type: ErrorResponseDto })
    async deleteDiscounts(
        @Query("ids", new ParseArrayPipe({ items: Number, separator: "," }))
        ids: number[],
    ) {
        try {
            return await this.discountService.deleteDiscountByIds(ids);
        } catch (error) {
            throw error;
        }
    }

    //TODO: can probably delete because we can use filters
    @Get(urlsConstant.API_GET_DISCOUNTS_STORE)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.GET_DISCOUNT_STORES_LIST)
    @ApiOperation({ summary: 'Fetch a discount based on store ID' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.GET_DISCOUNT_STORES_LIST.EN, type: SuccessResponseDto })
    async discountsByStoreId(
        @Param('storeId') storeId: number,
        // @Query() filters: FilterDiscountDto
    ) {
        try {
            return await this.discountService.discountByStoreId(storeId);
        } catch (error) {
            throw error;
        }
    }

    //TODO: Do we need?
    @Get(urlsConstant.API_GET_DISCOUNTS_CHECK)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.DISCOUNT_MSG_AVAILABLE)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Check a discount' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.DISCOUNT_MSG_UNAVAILABLE_EXPIRED.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: discountResponseMessage.DISCOUNT_NOT_FOUND.EN, type: ErrorResponseDto })
    async checkDiscount(
        @Body() body: CheckDiscountDto
    ) {
        try {
            return await this.discountUtils.checkDiscountAvailable(body);
        } catch (error) {
            throw error;
        }
    }

    //TODO: can probably delete because we can use filters
    @Post(urlsConstant.API_GET_DISCOUNTS_TRANSACTION)
    @ResponseSerializer(HttpStatus.CREATED, discountResponseMessage.DISCOUNT_USED)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Create a new discount by transaction' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.DISCOUNT_USED.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: discountResponseMessage.DISCOUNT_NOT_FOUND.EN, type: ErrorResponseDto })
    async addDiscountTransaction(
        @Body() body: CreateDiscountTransactionDto
    ) {
        try {
            return await this.discountService.addDiscountTransaction(body);
        } catch (error) {
            throw error;
        }
    }

    //TODO: check if needed?
    @Get(urlsConstant.API_GET_DISCOUNTS_TRANSACTION_SUMMARY)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.GET_DISCOUNT_SUMMARY)
    @ApiOperation({ summary: 'Fetch a discount by transaction' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.GET_DISCOUNT_SUMMARY.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: discountResponseMessage.DISCOUNT_NOT_FOUND.EN, type: ErrorResponseDto })
    async getDiscountTransactionSummary(
        @Query() query: FilterDetailDiscountSummaryDto
    ) {
        try {
            return await this.discountService.getDiscountSummary(query);
        } catch (error) {
            throw error;
        }
    }

    //TODO: check if needed?
    @Get(urlsConstant.API_GET_DISCOUNTS_TRANSACTION_SUMMARY_ID)
    @ResponseSerializer(HttpStatus.OK, discountResponseMessage.GET_DISCOUNT_SUMMARY)
    @ApiParam({ name: 'discountId', description: 'ID of the discount to be filtered', type: 'number' })
    @ApiOperation({ summary: 'Fetch a discount by transaction summary detail' })
    @ApiResponse({ status: HttpStatus.OK, description: discountResponseMessage.GET_DISCOUNT_SUMMARY.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: discountResponseMessage.DISCOUNT_NOT_FOUND.EN, type: ErrorResponseDto })
    async getDiscountTransactionSummaryDetail(
        @Query() query: FilterDetailDiscountSummaryDto,
        @Param('discountId') discountId: number
    ) {
        try {
            return await this.discountService.getDiscountSummary(query, discountId);
        } catch (error) {
            throw error;
        }
    }
}
