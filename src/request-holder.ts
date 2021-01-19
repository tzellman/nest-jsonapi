import { JsonapiPayloadOptions } from './payload-decorator';

export class JsonapiRequestHolder {
    private payloadOptions: JsonapiPayloadOptions | undefined;

    public set({ resource, untransformArray }: JsonapiPayloadOptions): void {
        this.payloadOptions = { resource, untransformArray };
    }

    public get resource(): string | undefined {
        return this.payloadOptions?.resource;
    }

    public get untransformArray(): boolean {
        return !!this.payloadOptions?.untransformArray;
    }
}
