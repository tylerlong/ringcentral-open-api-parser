import { OpenAPIV3 } from 'openapi-types';

/**
 * fix creation of greeting
 * https://git.ringcentral.com/platform/api-metadata-specs/issues/48
 * https://jira.ringcentral.com/browse/PLD-1240
 * @param doc the OpenAPI document
 */
export const fixGreeting = (doc: OpenAPIV3.Document) => {
  for (const endpoint of [
    '/restapi/v1.0/account/{accountId}/greeting',
    '/restapi/v1.0/account/{accountId}/extension/{extensionId}/greeting',
  ]) {
    const requestBody = doc.paths[endpoint]!.post!.requestBody as OpenAPIV3.RequestBodyObject;
    const props = (requestBody.content['multipart/form-data'].schema as OpenAPIV3.SchemaObject).properties!;
    delete props.answeringRuleId;
    props.answeringRule = {
      $ref: '#/components/schemas/GreetingAnsweringRuleId',
    };
  }
  doc.components!.schemas!.GreetingAnsweringRuleId = {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  };
};
