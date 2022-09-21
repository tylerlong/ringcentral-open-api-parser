// This file is copied from the consolidate-api-specs project
// Adjust swagger spec, because it is not 100% correct
const adjust = (doc: any) => {
  // remove duplicate scim endpoints
  delete doc.paths['/scim/health'];
  delete doc.paths['/scim/Users'];
  delete doc.paths['/scim/ServiceProviderConfig'];

  // MMS
  doc.components.schemas.CreateMMSMessage.properties.attachments = {
    description: 'Files to send',
    type: 'array',
    collectionFormat: 'multi',
    items: {
      type: 'file',
    },
  };

  // Support multiple attachments: https://git.ringcentral.com/platform/api-metadata-specs/issues/21
  const schema =
    doc.paths['/restapi/v1.0/account/{accountId}/extension/{extensionId}/fax']
      .post.requestBody.content['multipart/form-data'].schema;
  const sendFaxProps = schema.properties;
  schema.required = ['attachments', 'to'];
  const faxAttachment = sendFaxProps.attachment;
  faxAttachment.type = 'array';
  faxAttachment.collectionFormat = 'multi';
  faxAttachment.items = {type: 'file'};
  faxAttachment.name = 'attachments';
  sendFaxProps.attachments = sendFaxProps.attachment;
  delete sendFaxProps.attachment;
  const faxTo = sendFaxProps.to;
  if (faxTo.items.type === 'string') {
    delete faxTo.items.type;
    faxTo.items.$ref = '#/components/schemas/MessageStoreCalleeInfoRequest';
  }

  // https://jira.ringcentral.com/browse/PLD-337
  // https://github.com/ringcentral/RingCentral.Net/issues/12
  // Fax to name
  doc.components.schemas.MessageStoreCalleeInfoRequest = {
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

  // https://git.ringcentral.com/platform/api-metadata-specs/issues/48
  const p1 = doc.paths['/restapi/v1.0/account/{accountId}/greeting'].post;
  p1.parameters = p1.parameters.filter(
    (p: any) => p.name !== 'answeringRuleId'
  );
  p1.parameters.push({
    name: 'answeringRule',
    in: 'formData',
    $ref: '#/components/schemas/CustomCompanyGreetingAnsweringRuleInfo',
  });
  const p2 =
    doc.paths[
      '/restapi/v1.0/account/{accountId}/extension/{extensionId}/greeting'
    ].post;
  p2.parameters = p2.parameters.filter(
    (p: any) => p.name !== 'answeringRuleId'
  );
  p2.parameters.push({
    name: 'answeringRule',
    in: 'formData',
    $ref: '#/components/schemas/CustomGreetingAnsweringRuleInfoRequest',
  });
  doc.components.schemas.CustomCompanyGreetingAnsweringRuleInfo =
    doc.components.schemas.CustomGreetingAnsweringRuleInfoRequest = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
    };

  // https://jira.ringcentral.com/browse/PLD-696
  // anonymous schemas
  for (const dKey of Object.keys(doc.components.schemas)) {
    const properties = doc.components.schemas[dKey].properties;
    if (!properties) {
      continue;
    }
    for (const pKey of Object.keys(properties)) {
      let property = properties[pKey];
      if (!property.properties && property.items && property.items.properties) {
        property = property.items;
      }
      if (property.properties) {
        const newSchemaName = `${dKey}${
          pKey.charAt(0).toUpperCase() + pKey.slice(1)
        }`;
        doc.components.schemas[newSchemaName] = {
          type: 'object',
          properties: property.properties,
        };
        delete property.properties;
        property.$ref = `#/components/schemas/${newSchemaName}`;
      }
    }
  }

  // https://jira.ringcentral.com/browse/PLD-592
  // array as schemas
  // or string as schemas
  const specialTypes = Object.keys(doc.components.schemas).filter(key =>
    ['array', 'string'].includes(doc.components.schemas[key].type)
  );
  for (const pathKey of Object.keys(doc.paths)) {
    const path = doc.paths[pathKey];
    for (const operationKey of ['get', 'post', 'put', 'delete', 'patch']) {
      if (path[operationKey] === undefined) {
        continue;
      }
      const operation = path[operationKey];
      // responses
      for (const responseKey of Object.keys(operation.responses)) {
        const response = operation.responses[responseKey];
        if (
          response.content &&
          response.content['application/json'] &&
          response.content['application/json'].schema
        ) {
          const st = specialTypes.find(
            st =>
              response.content['application/json'].schema.$ref ===
              `#/components/schemas/${st}`
          );
          if (st) {
            response.content['application/json'].schema =
              doc.components.schemas[st];
          }
        }
      }
      // parameters
      for (const parameter of operation.parameters ?? []) {
        if (parameter.schema) {
          const st = specialTypes.find(
            st => parameter.schema.$ref === `#/components/schemas/${st}`
          );
          if (st) {
            parameter.schema = doc.components.schemas[st];
          }
        }
      }
    }
  }
  // schema properties
  for (const schema of Object.values<any>(doc.components.schemas)) {
    const properties = schema.properties || {};
    for (const propertyName of Object.keys(properties)) {
      const property = properties[propertyName];
      const st = specialTypes.find(
        st => property.$ref === `#/components/schemas/${st}`
      );
      if (st) {
        properties[propertyName] = doc.components.schemas[st];
      }
      if (property.type === 'array') {
        const st = specialTypes.find(
          st => property.items.$ref === `#/components/schemas/${st}`
        );
        if (st) {
          property.items = doc.components.schemas[st];
        }
      }
    }
  }
  for (const specialType of specialTypes) {
    delete doc.components.schemas[specialType];
  }

  // https://jira.ringcentral.com/browse/PLD-749
  // Add "WebSocket" to NotificationDeliveryModeRequest.transportType
  doc.components.schemas.NotificationDeliveryMode.properties.transportType.enum.push(
    'WebSocket'
  );

  // https://jira.ringcentral.com/browse/PLD-881
  doc.paths['/restapi/oauth/authorize'].post.requestBody.content[
    'application/x-www-form-urlencoded'
  ].schema.properties.discovery = {
    type: 'boolean',
    default: false,
  };

  const grantTypes =
    doc.paths['/restapi/oauth/token'].post.requestBody.content[
      'application/x-www-form-urlencoded'
    ].schema.properties.grant_type.enum;
  // https://wiki.ringcentral.com/display/PLAT/Partner+JWT+Authorization
  grantTypes.push('partner_jwt');

  // definition without properties
  const schemas = doc.components.schemas;
  for (const key of Object.keys(schemas)) {
    if (schemas[key].properties === undefined) {
      console.warn(`‼️ warning: ${key} has no properties.`);
      schemas[key].properties = {};
    }
  }

  // https://jira.ringcentral.com/browse/PLD-1029
  doc.components.schemas.MessageStatusCounts.properties.errorCodeCounts = {
    type: 'integer',
    format: 'int64',
  };

  // https://jira.ringcentral.com/browse/PLD-1072
  const backgroundImage = doc.components.schemas.BackgroundImage;
  const imageFillMode = doc.components.schemas.ImageFillMode;
  backgroundImage.properties.fillMode = {
    type: 'string',
    description: imageFillMode.description,
    enum: imageFillMode.anyOf[0].enum,
  };
  delete doc.components.schemas.ImageFillMode;

  const horizontalAlignment = doc.components.schemas.HorizontalAlignment;
  backgroundImage.properties.horizontalAlignment = {
    type: 'string',
    description: horizontalAlignment.description,
    enum: horizontalAlignment.anyOf[0].enum,
  };
  delete doc.components.schemas.HorizontalAlignment;

  const verticalAlignment = doc.components.schemas.VerticalAlignment;
  backgroundImage.properties.verticalAlignment = {
    type: 'string',
    description: verticalAlignment.description,
    enum: verticalAlignment.anyOf[0].enum,
  };
  delete doc.components.schemas.VerticalAlignment;

  const verticalContentAlignment =
    doc.components.schemas.VerticalContentAlignment;
  doc.components.schemas.GlipAdaptiveCardInfo.properties.verticalContentAlignment =
    doc.components.schemas.GlipAdaptiveCardRequest.properties.verticalContentAlignment =
      {
        type: 'string',
        description: verticalContentAlignment.description,
        enum: verticalContentAlignment.anyOf[0].enum,
      };
  delete doc.components.schemas.VerticalContentAlignment;

  // https://jira.ringcentral.com/browse/PLD-1073
  let backgroundImageProp =
    doc.components.schemas.GlipAdaptiveCardRequest.properties.backgroundImage;
  backgroundImageProp.type = 'object';
  backgroundImageProp.$ref = '#/components/schemas/BackgroundImage';
  delete backgroundImageProp.anyOf;
  delete backgroundImageProp.oneOf;
  backgroundImageProp =
    doc.components.schemas.GlipAdaptiveCardInfo.properties.backgroundImage;
  backgroundImageProp.type = 'object';
  backgroundImageProp.$ref = '#/components/schemas/BackgroundImage';
  delete backgroundImageProp.anyOf;
  delete backgroundImageProp.oneOf;

  // https://jira.ringcentral.com/browse/PLD-1177
  doc.paths['/restapi/v1.0/glip/files'].post.requestBody.content = {
    'multipart/form-data': {
      schema: {
        required: ['body'],
        properties: {
          body: {
            type: 'string',
            description: 'The file (binary or multipart/form-data) to upload',
            format: 'binary',
          },
        },
      },
    },
  };

  return doc;
};

export default adjust;