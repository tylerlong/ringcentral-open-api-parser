import { OpenAPIV3 } from 'openapi-types';

/**
 * fix fax sending
 * https://jira.ringcentral.com/browse/PLD-1239
 * 1. should allow multiple attachments
 * 2. to parameters is an object instead of string
 * @param doc the OpenAPI document
 */
export const fixFax = (doc: OpenAPIV3.Document) => {
  const requstBody = doc.paths['/restapi/v1.0/account/{accountId}/extension/{extensionId}/fax']!.post!
    .requestBody as OpenAPIV3.RequestBodyObject;
  const requestSchema = requstBody.content['multipart/form-data'].schema as OpenAPIV3.SchemaObject;
  const sendFaxProps = requestSchema.properties!;

  // fix attachments
  requestSchema.required = ['attachments', 'to'];
  sendFaxProps.attachments = {
    type: 'array',
    items: { type: 'string', format: 'binary' },
  };
  delete sendFaxProps.attachment;

  // fix "to"
  const faxTo = sendFaxProps.to as OpenAPIV3.ArraySchemaObject;
  delete (faxTo.items as OpenAPIV3.SchemaObject).type;
  (faxTo.items as OpenAPIV3.ReferenceObject).$ref = '#/components/schemas/FaxCallee';
  doc.components!.schemas!.FaxCallee = {
    type: 'object',
    properties: {
      phoneNumber: {
        type: 'string',
        description: 'Phone number in E.164 format',
      },
      name: {
        type: 'string',
        description: 'Name of the callee',
      },
    },
  };
};
