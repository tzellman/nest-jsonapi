### [0.6.0](https://github.com/tzellman/nest-jsonapi/compare/v0.5.1...v0.6.0) (2022-01-06)

#### Changes

-   Updated nest monorepo devDependency to 8.2+
-   Updated several dependencies to latest versions
-   Fixed package.json dependency issues (missing/mis-configured)
-   Set `noImplicitAny` and `strictNullChecks` to true in tsconfig.json + related changes

### [0.5.1](https://github.com/tzellman/nest-jsonapi/compare/v0.5.0...v0.5.1) (2021-11-01)

#### Changes

-   Fixed `includeHasManyRelationship` to include empty array relationships [#95](https://github.com/tzellman/nest-jsonapi/pull/95)

### [0.5.0](https://github.com/tzellman/nest-jsonapi/compare/v0.4.0...v0.5.0) (2021-10-28)

#### Changes

-   Updated several dependencies to latest versions, including TypeScript 4.4.x
-   Updated nest monorepo versions to 8.x
-   Fixed linting issues after updates [#90](https://github.com/tzellman/nest-jsonapi/pull/90)

### [0.4.0](https://github.com/tzellman/nest-jsonapi/compare/v0.3.0...v0.4.0) (2021-07-17)

#### Changes

-   Support untransform options via `@JsonapiPayload` decorator [#73](https://github.com/tzellman/nest-jsonapi/pull/73)
-   Allow full untransformed payload via `@JsonapiPipe` [#73](https://github.com/tzellman/nest-jsonapi/pull/73)

### [0.3.0](https://github.com/tzellman/nest-jsonapi/compare/v0.2.0...v0.3.0) (2021-07-14)

#### Changes

-   Support non-included relationships [#72](https://github.com/tzellman/nest-jsonapi/pull/72)
-   update dependencies

### [0.2.0](https://github.com/tzellman/nest-jsonapi/compare/v0.1.1...v0.2.0) (2021-04-21)

#### Changes

-   Support valid documents on empty payloads [#41](https://github.com/tzellman/nest-jsonapi/pull/41)
-   Simplify registration API [#40](https://github.com/tzellman/nest-jsonapi/pull/40)
-   update dependencies

### [0.1.1](https://github.com/tzellman/nest-jsonapi/compare/v0.1.0...v0.1.1) (2021-02-05)

### Bug Fixes

-   add type guard check for
    HTTPException ([4169064](https://github.com/tzellman/nest-jsonapi/commit/4169064d33ed395de9009f4ff737b40b2a724eb8))

### 0.1.0 (2021-01-19)

-   Initial release! 🎉
