import { OpenAPIV3 } from 'openapi-types';
import * as R from 'ramda';

import { fixFax } from './fax';
import { fixGreeting } from './greeting';
import { fixInline } from './inline';

// Adjust swagger spec, because it is not 100% correct
const adjust = (doc: any) => {
  fixFax(doc);
  fixGreeting(doc);
  fixInline(doc);

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
