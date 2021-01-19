// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'transformalizer' {
    namespace createTransformalizer {
        const prototype: {};

        export interface JSONAPIDocument {
            data?: any;
            errors?: any;
            meta?: any;
            jsonapi?: any;
            links?: any;
            included?: any[];
        }

        export type KVObject<T = unknown> = Record<string, T>;

        export interface Options extends KVObject {
            includeFields?: string[];
        }

        export interface SerializeDataParams {
            source: unknown;
            options: Options;
            data: KVObject;
            included: unknown;
            type: unknown;
            state: unknown;
            id: unknown;
        }

        export interface DeserializeDataParams {
            options: unknown;
            resource: unknown;
            type: unknown;
            id: unknown;
            attributes: KVObject;
        }

        export interface SerializeRelationshipsDataParams extends SerializeDataParams {
            attributes: KVObject;
        }

        export type SerializeRelationshipsHandler = (params: SerializeRelationshipsDataParams) => KVObject | undefined;

        export interface SerializeMetaDataParams extends SerializeRelationshipsDataParams {
            relationships: unknown;
        }

        export interface DocParams {
            source: unknown;
            options: KVObject;
            data: unknown;
            included: unknown;
        }

        export interface SchemaData {
            relationships?: KVObject<SerializeRelationshipsHandler> | undefined;
            dataSchema?(params: SerializeDataParams): unknown;
            untransformDataSchema?(params: any): string;
            type?(params: SerializeDataParams): string;
            id?(params: SerializeDataParams): string;
            untransformId?(params: any): any;
            attributes?(params: SerializeDataParams): KVObject;
            untransformAttributes?(params: DeserializeDataParams): KVObject | undefined;
            links?(params: SerializeMetaDataParams): unknown;
            meta?(params: SerializeMetaDataParams): unknown;
        }

        export interface Schema {
            links?(params: DocParams): unknown;
            meta?(params: DocParams): unknown;
            data?: SchemaData;
        }

        export interface Transformer {
            name: string;
            schema: Schema;
            options?: KVObject;
        }

        export interface ParsedJsonAPIResult {
            [k: string]: unknown[];
        }

        export interface Transformalizer {
            register(transformer: Transformer): undefined;
            transform<T>(params: { name: string; source: T; options?: KVObject }): JSONAPIDocument;
            untransform(params: { document: JSONAPIDocument; options?: KVObject }): ParsedJsonAPIResult;
        }
    }

    function createTransformalizer(baseOptions?: any): createTransformalizer.Transformalizer;

    export = createTransformalizer;
}
