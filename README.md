# OpenAPI Parser

Parse OpenAPI spec to JavaScript objects. And the objects could be used for code
generation.

This project will be used to generate code for the following projects:

- [RingCentral.Net SDK](https://github.com/ringcentral/RingCentral.Net)
- [RingCentral Extensible SDK for JavaScript](https://github.com/ringcentral/RingCentral-extensible)
- [RingCentral Java SDK](https://github.com/ringcentral/ringcentral-java)

## How

```
yarn test
```

Update the version in `package.json`.

```
npm publish
```

Parsed content is in [./parsed.json](./parsed.json) file.
