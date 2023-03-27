import { Field, Model, NamedSchema } from '../types';

const normalizeField = (field: Field): Field => {
  if (field.$ref) {
    field.$ref = field.$ref.split('/').slice(-1)[0];
  }
  if (field.type === 'file' || (field.type === 'string' && field.format === 'binary')) {
    field.$ref = 'Attachment';
    delete field.type;
    delete field.format;
  }
  if (field.items) {
    field.items = normalizeField(field.items);
  }
  return field;
};

export const normalize = (schemas: NamedSchema[]): Model[] => {
  return schemas.map((schema) => {
    const properties = schema.properties!;
    const fields = Object.keys(properties || {})
      .map((k) => ({
        ...(properties[k] as unknown as Field),
        name: k,
        required: schema.required?.includes(k),
      }))
      .map((f) => normalizeField(f));
    return {
      name: schema.name,
      description: schema.description,
      fields,
    };
  });
};
