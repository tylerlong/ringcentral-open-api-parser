import { OpenAPIV3 } from 'openapi-types';

import { NamedSchema } from '../../types';

/**
 * we don't like properties of type `object`, because they should be a new model instead and we `$ref` them.
 * @param doc the OpenAPI document
 */
export const ref = (schemas: NamedSchema[]): NamedSchema[] => {
  for (const schema of schemas) {
    const properties = schema.properties;
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
      const name = `${schema.name}${propKey.charAt(0).toUpperCase() + propKey.slice(1)}`;
      schemas.push({
        type: 'object',
        properties: property.properties,
        name,
      });
      delete property.properties;
      delete property.type;
      (property as OpenAPIV3.ReferenceObject).$ref = `#/components/schemas/${name}`;
    }
  }
  return schemas;
};
