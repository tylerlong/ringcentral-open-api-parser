import {OpenAPIV3} from 'openapi-types';

export type ParseResult = {
  models: Model[];
};

export type Model = {
  name: string;
  description?: string;
  fields: Field[];
};

export type Field = {
  name: string;
  type?: string;
  $ref?: string;
  description?: string;
  enum?: string[];
  example?: string;
  format?: string;
  items?: Field;
  default?: string | boolean;
  minimum?: number;
  maximum?: number;
  required?: boolean;
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
      ...(properties[k] as Field),
      name: k,
      required: schema.required?.includes(k),
    }));
    models.push({name, description: schema.description, fields});
  }
  models.push({
    name: 'Attachment',
    description: 'Attachment is a file to be uploaded',
    fields: [
      {
        name: 'filename',
        type: 'string',
        description: 'Filename with extension',
        example: 'example.png',
      },
      {
        name: 'content',
        type: 'byte[]',
        description: 'Binary content of the file',
        required: true,
      },
      {
        name: 'contentType',
        type: 'string',
        description: 'Content type of the file, such as "image/png"',
      },
    ],
  });
  return {models};
};
