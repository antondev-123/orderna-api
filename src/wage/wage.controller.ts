import { Body, Controller, Delete, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WageService } from './wage.service';
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { CreateWageDto } from './dtos/create-wage.dto';
import { EditWageDto } from './dtos/edit-wage.dto';
import { WageIdDto } from './dtos/params-wage.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorResponseMessage, urlsConstant } from 'src/common/constants';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { wageResponseMessage } from 'src/common/constants/response-messages/wage.response-messagge';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';

@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
@UseGuards(AuthGuard)
@Controller(urlsConstant.ROUTE_PREFIX_WAGE)
@ApiTags("Wages")
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
@ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: errorResponseMessage.NOT_FOUND.EN,
    type: ErrorResponseDto
})
export class WageController {
    constructor(
        private readonly wageService: WageService
    ) { }

    @Post()
    @ResponseSerializer(HttpStatus.CREATED, wageResponseMessage.ADD_WAGE)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Create a new wage' })
    @ApiResponse({ status: HttpStatus.CREATED, description: wageResponseMessage.ADD_WAGE.EN, type: SuccessResponseDto })
    async addWage(
        @Body() createWageDto: CreateWageDto,
    ) {
        try {
            return await this.wageService.addWage(createWageDto);
        } catch (error) {
            throw error
        }
    }

    @Put(urlsConstant.API_UPDATE_WAGE)
    @ResponseSerializer(HttpStatus.OK, wageResponseMessage.UPDATE_WAGE)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Edit a wage' })
    @ApiResponse({ status: HttpStatus.OK, description: wageResponseMessage.UPDATE_WAGE.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: wageResponseMessage.WAGE_NOT_FOUND.EN, type: ErrorResponseDto })
    async editWage(
        @Param() wageIdDto: WageIdDto,
        @Body() editWageDto: EditWageDto,
    ) {
        try {
            return await this.wageService.editWage(
                wageIdDto,
                editWageDto,
            );
        } catch (error) {
            throw error
        }
    }

    @Delete(urlsConstant.API_DELETE_WAGE)
    @ResponseSerializer(HttpStatus.OK, wageResponseMessage.DELETE_WAGE)
    @ApiOperation({ summary: 'Delete a wage' })
    @ApiResponse({ status: HttpStatus.OK, description: wageResponseMessage.DELETE_WAGE.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: wageResponseMessage.WAGE_NOT_FOUND.EN, type: SuccessResponseDto })
    async deleteWage(
        @Param() wageIdDto: WageIdDto,
    ) {
        try {
            return await this.wageService.deleteWage(wageIdDto);
        } catch (error) {
            throw error
        }
    }

}
