import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { METADATA_KEY_JSONAPI_PAYLOAD } from './constants';

export interface JsonapiPayloadOptions {
    resource: string;
    untransformArray?: boolean;
}

export const JsonapiPayload = (options: JsonapiPayloadOptions): CustomDecorator =>
    SetMetadata(METADATA_KEY_JSONAPI_PAYLOAD, options);
