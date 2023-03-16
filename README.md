# OpenAPI Parser

Parse OpenAPI spec to JavaScript objects. And the objects could be used for code generation.

This project will be used to generate code for the following projects:

- [RingCentral.Net SDK](https://github.com/ringcentral/RingCentral.Net)
- [RingCentral Extensible SDK for JavaScript](https://github.com/ringcentral/RingCentral-extensible)
- [RingCentral Java SDK](https://github.com/ringcentral/ringcentral-java)

## How

```
yarn test
```

Update version in `package.json`.

```
npm publish
```

Parsed content is in [./src/parsed.json](./src/parsed.json) file.

## Debug mode

`process.env.API_PARSER_DEBUG === 'true` to enable debug mode

## Todo

- Support anyOf
- Support oneOf
