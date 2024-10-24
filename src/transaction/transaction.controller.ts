import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { errorResponseMessage, transactionResponseMessage } from "src/common/constants";
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import { EditTransactionDto } from "./dtos/edit-transaction.dto";
import { ListTransactionDto } from "./dtos/list-transaction.dto";
import { TransactionIdDto } from "./dtos/params-transaction.dto";
import { TransactionService } from "./transaction.service";
import { TransactionEntity } from "./entities/transaction.entity";


@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_TRANSACTION)
@ApiTags("Transactions")
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
export class TransactionController {
    constructor(
        private transactionService: TransactionService,
    ) {
    }

    @Post()
    @ResponseSerializer(HttpStatus.CREATED, transactionResponseMessage.ADD_TRANSACTION)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Create a new transaction' })
    @ApiResponse({ status: HttpStatus.CREATED, description: transactionResponseMessage.ADD_TRANSACTION.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store, customer, staff or product not found.", type: ErrorResponseDto })
    async addTransaction(
        @Body() createTransactionDto: CreateTransactionDto,
    ) {
        try {
            return await this.transactionService.addTransaction(createTransactionDto);
        } catch (error) {
            throw error;
        }
    }

    @Put(urlsConstant.API_UPDATE_TRANSACTION)
    @ResponseSerializer(HttpStatus.OK, transactionResponseMessage.UPDATE_TRANSACTION)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Edit an existing transaction' })
    @ApiResponse({ status: HttpStatus.OK, description: transactionResponseMessage.UPDATE_TRANSACTION.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Store, customer, staff or transaction not found.", type: ErrorResponseDto })
    async editTransaction(
        @Param() transactionIdDto: TransactionIdDto,
        @Body() editTransactionDto: EditTransactionDto,
    ) {
        try {
            return await this.transactionService.editTransaction(
                transactionIdDto,
                editTransactionDto,
            );
        } catch (error) {
            throw error;
        }
    }

    @Delete(urlsConstant.API_DELETE_TRANSACTION)
    @ResponseSerializer(HttpStatus.OK, transactionResponseMessage.DELETED_TRANSACTION)
    @ApiOperation({ summary: 'Delete an existing transaction' })
    @ApiResponse({ status: HttpStatus.OK, description: transactionResponseMessage.DELETED_TRANSACTION.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: transactionResponseMessage.TRANSACTION_NOT_FOUND.EN, type: ErrorResponseDto })
    async deleteTransaction(
        @Param() transactionIdDto: TransactionIdDto,
    ) {
        try {
            return await this.transactionService.deleteTransaction(transactionIdDto);
        } catch (error) {
            throw error;
        }
    }

    @Get()
    @ResponseSerializer(HttpStatus.OK, transactionResponseMessage.GET_TRANSACTION_LIST)
    @ApiOperation({ summary: 'Get a transaction list' })
    @ApiResponse({ status: HttpStatus.OK, description: transactionResponseMessage.GET_TRANSACTION_LIST.EN, type: SuccessResponseDto })
    async getTransactionList(
        @Query() listTransactionDto: ListTransactionDto,
    ) {
        try {
            return await this.transactionService.getTransactionList(listTransactionDto);
        } catch (error) {
            throw error;
        }
    }

    @Get(urlsConstant.API_GET_TRANSACTION)
    @ResponseSerializer(HttpStatus.OK, transactionResponseMessage.GET_TRANSACTION_DETAILS)
    @ApiOperation({ summary: 'Get a transaction details' })
    @ApiResponse({ status: HttpStatus.OK, description: transactionResponseMessage.DELETED_TRANSACTION.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: transactionResponseMessage.TRANSACTION_NOT_FOUND.EN, type: ErrorResponseDto })
    async getTransactionDetails(
        @Param() transactionIdDto: TransactionIdDto,
    ) {
        try {
            return await this.transactionService.getTransactionDetails(transactionIdDto);
        } catch (error) {
            throw error;
        }
    }

    @Post(urlsConstant.API_DELETE_TRANSACTIONS)
    @ResponseSerializer(HttpStatus.OK, transactionResponseMessage.DELETED_TRANSACTIONS)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Delete multiple transactions by IDs' })
    @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' } } } } })
    @ApiResponse({ status: HttpStatus.OK, description: transactionResponseMessage.DELETED_TRANSACTIONS.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: transactionResponseMessage.TRANSACTIONS_NOT_FOUND.EN, type: ErrorResponseDto })
    async bulkDelete(@Body('ids') ids: number[]): Promise<TransactionEntity[]> {
        try {
            return await this.transactionService.bulkDeleteTransactions(ids);
        } catch (error) {
            throw error;
        }
    }
}
