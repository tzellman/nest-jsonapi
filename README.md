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

## Reference Example

[nest-jsonapi-example](https://github.com/tzellman/nest-jsonapi-example) is an example project that demonstrates the usage of this module. Since not all aspects of the module have been fully tested yet (coming soon!), I highly suggest checking this out!

## Quick Start

Import the `JsonapiModule` into the root `AppModule` and use the `forRoot()` method to configure it:

```typescript
import { Module } from "@nestjs/common";
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

Afterward, the `JsonapiService` instance will be available to inject across entire project using the service token `JSONAPI_MODULE_SERVICE`:

```typescript
import { Controller, Inject } from "@nestjs/common";
import { JsonapiService, JSONAPI_MODULE_SERVICE } from "nest-jsonapi";

@Controller("photos")
export class PhotosController {
    constructor(@Inject(JSONAPI_MODULE_SERVICE) private readonly jsonapiService: JsonapiService) {}
}
```

Note that `JsonapiModule` is a global module, therefore it will be available in all modules.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
