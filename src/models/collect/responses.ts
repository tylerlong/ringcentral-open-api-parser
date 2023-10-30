import type { OpenAPIV3 } from 'openapi-types';

import type { NamedSchema } from '../../types';
import { capitalizeFirstLetter } from '../../utils';

export const collectResponses = (doc: OpenAPIV3.Document) => {
  const schemas: NamedSchema[] = [];
  Object.values(doc.paths).forEach((pathContent) => {
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      if (!(method in pathContent!)) {
        continue;
      }
      for (const response of Object.values(pathContent![method].responses) as OpenAPIV3.OperationObject[]) {
        if (!('content' in response)) {
          continue;
        }
        const responseContent = response.content!;
        if (responseContent['application/json']?.schema) {
          const schema = responseContent['application/json'].schema!;
          const multi = schema.allOf ?? schema.anyOf ?? schema.oneOf;
          if (multi) {
            const name = `${capitalizeFirstLetter(pathContent![method].operationId!)}Response`;
            schema.$ref = `#/components/schemas/${name}`;
            schemas.push({ ...schema, name });
            delete schema.allOf;
            delete schema.anyOf;
            delete schema.oneOf;
          }
        }
      }
    }
  });
  return schemas;
};
