import { Injectable } from '@nestjs/common';
import * as transformalizerFactory from 'transformalizer';
import {
    Transformalizer,
    JSONAPIDocument,
    ParsedJsonAPIResult,
    Schema,
    SerializeRelationshipsDataParams
} from 'transformalizer';
import { Dictionary } from './interfaces';
import { ResourceLinks } from './schema-data-builder';

export { Schema, SerializeRelationshipsDataParams, JSONAPIDocument };

export interface Options extends Dictionary {
    meta?: Dictionary;
    links?: ResourceLinks;
}

export interface JsonapiTransformer {
    readonly name: string;
    readonly options?: Dictionary;
    readonly schema: Schema;
    // optional function that can help determine if an object can
    // be transformed to type `name`
    // if not provided, you must explicitly decorate controller
    // methods with @JsonapiPayload
    canTransform?: <T>(data: T) => boolean;
}

export interface TransformParams {
    source: unknown;
    resourceName?: string;
    options?: Options;
}

@Injectable()
export class JsonapiService {
    private readonly transformalizer: Transformalizer;
    private readonly transformers: JsonapiTransformer[] = [];

    // TODO provide actual interface for options
    constructor(options?: Dictionary) {
        this.transformalizer = transformalizerFactory(options);
    }

    public register(transformer: JsonapiTransformer): JsonapiService {
        const { name, schema, options } = transformer;
        this.transformalizer.register({ name, schema, options });
        this.transformers.push(transformer);
        return this;
    }

    public transform(params: TransformParams): JSONAPIDocument {
        const { source, resourceName, options } = params;
        let resource = resourceName;
        if (!resource) {
            for (const transformer of this.transformers) {
                if (!resource && transformer.canTransform && transformer.canTransform(source)) {
                    resource = transformer.name;
                    break;
                }
            }
        }
        if (resource) {
            return this.transformalizer.transform({ name: resource, source, options });
        }
        throw new Error(`No transformer is registered to handle the given input`);
    }

    public untransform(document: JSONAPIDocument, options?: Dictionary): ParsedJsonAPIResult {
        return this.transformalizer.untransform({ document, options });
    }
}
