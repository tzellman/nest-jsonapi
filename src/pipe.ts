import { Inject, Injectable, PipeTransform, Scope } from '@nestjs/common';
import { JsonapiService } from './service';
import { JSONAPIDocument, ParsedJsonAPIResult } from 'transformalizer';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JSONAPI_MODULE_SERVICE } from './constants';

/**
 * This {@link PipeTransform} uses a {@link JsonapiService} to untransform the input payload
 */
@Injectable({ scope: Scope.REQUEST })
export class JsonapiPipe implements PipeTransform {
    constructor(
        @Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService,
        @Inject(REQUEST) private readonly request: Request
    ) {}

    public transform(value: JSONAPIDocument): ParsedJsonAPIResult | unknown {
        const untransformed = this.jsonapiService.untransform(value);

        const jsonapiRequestHolder = this.request.jsonapiRequestHolder;
        if (!jsonapiRequestHolder) {
            return untransformed;
        }

        // assertIsDefined(jsonapiRequestHolder.resource);
        const data = (untransformed ?? {})[jsonapiRequestHolder.resource];
        if (data && Array.isArray(data)) {
            if (jsonapiRequestHolder.untransformArray) {
                return data;
            }
            return data[0];
        }
        // return the originally untransformed result
        return untransformed;
    }
}
