import { JsonapiPayloadOptions } from './payload-decorator';

export class JsonapiRequestHolder implements JsonapiPayloadOptions {
    private payloadOptions: JsonapiPayloadOptions | undefined;

    public get resource(): string | undefined {
        return this.payloadOptions?.resource;
    }

    public get untransformArray(): boolean {
        return !!this.payloadOptions?.untransformArray;
    }

    public get untransformIncluded(): boolean {
        return !!this.payloadOptions?.untransformIncluded;
    }

    public get nestIncluded(): boolean {
        return !!this.payloadOptions?.nestIncluded;
    }

    public get removeCircularDependencies(): boolean {
        return !!this.payloadOptions?.removeCircularDependencies;
    }

    public set({
        resource,
        untransformArray,
        untransformIncluded,
        nestIncluded,
        removeCircularDependencies
    }: JsonapiPayloadOptions): void {
        this.payloadOptions = {
            resource,
            untransformArray,
            untransformIncluded,
            nestIncluded,
            removeCircularDependencies
        };
    }
}
