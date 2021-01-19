import {
    JsonapiService,
    JsonapiModule,
    JsonapiModuleOptionsFactory,
    JsonapiModuleOptions,
    JSONAPI_MODULE_SERVICE
} from '../src';
import { Test, TestingModule } from '@nestjs/testing';

describe('jsonapi module', () => {
    const expectService = (module: TestingModule) => {
        expect(module).toBeDefined();
        expect(module.get<JsonapiService>(JSONAPI_MODULE_SERVICE)).toBeDefined();
    };

    it('can create sync module', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [JsonapiModule.forRoot({ mountPoint: '/api' })]
        }).compile();
        expectService(moduleRef);
    });

    it('can create async module w/factory', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                JsonapiModule.forRootAsync({
                    useFactory: () => ({
                        mountPoint: '/api'
                    })
                })
            ]
        }).compile();
        expectService(moduleRef);
    });

    it('can create async module w/sync class', async () => {
        class Factory implements JsonapiModuleOptionsFactory {
            public createJsonapiModuleOptions(): JsonapiModuleOptions {
                return { mountPoint: '/api' };
            }
        }

        const moduleRef = await Test.createTestingModule({
            imports: [
                JsonapiModule.forRootAsync({
                    useClass: Factory
                })
            ]
        }).compile();
        expectService(moduleRef);
    });

    it('can create async module w/async class', async () => {
        class Factory implements JsonapiModuleOptionsFactory {
            public createJsonapiModuleOptions(): Promise<JsonapiModuleOptions> {
                return Promise.resolve({ mountPoint: '/api' });
            }
        }

        const moduleRef = await Test.createTestingModule({
            imports: [
                JsonapiModule.forRootAsync({
                    useClass: Factory
                })
            ]
        }).compile();
        expectService(moduleRef);
    });
});
