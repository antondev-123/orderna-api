import { Body, Controller, Delete, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { errorResponseMessage, urlsConstant } from 'src/common/constants';
import { breakResponseMessage } from 'src/common/constants/response-messages/break.response-message';
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { ResponseSerializer } from 'src/common/decorators/responseSerializer.decorator';
import { ErrorResponseDto } from 'src/common/dtos/error-response.dto';
import { SuccessResponseDto } from 'src/common/dtos/success-response.dto';
import { BreakService } from './break.service';
import { CreateBreakDto } from './dtos/create-break.dto';
import { EditBreakDto } from './dtos/edit-break.dto';
import { BreakIdDto } from './dtos/params-break.dto';

@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
@UseGuards(AuthGuard)
@Controller(urlsConstant.ROUTE_PREFIX_BREAK)
@ApiTags("Breaks")
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

export class BreakController {
    constructor(
        private readonly breakService: BreakService
    ) { }

    @Post()
    @ResponseSerializer(HttpStatus.CREATED, breakResponseMessage.ADD_BREAK)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Create a new break' })
    @ApiResponse({ status: HttpStatus.CREATED, description: breakResponseMessage.ADD_BREAK.EN, type: SuccessResponseDto })
    async addBreak(
        @Body() createBreakDto: CreateBreakDto,
    ) {
        try {
            return await this.breakService.addBreak(createBreakDto);
        } catch (error) {
            throw error
        }
    }

    @Put(urlsConstant.API_UPDATE_BREAK)
    @ResponseSerializer(HttpStatus.OK, breakResponseMessage.UPDATE_BREAK)
    @ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
    @ApiOperation({ summary: 'Edit a break' })
    @ApiResponse({ status: HttpStatus.OK, description: breakResponseMessage.UPDATE_BREAK.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: breakResponseMessage.BREAK_NOT_FOUND.EN, type: ErrorResponseDto })
    async editBreak(
        @Param() breakIdDto: BreakIdDto,
        @Body() editBreakDto: EditBreakDto,
    ) {
        try {
            return await this.breakService.editBreak(breakIdDto, editBreakDto,);
        } catch (error) {
            throw error
        }
    }

    @Delete(urlsConstant.API_DELETE_BREAK)
    @ResponseSerializer(HttpStatus.OK, breakResponseMessage.DELETE_BREAK)
    @ApiOperation({ summary: 'Delete a wage' })
    @ApiResponse({ status: HttpStatus.OK, description: breakResponseMessage.DELETE_BREAK.EN, type: SuccessResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: breakResponseMessage.BREAK_NOT_FOUND.EN, type: ErrorResponseDto })
    async deleteBreak(
        @Param() breakIdDto: BreakIdDto,
    ) {
        try {
            return await this.breakService.deleteBreak(breakIdDto);
        } catch (error) {
            throw error
        }
    }

}
