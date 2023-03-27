import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema } from '../../types';

/**
 * fix fax sending
 * https://jira.ringcentral.com/browse/PLD-1239
 * 1. should allow multiple attachments
 * 2. to parameters is an object instead of string
 * @param schemas
 * @returns
 */
export const fixFax = (schemas: NamedSchema[]): NamedSchema[] => {
  const createFaxMessageRequest = schemas.find((schema) => schema.name === 'CreateFaxMessageRequest')!;
  createFaxMessageRequest.required = ['attachments', 'to'];
  const props = createFaxMessageRequest.properties!;
  props.attachments = {
    type: 'array',
    items: { type: 'string', format: 'binary', description: 'File to upload' },
  };
  delete props.attachment;
  const toItem = (props.to as OpenAPIV3.ArraySchemaObject).items;
  (toItem as OpenAPIV3.ReferenceObject).$ref = '#/components/schemas/FaxReceiver';
  delete (toItem as OpenAPIV3.SchemaObject).type;
  schemas.push({
    name: 'FaxReceiver',
    type: 'object',
    description: 'Fax receiver',
    properties: {
      phoneNumber: {
        type: 'string',
        description: 'Phone number in E.164 format',
      },
      name: {
        type: 'string',
        description: 'Name of the receiver',
      },
    },
  });
  return schemas;
};
