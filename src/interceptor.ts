import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { JSONAPI_CONTENT_TYPE, JSONAPI_MODULE_SERVICE, METADATA_KEY_JSONAPI_PAYLOAD } from './constants';
import { ServerResponse } from 'http';
import { JsonapiService, TransformParams } from './service';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JsonapiPayloadOptions } from './payload-decorator';
import { JSONAPIDocument } from 'transformalizer';
import { Observable } from 'rxjs';
import { assertIsDefined } from './utils';

export const isJsonapiContentType = (contentType?: string): boolean =>
    (contentType || '').toLowerCase().indexOf(JSONAPI_CONTENT_TYPE.toLowerCase()) >= 0;

type ExpressOrFastifyRequest = ExpressRequest | FastifyRequest;

function checkIfRequestIsExpress(request: ExpressOrFastifyRequest): request is ExpressRequest {
    if (typeof (request as ExpressRequest)?.header === 'function') {
        return true;
    }

    return false;
}

@Injectable()
export class JsonapiInterceptor implements NestInterceptor {
    constructor(
        @Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService,
        private readonly reflector: Reflector
    ) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.getArgByIndex<ExpressRequest | FastifyRequest>(0);
        const response = context.getArgByIndex<ExpressRequest | FastifyRequest>(1);

        const isExpressRequest = checkIfRequestIsExpress(request);

        const payloadOptions = this.reflector.get<JsonapiPayloadOptions>(
            METADATA_KEY_JSONAPI_PAYLOAD,
            context.getHandler()
        );

        if (payloadOptions) {
            if (request.jsonapiRequestHolder) {
                request.jsonapiRequestHolder.set(payloadOptions);
            }
        }

        // only make jsonapi specific mofifications IFF the client sent the proper header
        let acceptHeader;

        if (isExpressRequest) {
            acceptHeader = request.header('accept');
        } else {
            acceptHeader = request.headers?.accept;
        }

        if (isJsonapiContentType(acceptHeader)) {
            if (isExpressRequest) {
                response.setHeader('content-type', JSONAPI_CONTENT_TYPE);
            } else {
                response.header('content-type', JSONAPI_CONTENT_TYPE);
            }

            const start = new Date().getTime();
            return next.handle().pipe(
                map((data) => {
                    let jsonapiDocument: JSONAPIDocument;
                    if (data) {
                        assertIsDefined(payloadOptions?.resource);
                        const params = {
                            resourceName: payloadOptions.resource,
                            options: { meta: {} }
                        } as TransformParams;
                        params.source = data;
                        if (Array.isArray(data)) {
                            params.options.meta = { count: data.length };
                        }
                        jsonapiDocument = this.jsonapiService.transform(params);
                    } else if (payloadOptions) {
                        // payload was marked as jsonapi, so we still return a valid document
                        jsonapiDocument = { jsonapi: { version: '1.0' } };
                    }

                    if (jsonapiDocument) {
                        if (!jsonapiDocument.meta) {
                            jsonapiDocument.meta = {};
                        }
                        jsonapiDocument.meta['completed-in'] = new Date().getTime() - start;
                        return jsonapiDocument;
                    }

                    // pass-through if not decorated and falsy data
                    return data;
                })
            );
        } else {
            // not a json-api request, so just move on
            return next.handle();
        }
    }
}
