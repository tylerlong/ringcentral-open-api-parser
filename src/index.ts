import {OpenAPIV3} from 'openapi-types';

export type ParseResult = {
  models: Model[];
};

export type Model = {
  name: string;
  fields: Field[];
};

export type Property = {
  type?: string;
  $ref?: string;
  description?: string;
  enum?: string[];
  example?: string;
  format?: string;
  items?: Property;
  default?: string | boolean;
  minimum?: number;
  maximum?: number;
  required?: boolean;
};

export type Field = Property & {
  name: string;
};

export type SchemaDict = {
  [key: string]: OpenAPIV3.SchemaObject;
};

export const parse = (doc: OpenAPIV3.Document): ParseResult => {
  const schemas = doc.components?.schemas as SchemaDict;
  const models: Model[] = [];
  for (const name of Object.keys(schemas)) {
    const schema = schemas[name];
    const properties = schema.properties as SchemaDict;
    const fields = Object.keys(properties).map(k => ({
      name: k,
      ...(properties[k] as Property),
    }));
    models.push({name, fields});
  }
  return {models};
};
