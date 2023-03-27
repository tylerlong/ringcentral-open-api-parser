import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema, RawOperation } from '../../types';
import { capitalizeFirstLetter } from '../../utils';

export const collectForms = (operations: RawOperation[]) => {
  const schemas: NamedSchema[] = [];
  for (const operation of operations) {
    const requestBody = operation.requestBody as OpenAPIV3.RequestBodyObject;
    if (!requestBody) {
      continue;
    }
    const form =
      requestBody.content?.['application/x-www-form-urlencoded'] || requestBody.content?.['multipart/form-data'];
    if (!form) {
      continue;
    }
    const schema = form.schema as NamedSchema;
    if (!schema) {
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
