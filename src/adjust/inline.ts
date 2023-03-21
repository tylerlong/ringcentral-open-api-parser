import { OpenAPIV3 } from 'openapi-types';

/**
 * Fix inline schemas
 * https://jira.ringcentral.com/browse/PLD-696
 * Each inline schema should be a separate schema, otherwise I cannot generate SDK definitions
 * @param doc the OpenAPI document
 */
export const fixInline = (doc: OpenAPIV3.Document) => {
  const schemas = doc.components!.schemas!;
  for (const schemaKey of Object.keys(schemas)) {
    const properties = (schemas[schemaKey] as OpenAPIV3.SchemaObject).properties;
    if (!properties) {
      continue;
    }
    for (const propKey of Object.keys(properties)) {
      let property = properties[propKey];
      if (!('properties' in property) && 'items' in property && 'properties' in property.items) {
        property = property.items;
      }
      if (!('properties' in property)) {
        continue;
      }
      const newSchemaName = `${schemaKey}${propKey.charAt(0).toUpperCase() + propKey.slice(1)}`;
      doc.components!.schemas![newSchemaName] = {
        type: 'object',
        properties: property.properties,
      };
      delete property.properties;
      (property as OpenAPIV3.ReferenceObject).$ref = `#/components/schemas/${newSchemaName}`;
    }
  }
};
