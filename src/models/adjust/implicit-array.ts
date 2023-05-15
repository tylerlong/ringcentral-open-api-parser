import { NamedSchema } from '../../types';

export const implicitArray = (schemas: NamedSchema[]): NamedSchema[] => {
  for (const schema of schemas) {
    if (!('properties' in schema)) {
      continue;
    }
    for (const prop of Object.values(schema.properties!)) {
      if (!('type' in prop) && 'items' in prop) {
        (prop as any).type = 'array';
      }
    }
  }
  return schemas;
};
