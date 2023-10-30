import type { OpenAPIV3 } from 'openapi-types';

import type { NamedSchema, RawOperation } from '../../types';
import { capitalizeFirstLetter } from '../../utils';

export const collectRequestBodies = (operations: RawOperation[]) => {
  const schemas: NamedSchema[] = [];
  for (const operation of operations) {
    const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
    if (!requestBody) {
      continue;
    }
    const bodyContent =
      requestBody.content?.['application/x-www-form-urlencoded'] ||
      requestBody.content?.['multipart/form-data'] ||
      requestBody.content?.['application/json'];
    if (!bodyContent) {
      continue;
    }
    const schema = bodyContent.schema as NamedSchema;
    if (!schema) {
      continue;
    }
    if ('$ref' in schema) {
      continue;
    }
    schema.name = capitalizeFirstLetter(operation.operationId!) + 'Request';
    if (!schema.description) {
      schema.description = `Request body for operation ${operation.operationId}`;
    }
    schemas.push(schema);
  }
  return schemas;
};
