import { mergeWith, isArray, uniq } from 'lodash';

import { NamedSchema } from '../../types';

/**
 * How to merge arrays
 * @param objValue target array
 * @param srcValue source array
 * @returns two array contatenated and without duplicates
 */
function customizer(objValue: string[], srcValue: string[]) {
  if (isArray(objValue)) {
    return uniq(objValue.concat(srcValue));
  }
}

/**
 * merge allOf, anyOf, oneOf into properties
 * @param schemas schemas to be processed
 * @returns processed schemas
 */
export const mergeOf = (schemas: NamedSchema[]): NamedSchema[] => {
  const mergeOne = (schema: NamedSchema) => {
    const multi = schema.allOf ?? schema.anyOf ?? schema.oneOf;
    if (multi) {
      for (const item of multi) {
        if ('$ref' in item) {
          const name = (item.$ref as string).split('/').pop()!;
          mergeWith(schema, mergeOne(schemas.find((s) => s.name === name)!), { name: schema.name }, customizer);
        } else {
          mergeWith(schema, item, customizer);
        }
      }
      delete schema.allOf;
      delete schema.anyOf;
      delete schema.oneOf;
    }
    return schema;
  };
  for (const schema of schemas) {
    mergeOne(schema);
  }
  return schemas;
};
