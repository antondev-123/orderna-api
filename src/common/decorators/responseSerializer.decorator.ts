import { UseInterceptors } from "@nestjs/common";
import { ClassConstructor } from "class-transformer";
import { ResponseInterceptor } from "../interceptors/response.interceptor";

/**
 * A decorator function that applies a response interceptor to the route handler.
 *
 * @param {number} statusCode - The HTTP status code to be returned in the response.
 * @param {any} message - The message to be included in the response body.
 * @param {any} data - The data to be included in the response body.
 * @returns {MethodDecorator & ClassDecorator} - A decorator that applies the response interceptor.
 */
export function ResponseSerializer(statusCode: number, message: any, data?: ClassConstructor<any>): MethodDecorator & ClassDecorator {
    return UseInterceptors(new ResponseInterceptor(statusCode, message, data));
}