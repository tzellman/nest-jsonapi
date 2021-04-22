import {
    DeserializeDataParams,
    SchemaData,
    SerializeDataParams,
    SerializeRelationshipsDataParams,
    SerializeRelationshipsHandler
} from 'transformalizer';
import { Dictionary } from './interfaces';
import { pick as pickFrom } from 'dot-object';
import { classToPlain } from 'class-transformer';
import { camelCase, isFunction, kebabCase, merge, omit, pick } from 'lodash';

const FIELD_ID = 'id';

export type ResourceLink = string | { href: string; meta?: Dictionary };
export interface ResourceLinks {
    [k: string]: ResourceLink;
}

export interface ResourceIdentifier<T = unknown> {
    data: T;
    name: string;
    included?: boolean;
    meta?: Dictionary;
}

export type ResourceLinkage = ResourceIdentifier | ResourceIdentifier[] | null | [];

export interface Relationship extends Dictionary {
    meta?: Dictionary;
    links?: ResourceLinks;
    data?: ResourceLinkage;
}

type SerializeHandler<T> = (params: SerializeDataParams) => T;
type DeserializeHandler<T> = (params: DeserializeDataParams) => T;

interface AllowDeny<T> {
    deny?: Array<keyof T>;
    allow?: Array<keyof T>;
}

export class SchemaDataBuilder<Resource = unknown> {
    private readonly bindings: SchemaData = {};

    constructor(private readonly resourceName: string) {}

    public static includeHasManyRelationship(
        params: SerializeRelationshipsDataParams,
        field: string,
        resource: string
    ): Relationship | undefined {
        const { data } = params;
        const relation = data[field];
        if (relation && Array.isArray(relation) && relation.length) {
            return {
                // @ts-ignore
                data: data[field].map((obj: unknown) => ({
                    name: resource,
                    data: obj,
                    included: true
                }))
            };
        }
        return undefined;
    }

    public static includeBelongsToRelationship(
        params: SerializeRelationshipsDataParams,
        field: string,
        resource: string,
        allowNull?: boolean
    ): Relationship | undefined {
        const { data } = params;
        if (data[field]) {
            return {
                data: {
                    name: resource,
                    data: data[field],
                    included: true
                }
            };
        }
        return allowNull ? { data: null } : undefined;
    }

    public static linkToBelongsToRelationship(
        params: SerializeRelationshipsDataParams,
        relatedIdPath: string,
        resource: string,
        linkMeta?: Dictionary
    ): Relationship | undefined {
        const { data } = params;
        const value = pickFrom(relatedIdPath, data) as string;

        const relatedUrl = [params.options.url, resource, value].join('/');
        const related: ResourceLink = linkMeta ? { href: relatedUrl, meta: linkMeta } : relatedUrl;

        if (value) {
            return {
                links: {
                    related
                },
                data: {
                    name: resource,
                    data: { id: value },
                    included: false
                }
            };
        }
        return undefined;
    }

    public static linkToHasManyRelationship(
        params: SerializeRelationshipsDataParams,
        parentResource: string,
        relatedResource: string,
        linkMeta?: Dictionary
    ): Relationship {
        const relatedUrl = [params.options.url, parentResource, params.data.id, relatedResource].join('/');
        const related: ResourceLink = linkMeta ? { href: relatedUrl, meta: linkMeta } : relatedUrl;
        return {
            links: {
                related
            }
        };
    }

    public static mergeRelationships(...relationships: Array<Relationship | undefined>): Relationship | undefined {
        const rels = relationships.filter((rel) => rel !== undefined);
        return rels.length ? merge({}, ...relationships) : undefined;
    }

    public build(): SchemaData {
        const schema: SchemaData = {};
        // defer to default bindings if nothing was provided
        schema.id = this.bindings.id ?? this._id.bind(this);
        schema.type = this.bindings.type ?? this._type.bind(this);
        schema.attributes = this.bindings.attributes ?? this._attributes().bind(this);
        schema.untransformAttributes = this.bindings.untransformAttributes ?? this._untransformAttributes().bind(this);
        schema.relationships = this.bindings.relationships ?? undefined;
        return schema;
    }

    public id(handler: SerializeHandler<string>): SchemaDataBuilder<Resource> {
        this.bindings.id = handler;
        return this;
    }

    public type(handler: SerializeHandler<string>): SchemaDataBuilder<Resource> {
        this.bindings.type = handler;
        return this;
    }

    public attributes(handler?: SerializeHandler<Dictionary> | AllowDeny<Resource>): SchemaDataBuilder<Resource> {
        if (isFunction(handler)) {
            this.bindings.attributes = handler as SerializeHandler<Dictionary>;
        } else {
            this.bindings.attributes = this._attributes(handler as AllowDeny<Resource>);
        }
        return this;
    }

    public untransformAttributes(
        handler?: DeserializeHandler<Dictionary> | AllowDeny<Resource>
    ): SchemaDataBuilder<Resource> {
        if (isFunction(handler)) {
            this.bindings.untransformAttributes = handler as DeserializeHandler<Dictionary>;
        } else {
            this.bindings.untransformAttributes = this._untransformAttributes(handler as AllowDeny<Resource>);
        }

        return this;
    }

    public relationships(relationships: Dictionary<SerializeRelationshipsHandler>): SchemaDataBuilder<Resource> {
        this.bindings.relationships = relationships;
        return this;
    }

    private _id(params: SerializeDataParams): string {
        const { data } = params;
        return `${data.id}`;
    }

    private _type(): string {
        return this.resourceName;
    }

    private _attributes(options?: {
        deny?: Array<keyof Resource>;
        allow?: Array<keyof Resource>;
    }): (params: SerializeDataParams) => Dictionary {
        return (params): Dictionary => {
            let data = params.data;
            // this is here to support sequelize... might want to consider a different strategy at some point
            if (isFunction(data.toJSON)) {
                // @ts-ignore
                data = data.toJSON();
            } else if (Object.prototype.hasOwnProperty.call(data, 'dataValues')) {
                data = data.dataValues as Record<string, unknown>;
            }

            // literal object, we are making the assumption that params.data
            // is a singular resource, not a collection
            let attributes = classToPlain(data, { enableCircularCheck: true }) as Dictionary;

            if (options?.allow && options.allow.length > 0) {
                attributes = pick(attributes, options.allow);
            }
            if (options?.deny && options.deny.length > 0) {
                attributes = omit(attributes, options.deny);
            }
            return Object.keys(attributes)
                .filter((key) => key !== FIELD_ID)
                .reduce((obj: Dictionary, key: string) => {
                    obj[kebabCase(key)] = attributes[key];
                    return obj;
                }, {});
        };
    }

    private _untransformAttributes(options?: {
        deny?: Array<keyof Resource>;
        allow?: Array<keyof Resource>;
    }): (params: DeserializeDataParams) => Dictionary {
        return (params): Dictionary => {
            const { attributes } = params;
            return Object.keys(attributes ?? {})
                .map((k) => [camelCase(k), attributes[k]])
                .filter(([k]) => !options || !options.allow || options.allow.includes(k as keyof Resource))
                .filter(([k]) => !options || !options.deny || !options.deny.includes(k as keyof Resource))
                .reduce((obj, [key, val]) => {
                    if (val !== undefined) {
                        obj[key] = val;
                    }
                    return obj;
                }, {});
        };
    }
}
