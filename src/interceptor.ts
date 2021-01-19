import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { JSONAPI_CONTENT_TYPE, JSONAPI_MODULE_SERVICE, METADATA_KEY_JSONAPI_PAYLOAD } from './constants';
import { ServerResponse } from 'http';
import { JsonapiService, TransformParams } from './service';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JsonapiPayloadOptions } from './payload-decorator';
import { JSONAPIDocument } from 'transformalizer';
import { Observable } from 'rxjs';

export const isJsonapiContentType = (contentType?: string): boolean =>
    (contentType || '').toLowerCase().indexOf(JSONAPI_CONTENT_TYPE.toLowerCase()) >= 0;

@Injectable()
export class JsonapiInterceptor implements NestInterceptor {
    constructor(
        @Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService,
        private readonly reflector: Reflector
    ) {}

    public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.getArgByIndex<Request>(0);
        const response = context.getArgByIndex<ServerResponse>(1);

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
        if (isJsonapiContentType(request.header('accept'))) {
            response.setHeader('content-type', JSONAPI_CONTENT_TYPE);
            const start = new Date().getTime();
            return next.handle().pipe(
                map((data) => {
                    if (data) {
                        const params = {
                            resourceName: payloadOptions?.resource,
                            options: { meta: {} }
                        } as TransformParams;
                        params.source = data;
                        if (Array.isArray(data)) {
                            params.options.meta = { count: data.length };
                        }
                        const jsonapiDocument: JSONAPIDocument = this.jsonapiService.transform(params);
                        // add the completed-in meta
                        if (!jsonapiDocument.meta) {
                            jsonapiDocument.meta = {};
                        }
                        jsonapiDocument.meta['completed-in'] = new Date().getTime() - start;
                        return jsonapiDocument;
                    }
                    return data;
                })
            );
        } else {
            // not a json-api request, so just move on
            return next.handle();
        }
    }
}
