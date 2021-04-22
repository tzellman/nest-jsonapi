import { Injectable } from '@nestjs/common';
import * as transformalizerFactory from 'transformalizer';
import {
    JSONAPIDocument,
    ParsedJsonAPIResult,
    Schema,
    SerializeRelationshipsDataParams,
    Transformalizer
} from 'transformalizer';
import { Dictionary } from './interfaces';
import { ResourceLinks } from './schema-data-builder';
import { SchemaBuilder } from './schema-builder';

export { Schema, SerializeRelationshipsDataParams, JSONAPIDocument };

export interface Options extends Dictionary {
    meta?: Dictionary;
    links?: ResourceLinks;
}

export interface JsonapiTransformer {
    readonly name: string;
    readonly options?: Dictionary;
    readonly schema: Schema;
}

const isTransformer = (obj: JsonapiTransformer | unknown): obj is JsonapiTransformer =>
    !!(obj as JsonapiTransformer).schema;

export interface TransformParams {
    source: unknown;
    resourceName: string;
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

    public register(transformerOrBuilder: JsonapiTransformer | SchemaBuilder): JsonapiService {
        let transformer: JsonapiTransformer;
        if (isTransformer(transformerOrBuilder)) {
            transformer = transformerOrBuilder;
        } else {
            transformer = { name: transformerOrBuilder.resourceName, schema: transformerOrBuilder.build() };
        }
        const { name, schema, options } = transformer;
        this.transformalizer.register({ name, schema, options });
        this.transformers.push(transformer);
        return this;
    }

    public transform(params: TransformParams): JSONAPIDocument {
        const { source, resourceName, options } = params;
        return this.transformalizer.transform({ name: resourceName, source, options });
    }

    public untransform(document: JSONAPIDocument, options?: Dictionary): ParsedJsonAPIResult {
        return this.transformalizer.untransform({ document, options });
    }
}
