// This file is copied from the consolidate-api-specs project
import { OpenAPIV3 } from 'openapi-types';
import * as R from 'ramda';

// Adjust swagger spec, because it is not 100% correct
const adjust = (doc: any) => {
  // https://jira.ringcentral.com/browse/PLD-1239
  const schema =
    doc.paths['/restapi/v1.0/account/{accountId}/extension/{extensionId}/fax'].post.requestBody.content[
      'multipart/form-data'
    ].schema;
  const sendFaxProps = schema.properties;
  schema.required = ['attachments', 'to'];
  sendFaxProps.attachments = {
    type: 'array',
    items: { type: 'string', format: 'binary' },
  };
  delete sendFaxProps.attachment;
  const faxTo = sendFaxProps.to;
  if (faxTo.items.type === 'string') {
    delete faxTo.items.type;
    faxTo.items.$ref = '#/components/schemas/MessageStoreCalleeInfoRequest';
  }
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
  p1.parameters = p1.parameters.filter((p: any) => p.name !== 'answeringRuleId');
  p1.parameters.push({
    name: 'answeringRule',
    in: 'formData',
    $ref: '#/components/schemas/CustomCompanyGreetingAnsweringRuleInfo',
  });
  const p2 = doc.paths['/restapi/v1.0/account/{accountId}/extension/{extensionId}/greeting'].post;
  p2.parameters = p2.parameters.filter((p: any) => p.name !== 'answeringRuleId');
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
        const newSchemaName = `${dKey}${pKey.charAt(0).toUpperCase() + pKey.slice(1)}`;
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
  // special case: string + array
  doc.components.schemas.SearchDirectoryExtensionTypes.items = doc.components.schemas.SearchDirectoryExtensionType;
  const specialTypes = Object.keys(doc.components.schemas).filter((key) =>
    ['array', 'string'].includes(doc.components.schemas[key].type),
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
        if (response.content?.['application/json']?.schema) {
          const st = specialTypes.find(
            (st) => response.content['application/json'].schema.$ref === `#/components/schemas/${st}`,
          );
          if (st) {
            response.content['application/json'].schema = doc.components.schemas[st];
          }
        }
      }
      // parameters
      for (const parameter of operation.parameters ?? []) {
        if (parameter.schema) {
          const st = specialTypes.find((st) => parameter.schema.$ref === `#/components/schemas/${st}`);
          if (st) {
            parameter.schema = doc.components.schemas[st];
          }
          if (parameter.schema.type === 'array') {
            const st = specialTypes.find((st) => parameter.schema.items.$ref === `#/components/schemas/${st}`);
            if (st) {
              parameter.schema.items = doc.components.schemas[st];
            }
          }
        }
      }
      // request body
      if (operation.requestBody?.content) {
        const contentTypes = Object.keys(operation.requestBody.content);
        for (const contentType of contentTypes) {
          const content = operation.requestBody.content[contentType];
          if (content.schema?.properties) {
            const properties = content.schema.properties;
            const keys = Object.keys(properties);
            for (const key of keys) {
              const st = specialTypes.find((st) => properties[key].$ref === `#/components/schemas/${st}`);
              if (st) {
                properties[key] = doc.components.schemas[st];
              }
            }
          }
          if (content.schema?.$ref) {
            const st = specialTypes.find((st) => content.schema?.$ref === `#/components/schemas/${st}`);
            if (st) {
              content.schema = doc.components.schemas[st];
            }
          }
        }
      }
    }
  }
  // global parameters
  for (const p of Object.values<any>(doc.components.parameters)) {
    if (p.schema.$ref) {
      const rName = R.last(p.schema.$ref.split('/'));
      p.schema = doc.components.schemas[rName];
    }
    if (p.schema.items?.$ref) {
      const rName = R.last(p.schema.items?.$ref.split('/'));
      p.schema.items = doc.components.schemas[rName];
    }
  }
  // schema properties
  for (const schema of Object.values<any>(doc.components.schemas)) {
    const properties = schema.properties || {};
    for (const propertyName of Object.keys(properties)) {
      const property = properties[propertyName];
      const st = specialTypes.find((st) => property.$ref === `#/components/schemas/${st}`);
      if (st) {
        properties[propertyName] = doc.components.schemas[st];
      }
      if (property.type === 'array') {
        const st = specialTypes.find((st) => property.items.$ref === `#/components/schemas/${st}`);
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
  // doc.components.schemas.NotificationDeliveryMode.properties.transportType.enum.push(
  //   'WebSocket'
  // );

  // https://jira.ringcentral.com/browse/PLD-881
  doc.components.schemas.AuthorizeRequest.properties.discovery = {
    type: 'boolean',
    default: false,
  };

  const grantTypes = doc.components.schemas.GetTokenRequest.properties.grant_type.enum;
  // https://wiki.ringcentral.com/display/PLAT/Partner+JWT+Authorization
  grantTypes.push('partner_jwt');

  // https://jira.ringcentral.com/browse/PLD-1029
  doc.components.schemas.MessageStatusCounts.properties.errorCodeCounts = {
    type: 'integer',
    format: 'int64',
  };

  // https://jira.ringcentral.com/browse/PLD-1072
  // fix anyOf
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
  const verticalContentAlignment = doc.components.schemas.VerticalContentAlignment;
  doc.components.schemas.AdaptiveCardInfo.properties.verticalContentAlignment =
    doc.components.schemas.AdaptiveCardRequest.properties.verticalContentAlignment = {
      type: 'string',
      description: verticalContentAlignment.description,
      enum: verticalContentAlignment.anyOf[0].enum,
    };
  delete doc.components.schemas.VerticalContentAlignment;

  // https://jira.ringcentral.com/browse/PLD-1073
  let backgroundImageProp = doc.components.schemas.AdaptiveCardRequest.properties.backgroundImage;
  backgroundImageProp.type = 'object';
  backgroundImageProp.$ref = '#/components/schemas/BackgroundImage';
  delete backgroundImageProp.oneOf;
  backgroundImageProp = doc.components.schemas.AdaptiveCardInfo.properties.backgroundImage;
  backgroundImageProp.type = 'object';
  backgroundImageProp.$ref = '#/components/schemas/BackgroundImage';
  delete backgroundImageProp.oneOf;

  const schemas = doc.components.schemas;

  // // oneOf to allOf, as a workaround
  // schemas['Grouping'].allOf = schemas['Grouping'].oneOf;
  // delete schemas['Grouping'].oneOf;

  // merge allOf, oneOf and anyOf
  const mergeAllOf = (schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => {
    if (!(schema.allOf ?? schema.oneOf ?? schema.anyOf ?? false)) {
      return schema;
    }
    let properties = {};
    for (const item of schema.allOf ?? schema.oneOf ?? schema.anyOf ?? []) {
      if ('$ref' in item) {
        const refName = R.last(item.$ref.split('/'))!;
        properties = Object.assign(properties, mergeAllOf(schemas[refName]).properties);
      } else {
        properties = Object.assign(properties, (item as OpenAPIV3.SchemaObject).properties);
      }
    }
    return { type: 'object', properties };
  };
  for (const name of Object.keys(schemas)) {
    schemas[name] = mergeAllOf(schemas[name]);
  }

  // definition without properties
  for (const key of Object.keys(schemas)) {
    if (schemas[key].properties === undefined) {
      console.warn(`‼️ warning: ${key} has no properties.`);
      schemas[key].properties = {};
    }
  }

  // convert requestBody.$ref to inline
  for (const pathKey of Object.keys(doc.paths)) {
    const path = doc.paths[pathKey];
    for (const operationKey of ['get', 'post', 'put', 'delete', 'patch']) {
      if (path[operationKey] === undefined) {
        continue;
      }
      const operation = path[operationKey];
      if (operation.requestBody && (operation.requestBody as OpenAPIV3.ReferenceObject).$ref) {
        operation.requestBody =
          doc.components!.requestBodies![R.last((operation.requestBody as OpenAPIV3.ReferenceObject).$ref.split('/'))!];
      }
    }
  }

  return doc;
};

export default adjust;
