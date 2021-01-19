# Contributing

New features and bugfixes are always welcome! In order to contribute to this project, follow a few easy steps:

1. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) this repository, clone it on your machine and run `npm install`
2. Create a topic branch `my-awesome-feature` and commit to it
3. Run `npm run test` and `npm run build` and verify that they complete without errors
4. Push `my-awesome-feature` branch to GitHub and open a [pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)

## Quickstart

```bash
# (optional) - use the same version of node as other developers
nvm use
# install the dependencies and git hooks
npm install
# this bootstraps the monorepo
npm run build
```

## Building

To build/compile the code:

```bash
npm run build
```

To rebuild when code changes (preferred method):

```bash
npm run build:watch
```

## Testing

To run all tests and perform static linting:

```bash
npm run test
```

To automatically rerun tests when code changes:

```bash
npm run test:watch
```

To run tests in debug mode:

```bash
npm run test:debug
```
