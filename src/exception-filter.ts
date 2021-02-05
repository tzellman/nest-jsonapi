import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger, HttpServer } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';
import { isJsonapiContentType } from './interceptor';
import { JSONAPI_CONTENT_TYPE } from './constants';

interface ValidationErrorResponse {
    message: string | string[];
    statusCode: number;
    error?: string;
}

export const isHTTPException = (error: HttpException | unknown): error is HttpException => {
    const httpException = error as HttpException;
    return (
        httpException.getStatus !== undefined &&
        httpException.getResponse !== undefined &&
        Object.prototype.hasOwnProperty.call(httpException, 'message')
    );
};

@Catch()
export class JsonapiExceptionFilter extends BaseExceptionFilter {
    private readonly logger: Logger;

    constructor(applicationRef?: HttpServer) {
        super(applicationRef);
        this.logger = new Logger(JsonapiExceptionFilter.name);
    }

    public catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // log exceptions so that the stack trace can be viewed
        if (exception instanceof Error) {
            this.logger.error(exception.message, undefined, exception.stack);
        } else {
            this.logger.error(exception);
        }

        if (isJsonapiContentType(request.header('accept'))) {
            let status = HttpStatus.INTERNAL_SERVER_ERROR;
            let title = 'Server Error';
            let detail;

            if (isHTTPException(exception)) {
                status = exception.getStatus();
                const errorResponse = exception.getResponse();
                title = exception.message;

                if (errorResponse) {
                    if (typeof errorResponse === 'string') {
                        detail = errorResponse;
                    } else {
                        const validationResponse = errorResponse as ValidationErrorResponse;
                        if (validationResponse.error) {
                            title = validationResponse.error;
                        }
                        if (validationResponse.message) {
                            if (Array.isArray(validationResponse.message)) {
                                detail = validationResponse.message.join(', ');
                            } else {
                                detail = validationResponse.message;
                            }
                        }
                    }
                }
            }

            const errorBody = {
                status: `${status}`,
                title,
                detail,
                timestamp: new Date().toISOString(),
                path: request.url
            };
            response
                .header('content-type', JSONAPI_CONTENT_TYPE)
                .status(status)
                .json({
                    errors: [errorBody]
                })
                .end();
        } else {
            super.catch(exception, host);
        }
    }
}
