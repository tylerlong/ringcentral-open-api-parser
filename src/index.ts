import {OpenAPIV3} from 'openapi-types';

export type ParseResult = {
  models: Model[];
};

export type Model = {
  name: string;
  fields: Field[];
};

export type Field = {
  name: string;
};

export type SchemaDict = {
  [key: string]: OpenAPIV3.SchemaObject;
};

export const parse = (doc: OpenAPIV3.Document): ParseResult => {
  const schemas = doc.components?.schemas as SchemaDict;
  const models: Model[] = [];
  for (const name of Object.keys(schemas)) {
    console.log(name);
    const schema = schemas[name];
    const properties = schema.properties as SchemaDict;
    const fields = Object.keys(properties).map(k => ({
      name: k,
      ...properties[k],
    }));
    models.push({name, fields});
  }
  return {models};
};
