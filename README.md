[![NPM][npm-badge-img]][npm-badge-link]
[![Build Status][build-status-img]][build-status-link]
[![Download count][npm-downloads-img]][npm-badge-link]

<p align="center">
  <a href="http://nestjs.com"><img src="https://nestjs.com/img/logo_text.svg" alt="Nest Logo" width="320" /></a>
</p>

<p align="center">
  A <a href="https://github.com/nestjs/nest">Nest</a> module that provides <a href="https://jsonapi.org/">JSONAPI</a> integration.
</p>

## Installation

```bash
npm install --save nest-jsonapi
```

## Usage

Import the `JsonapiModule` into the root `AppModule` and use the `forRoot()` method to configure it:

```typescript
import { JsonapiModule } from "nest-jsonapi";

@Module({
    imports: [
        JsonapiModule.forRoot({
            // options
        }),
    ],
})
export class AppModule {}
```

Inject `JsonapiService`:

```typescript
import { JsonapiService, JSONAPI_MODULE_SERVICE } from "nest-jsonapi";

@Controller("photos")
export class PhotosController {
    constructor(@Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService) {}
}
```

Note that `JsonapiModule` is a global module, therefore it will be available in all modules.

### Middleware

If you plan on using the `JsonapiPayload` decorator (more info below), you must use the `JsonapiMiddleware` in your application. This does 2 things:

1. enable parsing jsonapi content as JSON
2. creates a request-scoped holder for tracking metadata

e.g.

```typescript
export class AppModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(JsonapiMiddleware).forRoutes(PhotosController);
    }
}
```

### Interceptor

The `JsonapiInterceptor` is used to properly transform your controller result data to JSONAPI. You can decorate at a class or method level:

```typescript
@UseInterceptors(JsonapiInterceptor)
@Controller("photos")
export default class PhotosController {}
```

### Payload Metadata

In order for the `JsonapiInterceptor` to know _how_ to transform your data, you need to decorate your methods.

```typescript
@JsonapiPayload({ resource: RESOURCE_PHOTOS })
@Get()
public async findPhotos(@Query() query: FindOptions): Promise<Photo[]>
```

### Exception Filter

In order to support error responses compliant with the JSONAPI specification, the `JsonapiExceptionFilter` exists.

```typescript
const { httpAdapter } = app.get(HttpAdapterHost);
app.useGlobalFilters(new JsonapiExceptionFilter(httpAdapter));
```

### Schema Registration

The `JsonapiService` requires schemas for the resources it is going to handle. You have control of how that is configured, by defining a schematic. We provide a thin wrapper around the `transformalizer` library.

Typically you will want to register your schemas on module initialization.

```typescript
export class AppModule implements OnModuleInit {
    constructor(@Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService) {}

    public async onModuleInit(): Promise<void> {
        const photoBuilder = new SchemaBuilder<Photo>(RESOURCE_PHOTOS);
        photoBuilder.dataBuilder.untransformAttributes({ deny: ["createdAt", "updatedAt"] });
        this.jsonapiService.register(photoBuilder);
    }
}
```

## Reference Example

[nest-jsonapi-example](https://github.com/tzellman/nest-jsonapi-example) is an example project that demonstrates the usage of this module. Since not all aspects of the module have been fully tested yet (coming soon!), I highly suggest checking this out!

## API Docs

For detailed API information please visit the [API documentation](https://tzellman.github.io/nest-jsonapi/index.html).

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).

[npm-badge-img]: https://badge.fury.io/js/nest-jsonapi.svg
[npm-badge-link]: http://badge.fury.io/js/nest-jsonapi
[build-status-img]: https://github.com/tzellman/nest-jsonapi/workflows/Node.js%20CI/badge.svg?branch=master&event=push
[build-status-link]: https://github.com/tzellman/nest-jsonapi/actions/workflows/node.js.yml
[npm-downloads-img]: https://img.shields.io/npm/dt/nest-jsonapi.svg
