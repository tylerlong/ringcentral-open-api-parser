import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema } from '../../types';

export const collectSchemas = (doc: OpenAPIV3.Document) => {
  const schemas: NamedSchema[] = [];
  for (const [key, val] of Object.entries(doc.components!.schemas!)) {
    const temp = val as NamedSchema;
    temp.name = key;
    schemas.push(temp);
  }
  return schemas;
};
