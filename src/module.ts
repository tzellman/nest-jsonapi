import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { JsonapiService } from './service';
import { JSONAPI_MODULE_OPTIONS, JSONAPI_MODULE_SERVICE } from './constants';

export interface JsonapiModuleOptions {
    mountPoint: string;
}

export interface JsonapiModuleOptionsFactory {
    createJsonapiModuleOptions(): Promise<JsonapiModuleOptions> | JsonapiModuleOptions;
}

export interface JsonapiModuleAsyncOptions {
    name?: string;
    useFactory?: (...args: unknown[]) => JsonapiModuleOptions | Promise<JsonapiModuleOptions>;
    inject?: Array<string | symbol>;
    imports?: Array<Type<unknown> | DynamicModule>;
    useClass?: Type<JsonapiModuleOptionsFactory>;
}

const createJsonapiProviders = (options: JsonapiModuleOptions): Provider[] => [
    {
        provide: JSONAPI_MODULE_OPTIONS,
        useValue: options
    },
    {
        provide: JSONAPI_MODULE_SERVICE,
        useFactory: (moduleOptions: JsonapiModuleOptions) => new JsonapiService({ url: moduleOptions.mountPoint }),
        inject: [JSONAPI_MODULE_OPTIONS]
    }
];

const createJsonapiAsyncProviders = (options: JsonapiModuleAsyncOptions): Provider[] => {
    const providers: Provider[] = [
        {
            provide: JSONAPI_MODULE_SERVICE,
            useFactory: (moduleOptions: JsonapiModuleOptions) => new JsonapiService({ url: moduleOptions.mountPoint }),
            inject: [JSONAPI_MODULE_OPTIONS]
        }
    ];

    const { useClass, useFactory } = options;
    if (useClass) {
        providers.push(
            ...[
                {
                    provide: JSONAPI_MODULE_OPTIONS,
                    useFactory: async (optionsFactory: JsonapiModuleOptionsFactory) =>
                        await optionsFactory.createJsonapiModuleOptions(),
                    inject: [useClass]
                },
                {
                    provide: useClass,
                    useClass
                }
            ]
        );
    }
    if (useFactory) {
        providers.push({
            provide: JSONAPI_MODULE_OPTIONS,
            useFactory,
            inject: options.inject ?? []
        });
    }

    return providers;
};

@Global()
@Module({})
export class JsonapiModule {
    public static forRoot(options: JsonapiModuleOptions): DynamicModule {
        return {
            module: JsonapiModule,
            providers: createJsonapiProviders(options),
            exports: [JSONAPI_MODULE_SERVICE]
        } as DynamicModule;
    }

    public static forRootAsync(options: JsonapiModuleAsyncOptions): DynamicModule {
        const providers = createJsonapiAsyncProviders(options);
        return {
            module: JsonapiModule,
            providers,
            exports: providers,
            imports: options.imports
        } as DynamicModule;
    }
}
