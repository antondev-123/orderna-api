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
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import {
	consumers,
	errorResponseMessage,
	swaggerConstant,
	urlsConstant,
} from "src/common/constants";
import { modifierGroupsResponseMessage } from "src/common/constants/response-messages/modifier-groups.response-message";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CreateModifierGroupDto } from "./dtos/create-modifier-groups.dto";
import { ListModifierGroupDto } from "./dtos/list-modifier-groups.dto";
import { ModifierGroupsIdDto } from "./dtos/params-modifier-groups.dto";
import { EditModifierGroupDto } from "./dtos/update-modifier-groups.dto";
import { ModifierGroupService } from "./modifier-groups.service";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_MODIFIER)
@ApiTags("Modifiers")
@ApiResponse({
	status: HttpStatus.INTERNAL_SERVER_ERROR,
	description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.UNPROCESSABLE_ENTITY,
	description: errorResponseMessage.UNPROCESSABLE_ENTITY.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.UNAUTHORIZED,
	description: errorResponseMessage.UNAUTHORIZED.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.BAD_REQUEST,
	description: errorResponseMessage.BAD_REQUEST.EN,
	type: ErrorResponseDto,
})
export class ModifierGroupController {
	constructor(private modifierGroupService: ModifierGroupService) { }

	@Post()
	@ResponseSerializer(
		HttpStatus.CREATED,
		modifierGroupsResponseMessage.ADD_MODIFIER,
	)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: "Create new modifier group" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: modifierGroupsResponseMessage.ADD_MODIFIER.EN,
		type: SuccessResponseDto,
	})
	async addModifier(@Body() createModifierGroupDto: CreateModifierGroupDto) {
		try {
			return await this.modifierGroupService.addModifier(
				createModifierGroupDto,
			);
		} catch (error) {
			throw error;
		}
	}

	@Put(urlsConstant.API_UPDATE_MODIFIER)
	@ResponseSerializer(
		HttpStatus.OK,
		modifierGroupsResponseMessage.UPDATE_MODIFIER,
	)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: "Edit an existing modifier group" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: modifierGroupsResponseMessage.UPDATE_MODIFIER.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Modifier, category, option or product not found.",
		type: ErrorResponseDto,
	})
	async updateModifier(
		@Param() modifierGroupsIdDto: ModifierGroupsIdDto,
		@Body() editModifierGroupDto: EditModifierGroupDto,
	) {
		try {
			return await this.modifierGroupService.updateModifier(
				modifierGroupsIdDto,
				editModifierGroupDto,
			);
		} catch (error) {
			throw error;
		}
	}

	@Delete(urlsConstant.API_DELETE_MODIFIER)
	@ResponseSerializer(
		HttpStatus.OK,
		modifierGroupsResponseMessage.DELETE_MODIFIER,
	)
	@ApiOperation({ summary: "Delete a modifier" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: modifierGroupsResponseMessage.DELETE_MODIFIER.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: modifierGroupsResponseMessage.MODIFIER_NOT_FOUND.EN,
		type: SuccessResponseDto,
	})
	async deleteModifier(@Param() modifierGroupsIdDto: ModifierGroupsIdDto) {
		try {
			return await this.modifierGroupService.deleteModifier(
				modifierGroupsIdDto,
			);
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@ResponseSerializer(
		HttpStatus.OK,
		modifierGroupsResponseMessage.GET_MODIFIER_LIST,
	)
	@ApiOperation({ summary: "Get modifier list" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: modifierGroupsResponseMessage.GET_MODIFIER_LIST.EN,
		type: SuccessResponseDto,
	})
	async getModifierGroupList(@Query() paginationDto: ListModifierGroupDto) {
		try {
			return await this.modifierGroupService.getModifierGroupList(
				paginationDto,
			);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_MODIFIER)
	@ResponseSerializer(
		HttpStatus.OK,
		modifierGroupsResponseMessage.GET_MODIFIER_DETAILS,
	)
	@ApiOperation({ summary: "Get modifier details" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: modifierGroupsResponseMessage.GET_MODIFIER_LIST.EN,
		type: SuccessResponseDto,
	})
	async getModifierGroupById(@Param() modifierGroupsIdDto: ModifierGroupsIdDto) {
		try {
			return await this.modifierGroupService.getModifierGroupById(
				modifierGroupsIdDto,
			);
		} catch (error) {
			throw error;
		}
	}
}
