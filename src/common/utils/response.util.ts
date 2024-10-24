import { errorResponseMessage } from "../constants";
import { ErrorResponse } from "../interfaces/error-response.interface";
import { SuccessResponse } from "../interfaces/success-response.interface";

export function createSuccessResponse<T>(status: number, data: T, message: object): SuccessResponse<T> {
    const responseJson: SuccessResponse = {
        statusCode: status,
        message: [message["EN"] ? message["EN"] : message],
        data: data || {},
    };
    return responseJson;
}

//TODO: delete this function if not used
export function createErrorResponse(statusCode: number, error: string, messageArray: string[]): ErrorResponse {
    const responseJson: ErrorResponse = {
        statusCode: statusCode,
        message: messageArray || [],
        error: error || errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
    };
    return responseJson;
}

export function fetchStatusCode(statusCode: number) {
    if (!statusCode) {
        return null;
    }
    const status = statusCode;
    return status;
}