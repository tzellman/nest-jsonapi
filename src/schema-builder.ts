import { DocParams, Schema, SchemaData } from 'transformalizer';
import { SchemaDataBuilder } from './schema-data-builder';

export class SchemaBuilder<Resource = unknown> {
    public readonly dataBuilder: SchemaDataBuilder<Resource>;
    private readonly bindings: Schema = {};

    constructor(public readonly resourceName: string) {
        this.dataBuilder = new SchemaDataBuilder<Resource>(resourceName);
    }

    public build(): Schema {
        const schema: Schema = {};
        // defer to default bindings if nothing was provided
        schema.links = this.bindings.links ?? this._links.bind(this);
        schema.meta = this.bindings.meta ?? this._meta.bind(this);
        schema.data = this.bindings.data ?? this.dataBuilder.build();
        return schema;
    }

    public links(handler: (params: DocParams) => unknown): SchemaBuilder<Resource> {
        this.bindings.links = handler;
        return this;
    }

    public meta(handler: (params: DocParams) => unknown): SchemaBuilder<Resource> {
        this.bindings.meta = handler;
        return this;
    }

    public data(schemaData: SchemaData): SchemaBuilder<Resource> {
        this.bindings.data = schemaData;
        return this;
    }

    private _links(params: DocParams): unknown {
        return params.options.links;
    }

    private _meta(params: DocParams): unknown {
        return params.options.meta ?? {};
    }
}
